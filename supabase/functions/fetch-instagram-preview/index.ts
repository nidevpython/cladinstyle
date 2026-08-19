import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // CORS configuration
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Ensure request is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method Not Allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Instagram Post URL is required.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate Instagram URL format and extract post shortcode
    const shortcodeMatch = url.match(/(?:\/p\/|\/reel\/|\/reels\/)([A-Za-z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;
    if (!shortcode) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Please enter a valid Instagram post or reel URL.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const canonicalUrl = `https://www.instagram.com/p/${shortcode}/`;
    console.log("Normalized Instagram URL:", canonicalUrl);

    // Call Meta oEmbed API using secret META_ACCESS_TOKEN
    const metaToken = Deno.env.get("META_ACCESS_TOKEN");
    if (!metaToken) {
      console.warn(`[fetch-instagram-preview] META_ACCESS_TOKEN is not configured.`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'META_ACCESS_TOKEN is not configured in Supabase Secrets. Please configure it in your Supabase project settings to enable Graph API fetching.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Attempt to retrieve matching post media from the Instagram Graph API
    let mediaData = null;
    let responseStatus = 0;

    // 1. Try graph.instagram.com/me/media (Basic Display or Graph API for Personal/Creator)
    try {
      const graphUrl = `https://graph.instagram.com/me/media?fields=id,caption,permalink,media_url,thumbnail_url&limit=100&access_token=${metaToken}`;
      const response = await fetch(graphUrl);
      responseStatus = response.status;
      console.log("Meta API response status:", responseStatus);

      if (response.ok) {
        const payload = await response.json();
        mediaData = payload.data || [];
      } else {
        const errPayload = await response.json();
        console.error("[fetch-instagram-preview] graph.instagram.com error response:", errPayload);
      }
    } catch (err) {
      console.error("[fetch-instagram-preview] graph.instagram.com fetch failed:", err);
    }

    // 2. Try graph.facebook.com/v20.0/me/media as business account fallback
    if (!mediaData || mediaData.length === 0) {
      try {
        const fbGraphUrl = `https://graph.facebook.com/v20.0/me/media?fields=id,caption,permalink,media_url,thumbnail_url&limit=100&access_token=${metaToken}`;
        const response = await fetch(fbGraphUrl);
        responseStatus = response.status;
        console.log("FB Meta API response status:", responseStatus);

        if (response.ok) {
          const payload = await response.json();
          mediaData = payload.data || [];
        } else {
          const errPayload = await response.json();
          console.error("[fetch-instagram-preview] graph.facebook.com error response:", errPayload);
        }
      } catch (err) {
        console.error("[fetch-instagram-preview] graph.facebook.com fetch failed:", err);
      }
    }

    // Find the media item matching the shortcode
    if (mediaData && Array.isArray(mediaData)) {
      const matchedMedia = mediaData.find(item => item.permalink && item.permalink.includes(shortcode));

      if (matchedMedia) {
        console.log("Resolved media:", matchedMedia);
        const resolvedImageUrl = matchedMedia.thumbnail_url || matchedMedia.media_url || null;

        if (resolvedImageUrl) {
          return new Response(JSON.stringify({
            success: true,
            image_url: resolvedImageUrl,
            instagram_url: canonicalUrl,
            caption: matchedMedia.caption || ''
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unable to retrieve Instagram media. Please verify that the Instagram account/media is accessible through the configured Meta API.' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error(`[fetch-instagram-preview] Execution error:`, err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unable to retrieve Instagram media. Please verify that the Instagram account/media is accessible through the configured Meta API.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
