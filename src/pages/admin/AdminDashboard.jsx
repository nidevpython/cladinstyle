import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabase';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowRight, 
  Landmark, 
  Clock, 
  Users, 
  ShieldCheck
} from 'lucide-react';

// --- Custom Responsive Line Chart component ---
const LineChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 500;
  const height = 200;

  const maxVal = Math.max(...data.map(d => d.value), 100);
  const minVal = 0;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = margin.left + (i * (width - margin.left - margin.right) / (data.length - 1));
    const y = height - margin.bottom - ((d.value - minVal) * (height - margin.top - margin.bottom) / (maxVal - minVal));
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - margin.bottom} L ${points[0].x} ${height - margin.bottom} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-accent font-sans">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.00" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = margin.top + ratio * (height - margin.top - margin.bottom);
        const gridVal = Math.round(maxVal - ratio * (maxVal - minVal));
        return (
          <g key={i} className="text-black/5">
            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-black/35 text-[9px] font-mono font-medium">
              ₹{gridVal >= 1000 ? `${(gridVal/1000).toFixed(0)}k` : gridVal}
            </text>
          </g>
        );
      })}

      {/* Area under curve */}
      {areaD && <path d={areaD} fill="url(#chartGradient)" />}

      {/* Line path */}
      {pathD && <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

      {/* Points circles */}
      {points.map((p, i) => (
        <g key={i} className="group/dot cursor-pointer">
          <circle cx={p.x} cy={p.y} r="3.5" className="fill-white stroke-accent stroke-2 hover:r-[5px] transition-all" />
          <title>{p.label}: ₹{p.value.toLocaleString()}</title>
        </g>
      ))}

      {/* X Axis Labels */}
      {points.filter((_, i) => {
        if (data.length <= 8) return true;
        return i % Math.ceil(data.length / 6) === 0 || i === data.length - 1;
      }).map((p, i) => (
        <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="fill-black/45 text-[9px] font-semibold uppercase tracking-wider">
          {p.label}
        </text>
      ))}
    </svg>
  );
};

