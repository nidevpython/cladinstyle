import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';

export default function InstagramFeed() {
  const { instagramConfig } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [failedImageIds, setFailedImageIds] = useState(new Set());

  // Track console output on post changes
  useEffect(() => {
    console.log("Instagram posts:", posts);
  }, [posts]);

  const handleImageError = (postId) => {
    setFailedImageIds(prev => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Execute the exact query: active posts with non-null and non-empty image URLs
        const { data, error: dbErr } = await supabase
          .from('instagram_posts')
          .select('*')
          .eq('is_active', true)
          .not('image_url', 'is', null)
          .neq('image_url', '')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (dbErr) throw dbErr;

        const mappedPosts = (data || []).map(post => ({
          id: post.id.toString(),
          image: post.image_url,
          permalink: post.permalink || '',
          caption: post.caption || ''
        }));

        setPosts(mappedPosts);
      } catch (err) {
        console.error('Error loading instagram posts from Supabase:', err);
        setError(err.message || 'Unable to retrieve Instagram posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  // Frame Loop Scroll Handler (Auto-slide animation)
  useEffect(() => {
    if (!instagramConfig.autoSlide || loading || posts.length === 0 || isDragging || isHovered) return;

    let frameId;
    const container = containerRef.current;

    const scroll = () => {
      if (container) {
        container.scrollLeft += instagramConfig.slideSpeed;
        // Seamless reset when scrolling past half (since list is duplicated)
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      frameId = requestAnimationFrame(scroll);
    };

    frameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frameId);
  }, [instagramConfig.autoSlide, instagramConfig.slideSpeed, loading, posts, isDragging, isHovered]);

  // Mouse Drag / Touch Swipe Handlers
  const startDrag = (pageX) => {
    setIsDragging(true);
    startXRef.current = pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const moveDrag = (pageX) => {
    if (!isDragging) return;
    const x = pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  // Duplicate posts list to support seamless infinite marquee looping
  const displayPosts = [...posts, ...posts];

  return (
    <section className="max-w-[1320px] mx-auto px-5 py-12 md:py-20 text-center relative overflow-hidden">
      
      {/* Headings block */}
      <div className="reveal-heading-center mb-8">
        <span className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">
          Inspired by you
        </span>
        <h3 className="font-serif text-xl md:text-22px font-bold tracking-wider uppercase mt-1 text-black">
          @clad_in_style_cis
        </h3>
        <p className="text-[11px] text-black/40 mt-1 font-sans">
          A little inspiration from our world.
        </p>
        <a 
          href={instagramConfig?.profileUrl || 'https://www.instagram.com/clad_in_style_cis/'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[9px] font-bold tracking-widest uppercase border-b border-black pb-0.5 mt-4 inline-block hover:text-accent hover:border-accent transition-colors"
        >
          Follow us on Instagram →
        </a>
      </div>

      {loading ? (
        // Elegant Skeleton Loaders
        <div className="flex gap-3 md:gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div 
              key={idx} 
              className="w-[calc(50%-6px)] sm:w-[calc(33.333%-10.66px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-13.33px)] shrink-0 aspect-square bg-cream animate-pulse border border-beige"
            />
          ))}
        </div>
      ) : error ? (
        // Error Display Block
        <div className="py-6 px-4 border border-red-200 bg-red-50 text-red-800 rounded-[3px] max-w-lg mx-auto flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider">Database Connection Error</p>
          <p className="text-[10px] text-red-600 font-medium leading-relaxed">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        // Empty State Block (Section stays visible, shows CTA)
        <div className="py-12 border border-beige bg-cream/10 rounded-[3px] flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto">
          <p className="text-xs text-black/50 uppercase tracking-widest font-bold">
            Discover our latest styles and collections.
          </p>
          <a 
            href={instagramConfig?.profileUrl || 'https://www.instagram.com/clad_in_style_cis/'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 bg-black text-white text-[9px] font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-accent transition-colors rounded-[2px] shadow-sm"
          >
            FOLLOW US ON INSTAGRAM →
          </a>
        </div>
      ) : (
        // Infinite Drag/Swipe Carousel
        <div 
          ref={containerRef}
          onMouseDown={(e) => startDrag(e.pageX)}
          onMouseMove={(e) => moveDrag(e.pageX)}
          onMouseUp={endDrag}
          onTouchStart={(e) => startDrag(e.touches[0].pageX)}
          onTouchMove={(e) => moveDrag(e.touches[0].pageX)}
          onTouchEnd={endDrag}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { endDrag(); setIsHovered(false); setIsDragging(false); }}
          className="flex gap-3 md:gap-4 overflow-x-auto select-none no-scrollbar cursor-grab active:cursor-grabbing w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayPosts.map((post, idx) => (
            <a 
              key={`${post.id}-${idx}`}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[calc(50%-6px)] sm:w-[calc(33.333%-10.66px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-13.33px)] shrink-0 aspect-square overflow-hidden bg-cream border border-beige relative group block"
            >
              <img 
                src={failedImageIds.has(post.id) ? 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop' : post.image} 
                alt={post.caption || 'Instagram Post'} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable="false"
                onError={() => handleImageError(post.id)}
              />
              
              {/* Instagram Hover Card Overlay */}
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <svg className="h-5 w-5 text-white mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <path d="M17.5 6.5h.01" />
                </svg>
                <span className="text-[8px] font-bold text-white tracking-widest uppercase">
                  View on Instagram →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

    </section>
  );
}
