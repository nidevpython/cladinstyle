import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Loader, 
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';

export default function AdminInstagram() {
  const { showToast } = useApp();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
  const [permalink, setPermalink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Fetch Instagram posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbErr } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (dbErr) throw dbErr;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching instagram posts:', err);
      setError('Unable to load Instagram posts from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Open modal for adding
  const handleAddClick = () => {
    setEditingPost(null);
    setPermalink('');
    setImageUrl('');
    setCaption('');
    setFetchError(null);
    setDisplayOrder(posts.length > 0 ? Math.max(...posts.map(p => p.display_order)) + 10 : 10);
    setIsActive(true);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (post) => {
    setEditingPost(post);
    const postUrl = post.permalink || '';
    setPermalink(postUrl);
    setImageUrl(post.image_url || '');
    setCaption(post.caption || '');
    setFetchError(null);
    setDisplayOrder(post.display_order);
    setIsActive(post.is_active);
    setShowModal(true);
  };

  // Validate Instagram URL format
  const isValidInstagramUrl = (str) => {
    try {
      const parsed = new URL(str);
      return parsed.hostname.includes('instagram.com') && 
        (parsed.pathname.includes('/p/') || parsed.pathname.includes('/reel/') || parsed.pathname.includes('/reels/'));
    } catch (_) {
      return false;
    }
  };

  // Fetch Instagram Post Preview
  const handleFetchPreview = async () => {
    setFetchError(null);
    const cleanedUrl = permalink.trim();
    
    if (!cleanedUrl) {
      setFetchError('Instagram Post URL is required.');
      return;
    }
    if (!isValidInstagramUrl(cleanedUrl)) {
      setFetchError('Please enter a valid public Instagram post or reel URL (e.g., https://www.instagram.com/p/DB0P5y-N4a1/).');
      return;
    }

    setFetchingPreview(true);
    try {
      console.log("Instagram URL:", cleanedUrl);
      console.log('Edge Function request started for URL:', cleanedUrl);
      
      const { data, error: invokeErr } = await supabase.functions.invoke('fetch-instagram-preview', {
        body: { url: cleanedUrl }
      });

      if (invokeErr) {
        console.log('Edge Function response status:', invokeErr.status || 'unknown');
        console.error('Edge Function invocation error:', invokeErr);
        
        // Differentiate connection/deployment failures from metadata errors
        const isConnectionErr = !invokeErr.status || 
                                invokeErr.status === 404 || 
                                invokeErr.message?.includes('Failed to send a request') ||
                                invokeErr.message?.includes('Failed to fetch') ||
                                invokeErr.message?.includes('network error');

        if (isConnectionErr) {
          setFetchError('Metadata service not deployed, not accessible, or blocked by CORS. Please run "supabase functions deploy fetch-instagram-preview" and configure META_ACCESS_TOKEN if needed.');
        } else {
          setFetchError('Unable to retrieve the public image from this Instagram post.');
        }
        return;
      }

      console.log('Edge Function response status: 200');
      console.log('Edge Function response body:', data);
      console.log("Instagram fetch response:", data);

      if (data && data.success && data.image_url) {
        console.log('Parsed image URL:', data.image_url);
        setImageUrl(data.image_url);

        if (data.caption && !caption) {
          setCaption(data.caption);
        }
        showToast('Successfully retrieved Instagram post details!');
      } else {
        setFetchError('Unable to retrieve the public image from this Instagram post.');
      }
    } catch (err) {
      console.error('Failed to resolve Instagram post preview:', err);
      setFetchError('Unable to retrieve the public image from this Instagram post.');
    } finally {
      setFetchingPreview(false);
    }
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!permalink.trim()) {
      showToast('Instagram Post URL is required', 'error');
      return;
    }
    if (!isValidInstagramUrl(permalink.trim())) {
      showToast('Please enter a valid Instagram post URL', 'error');
      return;
    }
    if (!imageUrl) {
      showToast('Please fetch a valid Instagram post image before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        permalink: permalink.trim(),
        image_url: imageUrl.trim(),
        caption: caption.trim() || "",
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
        updated_at: new Date().toISOString()
      };

      if (editingPost) {
        // Update
        const { error: updErr } = await supabase
          .from('instagram_posts')
          .update(payload)
          .eq('id', editingPost.id);

        if (updErr) throw updErr;
        showToast('Instagram post updated successfully.');
      } else {
        // Insert
        const { error: insErr } = await supabase
          .from('instagram_posts')
          .insert(payload);

        if (insErr) throw insErr;
        showToast('Instagram post added successfully.');
      }

      setShowModal(false);
      fetchPosts();
    } catch (err) {
      console.error('Save failed:', err);
      showToast(err.message || 'Failed to save post.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status inline
  const handleToggleActive = async (post) => {
    try {
      const { error: updErr } = await supabase
        .from('instagram_posts')
        .update({ is_active: !post.is_active, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      if (updErr) throw updErr;
      
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_active: !p.is_active } : p));
      showToast(`Post ${!post.is_active ? 'enabled' : 'disabled'} successfully.`);
    } catch (err) {
      console.error('Toggle active status failed:', err);
      showToast('Failed to update status.', 'error');
    }
  };

  // Delete Instagram post
  const handleDeletePost = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this Instagram post?');
    if (!confirmDelete) return;

    try {
      const { error: delErr } = await supabase
        .from('instagram_posts')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;

      showToast('Instagram post deleted successfully.');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete post.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-beige">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-black">
            Instagram Feed
          </h1>
          <p className="text-xs text-black/50 font-medium uppercase tracking-wider mt-1">
            Manage Homepage Instagram Marquee Grid
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-5 py-3 hover:bg-accent transition-colors rounded-[2px]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Post</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader className="h-6 w-6 animate-spin text-accent" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-black/40">Loading posts...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 text-center text-red-800 rounded-[3px] space-y-3">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />
          <h4 className="font-serif text-sm font-bold uppercase">Database Error</h4>
          <p className="text-xs max-w-md mx-auto leading-relaxed">{error}</p>
          <button 
            onClick={fetchPosts}
            className="text-[9px] font-bold uppercase tracking-widest bg-red-800 text-white px-4 py-2 hover:bg-red-900 transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-beige p-12 text-center rounded-[3px] space-y-4">
          <p className="text-xs text-black/50">
            No Instagram posts found in your database. Active posts will render in the homepage marquee slider.
          </p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-1.5 border border-black text-black text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-black hover:text-white transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Create Your First Post</span>
          </button>
        </div>
      ) : (
        /* Posts Table Grid */
        <div className="bg-white border border-beige rounded-[3px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-cream/45 border-b border-beige text-[9px] font-bold uppercase tracking-widest text-black/60">
                  <th className="py-4 px-6 w-[80px]">Preview</th>
                  <th className="py-4 px-6">Caption / Link</th>
                  <th className="py-4 px-6 w-[120px] text-center">Display Order</th>
                  <th className="py-4 px-6 w-[120px] text-center">Status</th>
                  <th className="py-4 px-6 w-[120px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-cream/15 transition-colors text-xs">
                    
                    {/* Thumbnail Image */}
                    <td className="py-4 px-6">
                      <div className="w-14 h-14 bg-cream border border-beige rounded-[2px] overflow-hidden">
                        <img 
                          src={post.image_url} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop';
                          }}
                        />
                      </div>
                    </td>

                    {/* Caption / Link */}
                    <td className="py-4 px-6 space-y-1">
                      <p className="font-semibold text-black line-clamp-2 pr-10">
                        {post.caption || <span className="text-black/30 italic">No caption provided</span>}
                      </p>
                      <a 
                        href={post.permalink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-accent tracking-wider uppercase hover:underline"
                      >
                        <span>View Instagram Post</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>

                    {/* Display Order */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-2.5 py-1 bg-cream/70 text-black border border-beige/65 rounded-[2px] font-mono font-bold text-[10px]">
                        {post.display_order}
                      </span>
                    </td>

                    {/* Active/Inactive Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(post)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer border ${
                          post.is_active
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                            : 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100/70'
                        }`}
                      >
                        {post.is_active ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(post)}
                          className="p-2 border border-beige hover:border-black text-black rounded-[2px] transition-colors cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 border border-red-200 hover:border-red-600 text-red-600 hover:bg-red-50 rounded-[2px] transition-colors cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DIALOG FORM (ADD / EDIT) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-beige rounded-[3px] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-beige flex justify-between items-center bg-cream/35">
              <div>
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black">
                  {editingPost ? 'Edit Instagram Post' : 'Add Instagram Post'}
                </h3>
                <p className="text-[9px] text-black/50 font-bold uppercase tracking-wider mt-0.5">
                  Paste the post link to auto-fetch details
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-cream text-black/50 hover:text-black rounded transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
              
              {/* Instagram Post URL (permalink) */}
              <div className="space-y-1.5">
                <label className="block text-[9.5px] font-bold text-black/65 uppercase tracking-wider">
                  Instagram Post URL *
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={permalink}
                    onChange={(e) => setPermalink(e.target.value)}
                    placeholder="https://www.instagram.com/p/XXXXXXXX/"
                    className="flex-1 text-xs border border-beige p-2.5 focus:border-black outline-none rounded-[2px] font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleFetchPreview}
                    disabled={fetchingPreview}
                    className="bg-black text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-accent transition-colors rounded-[2px] inline-flex items-center gap-1.5"
                  >
                    {fetchingPreview ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    <span>{fetchingPreview ? 'Fetching...' : 'Fetch Post'}</span>
                  </button>
                </div>
                {fetchError && (
                  <p className="text-[10px] text-red-600 font-semibold leading-relaxed">
                    {fetchError}
                  </p>
                )}
              </div>

              {/* Image Live Preview Container */}
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-black/40 uppercase tracking-widest">
                  Live Preview
                </span>
                <div className="w-full aspect-[16/9] border border-beige border-dashed rounded-[2px] bg-cream/15 flex items-center justify-center overflow-hidden relative">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Instagram Content Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = '<span class="text-[9px] font-bold uppercase text-red-800 p-4 text-center">Invalid image resource loaded</span>';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      {fetchingPreview ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader className="h-5 w-5 animate-spin text-accent" />
                          <span className="text-[9px] font-bold text-black/45 uppercase tracking-wider">Retrieving Instagram Image...</span>
                        </div>
                      ) : (
                        <>
                          <span className="block text-[9px] font-bold text-black/35 uppercase tracking-wider">No Image Preview Available</span>
                          <span className="block text-[8px] text-black/30 font-medium uppercase mt-0.5">Click "Fetch Post" to load preview</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="block text-[9.5px] font-bold text-black/65 uppercase tracking-wider">
                  Caption (Optional)
                </label>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share a short summary or description of the post..."
                  className="w-full text-xs border border-beige p-2.5 focus:border-black outline-none rounded-[2px] font-sans h-20 resize-none"
                />
              </div>

              {/* Grid: Display Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Display Order */}
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-black/65 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input 
                    type="number" 
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full text-xs border border-beige p-2.5 focus:border-black outline-none rounded-[2px] font-sans font-mono"
                    required
                  />
                </div>

                {/* Status Switch */}
                <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4.5 w-4.5 border-beige accent-black cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-black/65 uppercase tracking-wider">
                      Active status
                    </span>
                  </label>
                </div>

              </div>

            </form>

            {/* Modal Footer */}
            <div className="p-4 bg-cream/35 border-t border-beige flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border border-beige text-black text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-cream hover:border-black transition-colors rounded-[2px]"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-black text-white text-[9px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors rounded-[2px] inline-flex items-center gap-1"
              >
                {saving && <Loader className="h-3 w-3 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save Post'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
