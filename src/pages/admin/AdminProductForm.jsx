import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Upload, X, Star, Plus, Trash2, Check } from 'lucide-react';

export default function AdminProductForm() {
  const { id } = useParams(); // populated in edit mode
  const navigate = useNavigate();
  const { showToast } = useApp();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown categories
  const [categories, setCategories] = useState([]);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [discount, setDiscount] = useState(0);

  const [fabric, setFabric] = useState('');
  const [color, setColor] = useState('');
  const [careInstructions, setCareInstructions] = useState('');

  // Checkboxes
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Sizes state
  // Each size: { id: temp_id, size: string, stock: number }
  const [productSizes, setProductSizes] = useState([]);

  // Images state
  // Each image: { id: temp_id/db_id, image_url: string, is_primary: boolean, position: number, file?: File }
  const [productImages, setProductImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load initial categories and product data (if edit mode)
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetching(true);
        setErrorMsg('');

        // 1. Fetch active categories
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true);
        
        if (catErr) throw catErr;
        setCategories(catData || []);

        if (catData && catData.length > 0 && !categoryId) {
          setCategoryId(catData[0].id);
        }

        // 2. Fetch product details in Edit mode
        if (isEditMode) {
          const { data: prod, error: prodErr } = await supabase
            .from('products')
            .select(`
              *,
              product_images(*),
              product_sizes(*)
            `)
            .eq('id', id)
            .single();

          if (prodErr) throw prodErr;

          setName(prod.name || '');
          setSlug(prod.slug || '');
          setCategoryId(prod.category_id || '');
          setShortDescription(prod.short_description || '');
          setDescription(prod.description || '');
          setSku(prod.sku || '');
          setPrice(prod.price || '');
          setOldPrice(prod.old_price || '');
          setFabric(prod.fabric || '');
          setColor(prod.color || '');
          setCareInstructions(prod.care_instructions || '');
          setIsFeatured(prod.featured || false);
          setIsNewArrival(prod.new_arrival || false);
          setIsBestSeller(prod.best_seller || false);
          setIsActive(prod.is_active || false);

          // Populate sizes
          const mappedSizes = (prod.product_sizes || []).map(s => ({
            id: s.id,
            size: s.size,
            stock: s.stock
          }));
          setProductSizes(mappedSizes);

          // Populate images (sort by created_at)
          const mappedImages = (prod.product_images || []).map((img, idx) => ({
            id: img.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            position: idx
          })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          setProductImages(mappedImages);
        }
      } catch (err) {
        console.error('Error loading product form data:', err);
        setErrorMsg('Unable to retrieve product details.');
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  // Calculate discount automatically
  useEffect(() => {
    const numPrice = Number(price);
    const numOldPrice = Number(oldPrice);
    if (numPrice && numOldPrice && numOldPrice > numPrice) {
      const pct = Math.round(((numOldPrice - numPrice) / numOldPrice) * 100);
      setDiscount(pct);
    } else {
      setDiscount(0);
    }
  }, [price, oldPrice]);

  // Auto generate slug from name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-'); // replace spaces with dashes
      setSlug(generatedSlug);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImages = [...productImages];

      for (const file of files) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          showToast(`File type "${file.name}" is not supported. Use JPG, PNG or WEBP.`, 'error');
          continue;
        }

        // Upload directly to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const filename = `${Math.random().toString(36).slice(2, 9)}_${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);

        // Add to images state
        newImages.push({
          id: 'temp_' + Math.random().toString(36).substring(7),
          image_url: publicUrl,
          is_primary: newImages.length === 0, // make primary if it's the first image
          position: newImages.length
        });
      }

      setProductImages(newImages);
      showToast('Image(s) uploaded successfully.');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('Image upload failed: ' + err.message, 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // reset file input
    }
  };

  // Set primary image
  const setPrimaryImage = (index) => {
    const updated = productImages.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }));
    setProductImages(updated);
  };

  // Remove image
  const removeImage = async (index) => {
    const imgToRemove = productImages[index];
    const updated = productImages.filter((_, idx) => idx !== index);
    
    // Recalculate positions and make sure we have a primary image
    const reordered = updated.map((img, idx) => ({
      ...img,
      position: idx,
      is_primary: img.is_primary ? true : (idx === 0) // if primary was deleted, set first image as primary
    }));

    setProductImages(reordered);
    showToast('Image removed.');
  };

  // Add Size shortcuts
  const addSizeShortcut = (categoryType) => {
    const babySizesList = ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y'];
    const womenSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const targetList = categoryType === 'baby' ? babySizesList : womenSizesList;
    
    // Add sizes that are not already present
    const updated = [...productSizes];
    targetList.forEach(sz => {
      if (!updated.some(s => s.size === sz)) {
        updated.push({
          id: 'temp_sz_' + Math.random().toString(36).substring(7),
          size: sz,
          stock: 10 // default stock
        });
      }
    });
    setProductSizes(updated);
  };

  // Add Custom Size Row
  const addCustomSize = () => {
    setProductSizes(prev => [
      ...prev,
      {
        id: 'temp_sz_' + Math.random().toString(36).substring(7),
        size: '',
        stock: 0
      }
    ]);
  };

  // Update Size detail
  const updateSizeField = (id, field, value) => {
    setProductSizes(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          [field]: field === 'stock' ? Math.max(0, parseInt(value) || 0) : value
        };
      }
      return s;
    }));
  };

  // Remove Size Row
  const removeSizeRow = (id) => {
    setProductSizes(prev => prev.filter(s => s.id !== id));
  };

  // Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug || !categoryId || !price) {
      setErrorMsg('Please populate all mandatory fields (Name, Slug, Category, Price).');
      window.scrollTo(0, 0);
      return;
    }

    if (productImages.length === 0) {
      setErrorMsg('Please upload at least one product image.');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Slug Uniqueness Check
      const queryBuilder = supabase
        .from('products')
        .select('id')
        .eq('slug', slug);
      
      if (isEditMode) {
        queryBuilder.neq('id', id);
      }

      const { data: existingSlug, error: slugCheckErr } = await queryBuilder;
      if (slugCheckErr) throw slugCheckErr;

      if (existingSlug && existingSlug.length > 0) {
        throw new Error(`The slug "${slug}" is already in use by another product. Slugs must be unique.`);
      }

      // 2. Calculate total stock
      const totalStock = productSizes.reduce((sum, s) => sum + s.stock, 0);

      // 3. Upsert product record
      const productPayload = {
        name,
        slug,
        category_id: categoryId,
        short_description: shortDescription,
        description,
        sku,
        price: parseFloat(price),
        old_price: oldPrice ? parseFloat(oldPrice) : null,
        fabric,
        color,
        care_instructions: careInstructions,
        featured: isFeatured,
        new_arrival: isNewArrival,
        best_seller: isBestSeller,
        is_active: isActive,
        total_stock: totalStock
      };

      let productId = id;

      if (isEditMode) {
        const { error: updErr } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id);
        if (updErr) throw updErr;
      } else {
        const { data: newProd, error: insErr } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single();
        if (insErr) throw insErr;
        productId = newProd.id;
      }

      // 4. Sync sizes
      // To sync, we delete existing sizes for this product ID, then bulk-insert
      if (isEditMode) {
        const { error: delSzError } = await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', productId);
        if (delSzError) throw delSzError;
      }

      const sizesPayload = productSizes
        .filter(s => s.size.trim() !== '')
        .map(s => ({
          product_id: productId,
          size: s.size.trim(),
          stock: s.stock
        }));

      if (sizesPayload.length > 0) {
        const { error: insSzError } = await supabase
          .from('product_sizes')
          .insert(sizesPayload);
        if (insSzError) throw insSzError;
      }

      // 5. Sync images
      if (isEditMode) {
        const { error: delImgError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);
        if (delImgError) throw delImgError;
      }

      const imagesPayload = productImages.map((img, idx) => ({
        product_id: productId,
        image_url: img.image_url,
        is_primary: img.is_primary
      }));

      if (imagesPayload.length > 0) {
        const { error: insImgError } = await supabase
          .from('product_images')
          .insert(imagesPayload);
        if (insImgError) throw insImgError;
      }

      showToast(`Product saved successfully.`);
      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'Operation failed. Please verify database constraints.');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6 text-left animate-pulse font-sans">
        <div className="h-4 bg-beige w-12 rounded" />
        <div className="h-8 bg-beige w-1/4 rounded mt-4" />
        <div className="w-full h-[500px] bg-white border border-beige rounded-[3px] mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans max-w-[1000px] mx-auto">
      
      {/* Back link & Title */}
      <div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-black/50 hover:text-black uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black mt-3">
          {isEditMode ? 'Edit Product' : 'Add Product'}
        </h1>
        <div className="w-12 h-[2px] bg-accent mt-3 mb-6" />
      </div>

      {errorMsg && (
        <div className="p-4 bg-accent/5 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* SECTION 1: PRODUCT INFORMATION */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2">
            Product Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Name */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Floral Baby Dress"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Slug (URL string) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="floral-baby-dress"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-mono"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-semibold"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="CIS-BABY-FL-01"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A charming organic cotton romper frock."
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Full Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Crafted from premium GOTS certified cotton, this romper features delicate gathers..."
                rows={4}
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2">
            Pricing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Price */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Sale Price (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="899"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-bold"
              />
            </div>

            {/* Old Price */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Original Price / Old Price (₹)</label>
              <input
                type="number"
                min={0}
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="1199"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Calculated Discount */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Auto Discount</label>
              <div className="w-full bg-cream border border-beige px-3.5 py-2.5 text-xs rounded-[3px] font-black text-accent uppercase tracking-widest">
                {discount > 0 ? `${discount}% OFF` : 'No Discount'}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRODUCT DETAILS */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2">
            Product Details & Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Fabric */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Fabric & Materials</label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="100% Organic Cotton Mulmul"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Colors (comma separated)</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Sage Green, Oatmeal, Blush Pink"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Care instructions */}
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Care Instructions</label>
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Machine wash cold delicate cycle. Hang to dry. Iron low if needed."
                rows={2}
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PRODUCT IMAGES */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <div className="border-b border-beige pb-3 mb-2 flex justify-between items-center">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black">
              Product Images *
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-wider text-black/40">First image will be primary</span>
          </div>

          {/* Upload Button Box */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-beige border-dashed hover:border-black/50 bg-cream/10 hover:bg-cream/20 cursor-pointer transition-all rounded-[3px]">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-6 w-6 text-black/40 mb-2" />
                <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">
                  {uploadingImage ? 'Uploading Image...' : 'Click to Upload Product Images'}
                </p>
                <p className="text-[8px] text-black/40 mt-1 uppercase">JPG, JPEG, PNG, WEBP Only</p>
              </div>
              <input
                type="file"
                multiple
                disabled={uploadingImage}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>

          {/* Image Previews Grid */}
          {productImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
              {productImages.map((img, idx) => (
                <div key={img.id} className={`group relative aspect-[4/5] bg-cream border rounded-[3px] overflow-hidden flex flex-col justify-between p-2.5 ${
                  img.is_primary ? 'border-accent ring-1 ring-accent' : 'border-beige'
                }`}>
                  <img src={img.image_url} alt="product-preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                  
                  {/* Glass Background Overlay */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity z-1" />

                  {/* Top Actions: Delete */}
                  <div className="relative z-10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="w-6 h-6 rounded-full bg-white text-black hover:text-accent shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Bottom Actions: Set Primary Flag */}
                  <div className="relative z-10 w-full">
                    {img.is_primary ? (
                      <span className="w-full bg-accent text-white text-[8px] font-bold tracking-widest uppercase py-1 text-center block rounded-[2px] shadow-sm">
                        Primary Image
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="w-full bg-white/90 text-black hover:bg-white text-[8px] font-bold tracking-widest uppercase py-1 text-center block rounded-[2px] shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: SIZES & STOCK LIMITS */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <div className="border-b border-beige pb-3 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black">
                Sizes & Inventory Stock *
              </h3>
              <p className="text-[9px] font-bold text-black/40 uppercase mt-0.5 tracking-wider">
                Specify sizes and stock counts for this apparel item.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addSizeShortcut('baby')}
                className="border border-beige hover:border-black text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-[2px]"
              >
                Baby sizes
              </button>
              <button
                type="button"
                onClick={() => addSizeShortcut('women')}
                className="border border-beige hover:border-black text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-[2px]"
              >
                Women sizes
              </button>
              <button
                type="button"
                onClick={addCustomSize}
                className="bg-black text-white hover:bg-accent text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-[2px] inline-flex items-center gap-1.5"
              >
                <Plus className="h-3 w-3" />
                <span>Custom</span>
              </button>
            </div>
          </div>

          {/* Size Rows */}
          {productSizes.length > 0 ? (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-2">
              {productSizes.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-3.5 bg-cream/25 border border-beige p-2.5 rounded-[3px]">
                  
                  {/* Size field */}
                  <div className="w-1/2">
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-black/40 mb-1">Size (e.g. M, 3-6M)</label>
                    <input
                      type="text"
                      required
                      value={s.size}
                      onChange={(e) => updateSizeField(s.id, 'size', e.target.value.toUpperCase())}
                      placeholder="M"
                      className="w-full bg-white border border-beige px-3 py-1.5 text-xs outline-none focus:border-black rounded-[2px]"
                    />
                  </div>

                  {/* Stock field */}
                  <div className="w-1/2">
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-black/40 mb-1">Size Stock</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={s.stock}
                      onChange={(e) => updateSizeField(s.id, 'stock', e.target.value)}
                      placeholder="10"
                      className="w-full bg-white border border-beige px-3 py-1.5 text-xs outline-none focus:border-black rounded-[2px] font-semibold"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeSizeRow(s.id)}
                    className="p-2 border border-transparent hover:border-accent text-black/40 hover:text-accent mt-4 transition-colors rounded-[2px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-black/40 uppercase tracking-widest font-serif">
              No sizes added. Click shortcuts above to populate size structures.
            </div>
          )}
        </div>

        {/* SECTION 6: PRODUCT STATUS FLAGS */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2">
            Product Flags & Visibility
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Featured */}
            <label className="flex items-center gap-2.5 bg-cream/25 border border-beige p-3.5 rounded-[3px] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="hidden"
              />
              <span className={`w-4 h-4 border border-beige flex items-center justify-center text-[10px] font-bold ${
                isFeatured ? 'bg-black border-black text-white' : 'bg-white'
              }`}>
                {isFeatured && '✓'}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase">Featured</span>
            </label>

            {/* New Arrival */}
            <label className="flex items-center gap-2.5 bg-cream/25 border border-beige p-3.5 rounded-[3px] cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="hidden"
              />
              <span className={`w-4 h-4 border border-beige flex items-center justify-center text-[10px] font-bold ${
                isNewArrival ? 'bg-black border-black text-white' : 'bg-white'
              }`}>
                {isNewArrival && '✓'}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase">New Arrival</span>
            </label>

            {/* Best Seller */}
            <label className="flex items-center gap-2.5 bg-cream/25 border border-beige p-3.5 rounded-[3px] cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="hidden"
              />
              <span className={`w-4 h-4 border border-beige flex items-center justify-center text-[10px] font-bold ${
                isBestSeller ? 'bg-black border-black text-white' : 'bg-white'
              }`}>
                {isBestSeller && '✓'}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase">Best Seller</span>
            </label>

            {/* Active Status */}
            <label className="flex items-center gap-2.5 bg-cream/25 border border-beige p-3.5 rounded-[3px] cursor-pointer">
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

          </div>
        </div>

        {/* Form Actions Submit/Cancel */}
        <div className="flex gap-4 justify-end pt-4">
          <Link
            to="/admin/products"
            className="border border-black text-black text-[10px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-cream transition-colors rounded-[3px]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-10 py-3.5 hover:bg-accent transition-colors rounded-[3px] disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <span>Saving Product...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
