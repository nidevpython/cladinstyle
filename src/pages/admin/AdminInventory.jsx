import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Search, Check, Save } from 'lucide-react';

export default function AdminInventory() {
  const { showToast } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state for size stock
  // Map of product_id -> { size_name: new_stock }
  const [editedStocks, setEditedStocks] = useState({});
  const [updatingIds, setUpdatingIds] = useState([]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: invErr } = await supabase
        .from('products')
        .select(`
          id,
          name,
          total_stock,
          sku,
          categories(name),
          product_sizes(id, size, stock)
        `)
        .order('name', { ascending: true });

      if (invErr) throw invErr;

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Unable to load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId, sizeName, value) => {
    const numVal = Math.max(0, parseInt(value) || 0);
    setEditedStocks(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [sizeName]: numVal
      }
    }));
  };

  const getStockValue = (product, sizeName) => {
    // Check if edited first
    if (editedStocks[product.id] && editedStocks[product.id][sizeName] !== undefined) {
      return editedStocks[product.id][sizeName];
    }
    // Fallback to original
    const szObj = product.product_sizes?.find(s => s.size === sizeName);
    return szObj ? szObj.stock : 0;
  };

  const hasChanges = (product) => {
    const edits = editedStocks[product.id];
    if (!edits) return false;

    // Check if any size stock in edits differs from original
    return Object.keys(edits).some(sz => {
      const origSz = product.product_sizes?.find(s => s.size === sz);
      const origStock = origSz ? origSz.stock : 0;
      return edits[sz] !== origStock;
    });
  };

  const handleSaveStock = async (product) => {
    const edits = editedStocks[product.id];
    if (!edits) return;

    setUpdatingIds(prev => [...prev, product.id]);
    try {
      // 1. Update each edited size stock in product_sizes
      for (const sizeName of Object.keys(edits)) {
        const newStock = edits[sizeName];
        
        // Find DB record ID
        const szRecord = product.product_sizes?.find(s => s.size === sizeName);
        if (szRecord) {
          const { error: updErr } = await supabase
            .from('product_sizes')
            .update({ stock: newStock })
            .eq('id', szRecord.id);
          
          if (updErr) throw updErr;
        } else {
          // If size didn't exist, insert it (custom size fallback)
          const { error: insErr } = await supabase
            .from('product_sizes')
            .insert({
              product_id: product.id,
              size: sizeName,
              stock: newStock
            });
          if (insErr) throw insErr;
        }
      }

      // 2. Recalculate total stock
      // Sum the current stocks in local edits and unchanged sizes
      let totalStock = 0;
      const allSizesSet = new Set([
        ...(product.product_sizes?.map(s => s.size) || []),
        ...Object.keys(edits)
      ]);

      allSizesSet.forEach(szName => {
        if (edits[szName] !== undefined) {
          totalStock += edits[szName];
        } else {
          const orig = product.product_sizes?.find(s => s.size === szName);
          totalStock += orig ? orig.stock : 0;
        }
      });

      // 3. Update products.total_stock
      const { error: prodUpdErr } = await supabase
        .from('products')
        .update({ total_stock: totalStock })
        .eq('id', product.id);

      if (prodUpdErr) throw prodUpdErr;

      showToast(`Stock updated for "${product.name}". Total stock: ${totalStock}.`);
      
      // Clear edited state for this product
      setEditedStocks(prev => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });

      // Refresh data
      fetchInventory();
    } catch (err) {
      console.error('Error saving stocks:', err);
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== product.id));
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'OUT OF STOCK', className: 'text-red-700 bg-red-50 border-red-200 font-bold' };
    if (stock <= 5) return { label: 'LOW STOCK', className: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
    return { label: 'IN STOCK', className: 'text-green-700 bg-green-50 border-green-200 font-semibold' };
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left font-sans max-w-[1100px] mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
          Inventory
        </h1>
        <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
          Monitor total inventory levels and update sizes stock allocations in real time.
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-beige p-4 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] max-w-md text-left">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Search Inventory</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Product Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cream/35 border border-beige pl-3 pr-4 py-2.5 text-xs outline-none focus:border-black transition-colors rounded-[3px]"
          />
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white border border-beige rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-cream animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white flex items-center justify-between px-6" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-black/50 uppercase tracking-widest">
            {error}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-cream/45 border-b border-beige text-[9px] font-bold uppercase tracking-widest text-black/60">
                  <th className="px-6 py-4">Product details</th>
                  <th className="px-6 py-4 w-32">Category</th>
                  <th className="px-6 py-4 w-32">Stock Status</th>
                  <th className="px-6 py-4">Sizes Stock Allocation</th>
                  <th className="px-6 py-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filteredProducts.map(p => {
                  const isUpdating = updatingIds.includes(p.id);
                  const isModified = hasChanges(p);
                  const statusInfo = getStockStatus(p.total_stock);

                  return (
                    <tr key={p.id} className="hover:bg-cream/5 text-xs align-top">
                      
                      {/* Name / SKU */}
                      <td className="px-6 py-4">
                        <span className="block font-bold text-black text-[12px]">{p.name}</span>
                        <span className="block text-[9px] font-bold text-black/40 uppercase tracking-wider mt-0.5">SKU: {p.sku || 'N/A'}</span>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-black/85 mt-0.5 block">{p.categories?.name || 'Uncategorized'}</span>
                      </td>

                      {/* Total Stock / Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-sm font-black text-black">{p.total_stock} Total</span>
                          <span className={`text-[8.5px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-[2px] ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>

                      {/* Sizes stock inputs */}
                      <td className="px-6 py-4">
                        {p.product_sizes && p.product_sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                            {p.product_sizes.map(sz => (
                              <div key={sz.id} className="flex items-center border border-beige bg-cream/15 rounded-[2px] overflow-hidden">
                                <span className="text-[10px] font-bold text-black/60 bg-cream/45 px-2 py-1.5 border-r border-beige">
                                  {sz.size}
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  value={getStockValue(p, sz.size)}
                                  onChange={(e) => handleStockChange(p.id, sz.size, e.target.value)}
                                  className="w-12 text-center text-xs font-bold text-black bg-white py-1 outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-black/40 uppercase italic mt-1 block">No sizes defined. Add sizes in Edit Product.</span>
                        )}
                      </td>

                      {/* Save action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={!isModified || isUpdating}
                          className={`inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase px-3 py-2 rounded-[2px] transition-all shadow-xs ${
                            isModified 
                              ? 'bg-black text-white hover:bg-accent cursor-pointer' 
                              : 'bg-cream text-black/25 border border-beige cursor-default'
                          }`}
                        >
                          <Save className="h-3 w-3" />
                          <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-black/50 uppercase tracking-widest font-serif">
            No products found matching your search.
          </div>
        )}
      </div>

    </div>
  );
}
