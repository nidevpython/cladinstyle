import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, AlertTriangle, Check } from 'lucide-react';

export default function AdminCategories() {
  const { showToast } = useApp();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete Warning Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (catErr) throw catErr;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openFormModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setIsActive(category.is_active);
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setIsActive(true);
    }
    setFormOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) {
      showToast('Please fill in name and slug.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        slug,
        is_active: isActive
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        showToast(`Category "${name}" updated.`);
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(payload);
        
        if (error) throw error;
        showToast(`Category "${name}" added successfully.`);
      }

      setFormOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Save category error:', err);
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      showToast(`Category "${category.name}" active status updated.`);
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, is_active: !c.is_active } : c));
    } catch (err) {
      showToast('Status update failed: ' + err.message, 'error');
    }
  };

  const openDeleteDialog = async (category) => {
    setCategoryToDelete(category);
    try {
      // Check if there are products associated with this category
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);
      
      if (error) throw error;
      
      setProductCount(count || 0);
      setDeleteDialogOpen(true);
    } catch (err) {
      showToast('Unable to check category associations: ' + err.message, 'error');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    if (productCount > 0) {
      showToast('Cannot delete category: it is still referenced by active products.', 'error');
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) throw error;
      showToast(`Category "${categoryToDelete.name}" deleted.`);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-[800px] mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
            Categories
          </h1>
          <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
            Define classification sections for baby and women boutique apparel.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 hover:bg-accent transition-colors rounded-[3px]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories table card */}
      <div className="bg-white border border-beige rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-cream animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white flex items-center justify-between px-6" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-black/50 uppercase tracking-widest">
            {error}
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/45 border-b border-beige text-[9px] font-bold uppercase tracking-widest text-black/60">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-cream/10 text-xs">
                    <td className="px-6 py-4">
                      <span className="font-bold text-black text-[12.5px]">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-black/60 text-[11px]">{cat.slug}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 font-bold tracking-wider text-[9px] uppercase transition-colors ${
                          cat.is_active ? 'text-green-700 hover:text-green-800' : 'text-black/40 hover:text-black'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? 'bg-green-700' : 'bg-black/30'}`} />
                        <span>{cat.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => openFormModal(cat)}
                          className="p-1.5 border border-beige hover:border-black text-black/60 hover:text-black transition-colors rounded-[2px]"
                          title="Edit Category"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(cat)}
                          className="p-1.5 border border-beige hover:border-accent text-black/60 hover:text-accent transition-colors rounded-[2px]"
                          title="Delete Category"
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
        ) : (
          <div className="py-16 text-center text-xs text-black/50 uppercase tracking-widest font-serif">
            No categories defined.
          </div>
        )}
      </div>

      {/* Category Creation / Editing Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
          <div onClick={() => setFormOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          
          <form
            onSubmit={handleFormSubmit}
            className="relative bg-white border border-beige max-w-sm w-full p-6 md:p-8 shadow-2xl rounded-[3px] space-y-4 animate-slideup"
          >
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Baby Wear"
                className="w-full bg-cream/35 border border-beige px-3 py-2 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1">Category Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="baby-wear"
                className="w-full bg-cream/35 border border-beige px-3 py-2 text-xs outline-none focus:border-black rounded-[3px] font-mono"
              />
            </div>

            <label className="flex items-center gap-2.5 bg-cream/25 border border-beige p-2.5 rounded-[3px] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="hidden"
              />
              <span className={`w-4 h-4 border border-beige flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-green-700 border-green-700 text-white' : 'bg-white'
              }`}>
                {isActive && '✓'}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-green-800">Publish Active</span>
            </label>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="border border-black text-black text-[10px] font-bold tracking-widest uppercase py-2.5 hover:bg-cream transition-colors rounded-[3px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white text-[10px] font-bold tracking-widest uppercase py-2.5 hover:bg-accent transition-colors rounded-[3px] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Category Warning Dialog */}
      {deleteDialogOpen && categoryToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
          <div onClick={() => setDeleteDialogOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          
          <div className="relative bg-white border border-beige max-w-sm w-full p-6 md:p-8 text-center shadow-2xl rounded-[3px] animate-slideup">
            <AlertTriangle className="h-10 w-10 text-accent mx-auto mb-4 animate-bounce" />
            
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-2">
              Delete Category?
            </h3>
            
            {productCount > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-black/60 leading-relaxed">
                  The category <strong className="text-black font-semibold">"{categoryToDelete.name}"</strong> is currently referenced by <strong className="text-accent font-bold">{productCount} products</strong>.
                </p>
                <div className="p-3 bg-accent/5 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-wider rounded-[2px]">
                  ✗ Delete is disabled. Please re-assign those products to another category first.
                </div>
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3 hover:bg-black/90 transition-colors rounded-[3px]"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-black/60 leading-relaxed mb-6">
                  Are you sure you want to delete <strong className="text-black font-semibold">"{categoryToDelete.name}"</strong>? This action cannot be undone.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleting}
                    className="border border-black text-black text-[10px] font-bold tracking-widest uppercase py-2.5 hover:bg-cream transition-colors rounded-[3px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCategory}
                    disabled={deleting}
                    className="bg-accent text-white text-[10px] font-bold tracking-widest uppercase py-2.5 hover:bg-accent/90 transition-colors rounded-[3px]"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