// --- Custom Order Status Chart component ---
const OrderStatusChart = ({ counts }) => {
  const statuses = [
    { key: 'pending', label: 'Pending', color: 'bg-amber-500' },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-indigo-500' },
    { key: 'processing', label: 'Processing', color: 'bg-blue-500' },
    { key: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-pink-500' },
    { key: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-neutral-400' }
  ];

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3.5 font-sans w-full">
      {statuses.map(status => {
        const count = counts[status.key] || 0;
        const percentage = Math.round((count / total) * 100);
        return (
          <div key={status.key} className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-black/60">{status.label}</span>
              <span className="text-black/80 font-mono font-bold">{count} ({percentage}%)</span>
            </div>
            <div className="w-full h-2 bg-cream border border-beige rounded-full overflow-hidden">
              <div 
                className={`h-full ${status.color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Custom Category Sales Chart component ---
const CategorySalesChart = ({ sales }) => {
  const entries = Object.entries(sales).sort((a, b) => b[1] - a[1]);
  const totalSales = entries.reduce((acc, curr) => acc + curr[1], 0) || 1;

  const barColors = [
    'bg-accent',
    'bg-black',
    'bg-black/60',
    'bg-black/40',
    'bg-black/25'
  ];

  return (
    <div className="space-y-4 font-sans w-full">
      {entries.length > 0 ? (
        entries.map(([category, amount], idx) => {
          const percentage = Math.round((amount / totalSales) * 100);
          const colorClass = barColors[idx % barColors.length];
          return (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-black/60">{category}</span>
                <span className="text-black/80 font-mono font-bold">₹{amount.toLocaleString()} ({percentage}%)</span>
              </div>
              <div className="w-full h-2 bg-cream border border-beige rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorClass} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-black/45 uppercase tracking-widest text-center py-10">No sales recorded.</p>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '3m', '12m'

  // Query validation errors
  const [ordersError, setOrdersError] = useState(false);
  const [productsError, setProductsError] = useState(false);
  const [customersError, setCustomersError] = useState(false);

  // States
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });

  const [todaySummary, setTodaySummary] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    delivered: 0
  });

  const [allOrdersData, setAllOrdersData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [categorySales, setCategorySales] = useState({});
  const [revenueTimeline, setRevenueTimeline] = useState([]);

  // Timeframe timeline grouping helper
  const getRevenueTimeline = (ordersList, range) => {
    const now = new Date();
    const cutoff = new Date();
    let formatKey;
    let steps = 7;

    if (range === '7d') {
      cutoff.setDate(now.getDate() - 7);
      formatKey = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      steps = 7;
    } else if (range === '30d') {
      cutoff.setDate(now.getDate() - 30);
      formatKey = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      steps = 30;
    } else if (range === '3m') {
      cutoff.setMonth(now.getMonth() - 3);
      formatKey = (d) => {
        const weekNum = Math.ceil(d.getDate() / 7);
        return `${d.toLocaleDateString(undefined, { month: 'short' })} W${weekNum}`;
      };
      steps = 12; // ~12 weeks
    } else { // '12m'
      cutoff.setFullYear(now.getFullYear() - 1);
      formatKey = (d) => d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      steps = 12;
    }

    const timeline = [];
    for (let i = steps - 1; i >= 0; i--) {
      const d = new Date();
      if (range === '7d' || range === '30d') d.setDate(now.getDate() - i);
      else if (range === '3m') d.setDate(now.getDate() - i * 7);
      else d.setMonth(now.getMonth() - i);

      timeline.push({
        date: d,
        label: formatKey(d),
        value: 0
      });
    }

    ordersList.forEach(o => {
      const orderDate = new Date(o.created_at);
      if (orderDate >= cutoff && o.order_status !== 'cancelled') {
        const amount = Number(o.total_amount) || 0;
        let matchedSlot = null;

        if (range === '7d' || range === '30d') {
          matchedSlot = timeline.find(t => t.date.toDateString() === orderDate.toDateString());
        } else if (range === '3m') {
          const diffDays = Math.abs(orderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          const weekIndex = Math.floor(diffDays / 7);
          if (weekIndex < timeline.length) {
            matchedSlot = timeline[timeline.length - 1 - weekIndex];
          }
        } else { // '12m'
          matchedSlot = timeline.find(t => t.date.getMonth() === orderDate.getMonth() && t.date.getFullYear() === orderDate.getFullYear());
        }

        if (matchedSlot) {
          matchedSlot.value += amount;
        }
      }
    });

    return timeline.map(t => ({ label: t.label, value: Math.round(t.value) }));
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOrdersError(false);
      setProductsError(false);
      setCustomersError(false);

      // Execute dashboard queries concurrently
      const [
        ordersRes,
        productsRes,
        sizesRes,
        customersRes,
        categoriesRes,
        itemsRes
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, categories(name, slug)').order('created_at', { ascending: false }),
        supabase.from('product_sizes').select('*'),
        supabase.from('customer_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('order_items').select('*')
      ]);

      // Gracefully catch errors to prevent whole dashboard crash
      if (ordersRes.error) {
        console.error('Orders query failed:', ordersRes.error);
        setOrdersError(true);
      }
      if (productsRes.error) {
        console.error('Products query failed:', productsRes.error);
        setProductsError(true);
      }
      if (customersRes.error) {
        console.error('Customers query failed:', customersRes.error);
        setCustomersError(true);
      }

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const productSizes = sizesRes.data || [];
      const customers = customersRes.data || [];
      const categories = categoriesRes.data || [];
      const orderItems = itemsRes.data || [];

      setAllOrdersData(orders);

      // --- Metrics Calculations ---
      const totalRevenue = orders
        .filter(o => o.order_status !== 'cancelled' && o.payment_status === 'paid')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      const pendingOrders = orders.filter(o => o.order_status.toLowerCase() === 'pending').length;
      const lowStockCount = productSizes.filter(s => s.stock <= 5).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        lowStockCount,
        totalCustomers: customers.length,
        pendingOrders
      });

      // --- Today's Summary ---
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
      const todayRev = todayOrders
        .filter(o => o.order_status !== 'cancelled' && o.payment_status === 'paid')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const todayCust = customers.filter(c => new Date(c.created_at) >= startOfToday).length;
      const todayDelivered = todayOrders.filter(o => o.order_status.toLowerCase() === 'delivered').length;

      setTodaySummary({
        orders: todayOrders.length,
        revenue: todayRev,
        customers: todayCust,
        delivered: todayDelivered
      });

      // --- Lists & Slices ---
      setRecentOrders(orders.slice(0, 8));
      setRecentCustomers(customers.slice(0, 5));

      // Low Stock Mapping
      const lowStockList = [];
      productSizes.forEach(sizeItem => {
        if (sizeItem.stock <= 5) {
          const prod = products.find(p => p.id === sizeItem.product_id);
          if (prod) {
            lowStockList.push({
              id: `${prod.id}-${sizeItem.size}`,
              name: prod.name,
              sku: prod.sku || 'N/A',
              size: sizeItem.size,
              stock: sizeItem.stock,
              status: sizeItem.stock === 0 ? 'Out of Stock' : 'Low Stock'
            });
          }
        }
      });
      setLowStockProducts(lowStockList.sort((a, b) => a.stock - b.stock).slice(0, 5));

      // --- Charts Data Aggregations ---
      // Order status grouped counts
      const counts = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
      };
      orders.forEach(o => {
        const status = String(o.order_status).toLowerCase();
        if (status in counts) {
          counts[status]++;
        }
      });
      setStatusCounts(counts);

      // Category Sales aggregation
      const salesByCat = {};
      categories.forEach(cat => { salesByCat[cat.name] = 0; });
      orderItems.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          const catName = prod.categories?.name || 'Uncategorized';
          if (!(catName in salesByCat)) salesByCat[catName] = 0;
          salesByCat[catName] += Number(item.total_price) || 0;
        }
      });
      setCategorySales(salesByCat);

      // Set initial timeline
      setRevenueTimeline(getRevenueTimeline(orders, timeRange));

    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Unable to load dashboard details.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Update timeline on timeframe change
  useEffect(() => {
    if (allOrdersData.length > 0) {
      setRevenueTimeline(getRevenueTimeline(allOrdersData, timeRange));
    }
  }, [timeRange, allOrdersData]);

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'confirmed': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'processing': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'out_for_delivery': return 'text-pink-700 bg-pink-50 border-pink-200';
      case 'delivered': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-black/50 bg-cream border-beige';
    }
  };

  const getStockBadgeColor = (stock) => {
    if (stock === 0) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left font-sans">
        <div>
          <div className="h-8 bg-beige w-1/4 rounded animate-pulse" />
          <div className="h-4 bg-beige w-1/6 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-beige p-5 animate-pulse rounded-[3px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="h-[320px] bg-white border border-beige rounded-[3px] animate-pulse" />
          <div className="h-[320px] bg-white border border-beige rounded-[3px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white border border-beige rounded-[3px] font-sans">
        <AlertTriangle className="h-10 w-10 text-accent mx-auto mb-4" />
        <h3 className="font-serif text-lg font-bold uppercase tracking-wider mb-2">Error Loading Dashboard</h3>
        <p className="text-xs text-black/60 mb-6">{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="flex justify-between items-center pb-4 border-b border-beige">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
            Dashboard
          </h1>
          <p className="text-[10px] text-black/55 mt-1 font-bold uppercase tracking-wider">
            Clad in Style Ecommerce Analytics overview
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="text-[9px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* 2. Today's Summary Ribbon */}
      <div className="bg-cream/45 border border-beige p-4 rounded-[3px]">
        <h3 className="text-[10px] font-bold text-black/50 uppercase tracking-widest mb-3">Today's Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-beige/60 p-3 rounded-[2px] text-left">
            <span className="block text-[8px] font-bold text-black/45 uppercase">Today's Orders</span>
            <span className="block text-base font-black text-black mt-0.5">{todaySummary.orders}</span>
          </div>
          <div className="bg-white border border-beige/60 p-3 rounded-[2px] text-left">
            <span className="block text-[8px] font-bold text-black/45 uppercase">Today's Revenue</span>
            <span className="block text-base font-black text-black mt-0.5">₹{todaySummary.revenue.toLocaleString()}</span>
          </div>
          <div className="bg-white border border-beige/60 p-3 rounded-[2px] text-left">
            <span className="block text-[8px] font-bold text-black/45 uppercase">New Customers</span>
            <span className="block text-base font-black text-black mt-0.5">{todaySummary.customers}</span>
          </div>
          <div className="bg-white border border-beige/60 p-3 rounded-[2px] text-left">
            <span className="block text-[8px] font-bold text-black/45 uppercase">Delivered Orders</span>
            <span className="block text-base font-black text-black mt-0.5">{todaySummary.delivered}</span>
          </div>
        </div>
      </div>

      {/* 3. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Orders */}
        <div className="bg-white border border-beige p-4.5 flex items-center justify-between rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="min-w-0">
            <span className="block text-[8.5px] font-bold tracking-wider text-black/40 uppercase truncate">Total Orders</span>
            <span className="block text-xl font-black text-black mt-1">{ordersError ? 'N/A' : stats.totalOrders}</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full bg-cream flex items-center justify-center text-black/60 shrink-0">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white border border-beige p-4.5 flex items-center justify-between rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.01)] col-span-2 lg:col-span-1">
          <div className="min-w-0">
            <span className="block text-[8.5px] font-bold tracking-wider text-black/40 uppercase truncate">Total Revenue</span>
            <span className="block text-xl font-black text-black mt-1">₹{ordersError ? 'N/A' : stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full bg-cream flex items-center justify-center text-black/60 shrink-0">
            <Landmark className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-beige p-4.5 flex items-center justify-between rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="min-w-0">
            <span className="block text-[8.5px] font-bold tracking-wider text-black/40 uppercase truncate">Pending Orders</span>
            <span className="block text-xl font-black text-black mt-1">{ordersError ? 'N/A' : stats.pendingOrders}</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full bg-cream flex items-center justify-center text-black/60 shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-beige p-4.5 flex items-center justify-between rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="min-w-0">
            <span className="block text-[8.5px] font-bold tracking-wider text-black/40 uppercase truncate">Total Products</span>
            <span className="block text-xl font-black text-black mt-1">{productsError ? 'N/A' : stats.totalProducts}</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full bg-cream flex items-center justify-center text-black/60 shrink-0">
            <Package className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white border border-beige p-4.5 flex items-center justify-between rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="min-w-0">
            <span className="block text-[8.5px] font-bold tracking-wider text-black/40 uppercase truncate">Low Stock</span>
            <span className="block text-xl font-black text-black mt-1">{productsError ? 'N/A' : stats.lowStockCount}</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full bg-cream flex items-center justify-center text-black/60 shrink-0">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Registered Users/Customers */}
        <div className="bg-white border border-beige p-4.5 flex items-center justify-between rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="min-w-0">
            <span className="block text-[8.5px] font-bold tracking-wider text-black/40 uppercase truncate">Customers</span>
            <span className="block text-xl font-black text-black mt-1">{customersError ? 'N/A' : stats.totalCustomers}</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full bg-cream flex items-center justify-center text-black/60 shrink-0">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>

      </div>

      {/* 4. Revenue Timeline Chart & Selector */}
      <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-3 border-b border-beige">
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black">
              Revenue Over Time
            </h3>
            <span className="text-[9px] font-bold text-black/40 uppercase">Timeline of received sales amounts</span>
          </div>
          <div className="flex gap-1 bg-cream/70 border border-beige p-0.5 rounded-[3px]">
            {['7d', '30d', '3m', '12m'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-[8.5px] font-bold tracking-wider uppercase rounded-[2px] transition-colors ${
                  timeRange === range
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:text-black hover:bg-cream/80'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '3m' ? '3 Months' : '12 Months'}
              </button>
            ))}
          </div>
        </div>

        {ordersError ? (
          <div className="py-20 text-center text-xs text-red-800 uppercase tracking-wider font-semibold">Unable to load data</div>
        ) : (
          <div className="h-[220px] w-full flex items-center justify-center">
            <LineChart data={revenueTimeline} />
          </div>
        )}
      </div>

      {/* 5. Lower Stats Panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-8">
        
        {/* Left column: Orders Breakdown */}
        <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black mb-5 border-b border-beige pb-3">
            Orders Status Overview
          </h3>
          {ordersError ? (
            <div className="py-20 text-center text-xs text-red-800 uppercase tracking-wider font-semibold">Unable to load data</div>
          ) : (
            <OrderStatusChart counts={statusCounts} />
          )}
        </div>

        {/* Right column: Sales by category */}
        <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black mb-5 border-b border-beige pb-3">
            Sales by Category
          </h3>
          {productsError || ordersError ? (
            <div className="py-20 text-center text-xs text-red-800 uppercase tracking-wider font-semibold">Unable to load data</div>
          ) : (
            <CategorySalesChart sales={categorySales} />
          )}
        </div>

      </div>

      {/* 6. Recent Orders Table & Low stock items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders List */}
        <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-beige pb-3">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black">
                Recent Orders
              </h3>
              <Link to="/admin/orders" className="text-[9px] font-bold tracking-widest text-accent hover:underline uppercase flex items-center gap-1">
                <span>View All Orders</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {ordersError ? (
              <div className="py-20 text-center text-xs text-red-800 uppercase tracking-wider font-semibold">Unable to load data</div>
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-cream text-[9px] font-bold uppercase tracking-wider text-black/50">
                      <th className="pb-2">Order</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {recentOrders.map(o => (
                      <tr key={o.id} className="hover:bg-cream/15">
                        <td className="py-2.5 font-mono font-bold text-black">{o.order_number}</td>
                        <td className="py-2.5 font-semibold text-black/80">{o.customer_name}</td>
                        <td className="py-2.5 text-black/50">{new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}</td>
                        <td className="py-2.5 font-bold text-black">₹{Number(o.total_amount).toLocaleString()}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-[2px] ${getStatusColor(o.order_status)}`}>
                            {o.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-black/45 uppercase tracking-widest">No orders found.</p>
            )}
          </div>
        </div>

        {/* Low Stock alerts */}
        <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-beige pb-3">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black">
                Low Stock Alerts
              </h3>
              <Link to="/admin/inventory" className="text-[9px] font-bold tracking-widest text-accent hover:underline uppercase flex items-center gap-1">
                <span>Manage Stock</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {productsError ? (
              <div className="py-20 text-center text-xs text-red-800 uppercase tracking-wider font-semibold">Unable to load data</div>
            ) : lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-cream text-[9px] font-bold uppercase tracking-wider text-black/50">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2">Size</th>
                      <th className="pb-2">Stock</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {lowStockProducts.map(p => (
                      <tr key={p.id} className="hover:bg-cream/15">
                        <td className="py-2.5 font-bold text-black truncate max-w-[130px]">{p.name}</td>
                        <td className="py-2.5 text-black/60 font-mono">{p.sku}</td>
                        <td className="py-2.5 font-semibold text-black/50">{p.size}</td>
                        <td className="py-2.5 font-bold text-black">{p.stock}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-[2px] ${getStockBadgeColor(p.stock)}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-green-700 font-bold uppercase tracking-wider flex flex-col items-center gap-2 justify-center">
                <ShieldCheck className="h-8 w-8 text-green-600" />
                <span>✓ All sizes are fully stocked.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 7. Recent Customer profiles section */}
      <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black mb-5 border-b border-beige pb-3">
          Recently Registered Customers
        </h3>
        {customersError ? (
          <div className="py-20 text-center text-xs text-red-800 uppercase tracking-wider font-semibold">Unable to load data</div>
        ) : recentCustomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentCustomers.map(c => (
              <div key={c.id} className="border border-beige p-4 rounded-[2px] bg-cream/10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-xs font-bold text-black truncate">{c.first_name || 'Customer'} {c.last_name || ''}</span>
                  <span className="block text-[9px] text-black/55 mt-0.5 truncate">{c.email}</span>
                  <span className="block text-[8px] text-black/40 font-mono mt-1">Joined: {new Date(c.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-black/45 uppercase tracking-widest">No customer profiles found.</p>
        )}
      </div>

    </div>
  );
}
