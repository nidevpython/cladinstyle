import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Edit, Trash2, X, AlertTriangle, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminProducts() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug');
      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          product_images(image_url, is_primary),
          product_sizes(size, stock)
        `)
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      const mapped = (prodData || []).map(p => {
        const sortedImages = p.product_images || [];
        const primaryImg = sortedImages.find(img => img.is_primary)?.image_url || sortedImages[0]?.image_url || '';
        return {
          id: p.id,
          name: p.name,
          category: p.categories?.name || 'Uncategorized',
          categorySlug: p.categories?.slug || '',
          price: Number(p.price),
          oldPrice: p.old_price ? Number(p.old_price) : null,
          stock: p.total_stock || 0,
          sku: p.sku || '',
          isActive: p.is_active,
          isFeatured: p.featured,
          image: primaryImg,
          imagesRaw: sortedImages
        };
      });

      setProducts(mapped);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products in memory
  const filteredProducts = products.filter(p => {
    // 1. Search term (Name or SKU)
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Category
    const matchesCategory = categoryFilter === 'all' || p.categorySlug === categoryFilter;

    // 3. Status
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && p.isActive) || 
                         (statusFilter === 'inactive' && !p.isActive);

    // 4. Stock
    let matchesStock = true;
    if (stockFilter === 'out') matchesStock = p.stock === 0;
    else if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (stockFilter === 'in') matchesStock = p.stock > 5;

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Trigger search reset on page reset
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Open delete modal
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Confirm product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);

    try {
      // 1. Get associated images to delete from Storage bucket
      const imagesToDelete = productToDelete.imagesRaw || [];
      
      // Delete images from Supabase Storage
      for (const img of imagesToDelete) {
        if (img.image_url) {
          // Extract filename from URL (e.g. from https://url.supabase.co/.../product-images/filename.jpg)
          const urlParts = img.image_url.split('/product-images/');
          if (urlParts.length > 1) {
            const filename = urlParts[1];
            await supabase.storage.from('product-images').remove([filename]);
          }
        }
      }

      // 2. Delete product from database
      // Related images and sizes will cascade delete due to ON DELETE CASCADE database rules
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      showToast(`Product "${productToDelete.name}" deleted successfully.`);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Deletion error:', err);
      showToast('Deletion failed: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return 'text-red-700 bg-red-50 border-red-200';
    if (stock <= 5) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-green-700 bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
            Products
          </h1>
          <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
            Manage your boutique clothing catalog, prices, categories, and flags.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-5 py-3 hover:bg-accent transition-colors rounded-[3px] shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-beige p-4 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
        
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Search Catalog</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Product Name, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cream/35 border border-beige pl-9 pr-4 py-2.5 text-xs outline-none focus:border-black transition-colors rounded-[3px]"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white border border-beige px-3 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-semibold"
          >
            <option value="all">All Categories</option>
            <option value="baby">Baby</option>
            <option value="women">Women</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-beige px-3 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Stock Level</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full bg-white border border-beige px-3 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-semibold"
          >
            <option value="all">All Stock Levels</option>
            <option value="in">In Stock (&gt;5)</option>
            <option value="low">Low Stock (1-5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-beige rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden">
        
        {loading ? (
          /* Table loading skeleton rows */
          <div className="divide-y divide-cream animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-white flex items-center justify-between px-6" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-black/50 uppercase tracking-widest">
            {error}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-cream/45 border-b border-beige text-[9px] font-bold uppercase tracking-widest text-black/60">
                  <th className="px-6 py-4 w-20">Image</th>
                  <th className="px-6 py-4">Product details</th>
                  <th className="px-6 py-4 w-28">Category</th>
                  <th className="px-6 py-4 w-28">Price</th>
                  <th className="px-6 py-4 w-28">Old Price</th>
                  <th className="px-6 py-4 w-24">Stock</th>
                  <th className="px-6 py-4 w-24">Status</th>
                  <th className="px-6 py-4 w-20 text-center">Featured</th>
                  <th className="px-6 py-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {paginatedProducts.map(p => (
                  <tr key={p.id} className="hover:bg-cream/10 text-xs">
                    {/* Image Column */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-12.5 bg-cream border border-beige overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-black/25 uppercase">CIS</div>
                        )}
                      </div>
                    </td>

                    {/* Product Name / SKU Column */}
                    <td className="px-6 py-4">
                      <span className="block font-bold text-black text-[12px]">{p.name}</span>
                      <span className="block text-[9px] font-bold text-black/40 uppercase tracking-wider mt-0.5">SKU: {p.sku || 'N/A'}</span>
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-black/80">{p.category}</span>
                    </td>

                    {/* Price Column */}
                    <td className="px-6 py-4">
                      <span className="font-black text-black">₹{p.price.toLocaleString()}</span>
                    </td>

                    {/* Old Price Column */}
                    <td className="px-6 py-4">
                      {p.oldPrice ? (
                        <span className="text-black/40 line-through">₹{p.oldPrice.toLocaleString()}</span>
                      ) : (
                        <span className="text-black/25 font-bold uppercase text-[9px]">-</span>
                      )}
                    </td>

                    {/* Stock Column */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 border text-[9px] font-bold tracking-wider rounded-[2px] ${getStockBadge(p.stock)}`}>
                        {p.stock === 0 ? '0 OUT' : p.stock <= 5 ? `${p.stock} LOW` : `${p.stock} IN`}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 font-bold tracking-wider text-[9px] uppercase ${p.isActive ? 'text-green-700' : 'text-black/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-700' : 'bg-black/30'}`} />
                        <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>

                    {/* Featured Column */}
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold tracking-wider text-[9px] uppercase ${p.isFeatured ? 'text-accent' : 'text-black/20'}`}>
                        {p.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 border border-beige hover:border-black text-black/60 hover:text-black transition-colors rounded-[2px]"
                          title="Edit Product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="p-1.5 border border-beige hover:border-accent text-black/60 hover:text-accent transition-colors rounded-[2px]"
                          title="Delete Product"
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
          <div className="py-20 text-center text-xs text-black/50 uppercase tracking-widest font-serif leading-loose">
            No products found.
          </div>
        )}

        {/* Table Footer / Pagination */}
        {!loading && filteredProducts.length > itemsPerPage && (
          <div className="bg-cream/20 border-t border-beige px-6 py-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-black/45 uppercase tracking-wider">
              Page {currentPage} of {totalPages} ({filteredProducts.length} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-beige hover:border-black disabled:opacity-30 disabled:hover:border-beige transition-colors rounded-[2px]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-beige hover:border-black disabled:opacity-30 disabled:hover:border-beige transition-colors rounded-[2px]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. CONFIRMATION DELETION DIALOG MODAL */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
          {/* Overlay */}
          <div onClick={() => setDeleteModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          
          {/* Modal Box */}
          <div className="relative bg-white border border-beige max-w-md w-full p-6 md:p-8 text-center shadow-2xl rounded-[3px] animate-slideup">
            <AlertTriangle className="h-10 w-10 text-accent mx-auto mb-4 animate-bounce" />
            
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-black mb-2">
              Delete Product?
            </h3>
            
            <p className="text-xs text-black/60 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-black font-semibold">"{productToDelete.name}"</strong>? This will remove all sizes, stocks, and images. This action cannot be undone.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="border border-black text-black text-[10px] font-bold tracking-widest uppercase py-3 hover:bg-cream transition-colors rounded-[3px] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="bg-accent text-white text-[10px] font-bold tracking-widest uppercase py-3 hover:bg-accent/90 transition-colors rounded-[3px] disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
