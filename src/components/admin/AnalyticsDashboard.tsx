'use client';

import { useMemo, useCallback, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, ShoppingCart, Users, Target, Instagram, Music, DollarSign, Percent, Info, Trash2, Plus } from 'lucide-react';

interface Order {
  id: number;
  username: string;
  email?: string;
  platform: string;
  followers: number;
  price?: number;
  amount?: number;
  cost?: number;
  payment_status?: string;
  payment_intent_id?: string | null;
  created_at: string;
  order_source?: string;
  ads_keyword?: string | null;
  ads_campaign?: string | null;
  ads_device?: string | null;
  customer_total_orders?: number;
}

interface GoogleAdsExpense {
  month: string;
  amount: number;
  updated_at?: string;
}

interface OperatingExpenseItem {
  id: number;
  month: string;
  name: string;
  amount: number;
}

interface AnalyticsDashboardProps {
  orders: Order[];
  totalVisitors?: number;
  googleAdsExpenses?: GoogleAdsExpense[];
  operatingExpenses?: OperatingExpenseItem[];
  onAddOperatingExpense?: (month: string, name: string, amount: number) => Promise<void>;
  onDeleteOperatingExpense?: (id: number) => Promise<void>;
}

type TimeRange = 'week' | 'month' | 'year';

function calculateStripeFee(amount: number): number {
  return Number(((amount * 0.015) + 0.25).toFixed(2));
}

export default function AnalyticsDashboard({ orders, totalVisitors = 0, googleAdsExpenses = [], operatingExpenses = [], onAddOperatingExpense, onDeleteOperatingExpense }: AnalyticsDashboardProps) {
  // Operating expense form state
  const [opexMonth, setOpexMonth] = useState('');
  const [opexName, setOpexName] = useState('');
  const [opexAmount, setOpexAmount] = useState('');
  const [opexSaving, setOpexSaving] = useState(false);
  // Calculate revenue data by time period
  const getRevenueData = useCallback((range: TimeRange) => {
    const now = new Date();
    const data: { [key: string]: number } = {};
    
    let daysBack: number;
    let dateFormat: (date: Date) => string;
    
    switch (range) {
      case 'week':
        daysBack = 7;
        dateFormat = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        daysBack = 30;
        dateFormat = (date: Date) => date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        break;
      case 'year':
        daysBack = 365;
        dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short' });
        break;
    }
    
    // Initialize all dates with 0
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = dateFormat(date);
      if (!data[key]) data[key] = 0;
    }
    
    // Sum up orders
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const diffTime = now.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= daysBack) {
        const key = dateFormat(orderDate);
        const amount = Number(order.price) || Number(order.amount) || 0;
        data[key] = (data[key] || 0) + amount;
      }
    });
    
    return Object.entries(data).map(([name, revenue]) => ({
      name,
      revenue: Number(revenue.toFixed(2)),
    }));
  }, [orders]);

  // Calculate profit data by time period (revenue - cost)
  const getProfitData = useCallback((range: TimeRange) => {
    const now = new Date();
    const data: { [key: string]: number } = {};

    let daysBack: number;
    let dateFormat: (date: Date) => string;

    switch (range) {
      case 'week':
        daysBack = 7;
        dateFormat = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        daysBack = 30;
        dateFormat = (date: Date) => date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        break;
      case 'year':
        daysBack = 365;
        dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short' });
        break;
    }

    // Initialize all dates with 0
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = dateFormat(date);
      if (!data[key]) data[key] = 0;
    }

    // Sum up orders
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const diffTime = now.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= daysBack) {
        const key = dateFormat(orderDate);
        const revenue = Number(order.price) || Number(order.amount) || 0;
        const cost = Number(order.cost) || 0;
        data[key] = (data[key] || 0) + (revenue - cost);
      }
    });

    return Object.entries(data).map(([name, profit]) => ({
      name,
      profit: Number(profit.toFixed(2)),
    }));
  }, [orders]);

  // Platform distribution
  const platformData = useMemo(() => {
    const instagram = orders.filter(o => o.platform === 'instagram').length;
    const tiktok = orders.filter(o => o.platform === 'tiktok').length;
    
    return [
      { name: 'Instagram', value: instagram, color: '#E1306C' },
      { name: 'TikTok', value: tiktok, color: '#00F2EA' },
    ];
  }, [orders]);

  // Average cart value
  const averageCart = useMemo(() => {
    if (orders.length === 0) return '0.00';
    const total = orders.reduce((sum, order) => sum + (Number(order.price) || Number(order.amount) || 0), 0);
    return (total / orders.length).toFixed(2);
  }, [orders]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + (Number(order.price) || Number(order.amount) || 0), 0);
    return total.toFixed(2);
  }, [orders]);

  const totalProfit = useMemo(() => {
    const total = orders.reduce((sum, order) => {
      const revenue = Number(order.price) || Number(order.amount) || 0;
      const cost = Number(order.cost) || 0;
      return sum + (revenue - cost);
    }, 0);
    return total.toFixed(2);
  }, [orders]);

  const googleAdsByMonth = useMemo(() => {
    const map = new Map<string, number>();
    googleAdsExpenses.forEach((e) => {
      const month = String(e.month);
      const amount = Number(e.amount) || 0;
      map.set(month, amount);
    });
    return map;
  }, [googleAdsExpenses]);

  // Revenue by period
  const revenueByPeriod = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let today = 0;
    let week = 0;
    let month = 0;

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const amount = Number(order.price) || Number(order.amount) || 0;

      if (orderDate >= todayStart) {
        today += amount;
      }
      if (orderDate >= weekAgo) {
        week += amount;
      }
      if (orderDate >= monthAgo) {
        month += amount;
      }
    });

    return {
      today: today.toFixed(2),
      week: week.toFixed(2),
      month: month.toFixed(2),
    };
  }, [orders]);

  // Conversion rate
  const conversionRate = useMemo(() => {
    if (totalVisitors === 0) return 0;
    return ((orders.length / totalVisitors) * 100).toFixed(1);
  }, [orders, totalVisitors]);

  // Top packages sold
  const topPackages = useMemo(() => {
    const packageCount: { [key: string]: { count: number; platform: string; revenue: number } } = {};
    
    orders.forEach(order => {
      const key = `${order.followers}`;
      if (!packageCount[key]) {
        packageCount[key] = { count: 0, platform: order.platform, revenue: 0 };
      }
      packageCount[key].count++;
      packageCount[key].revenue += Number(order.price) || Number(order.amount) || 0;
    });
    
    return Object.entries(packageCount)
      .map(([followers, data]) => ({
        followers: parseInt(followers),
        count: data.count,
        platform: data.platform,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const weeklyData = useMemo(() => getRevenueData('week'), [getRevenueData]);
  const monthlyData = useMemo(() => getRevenueData('month'), [getRevenueData]);

  const monthlyProfitData = useMemo(() => getProfitData('month'), [getProfitData]);

  // Total Stripe fees across all orders
  const totalStripeFees = useMemo(() => {
    return orders.reduce((sum, order) => {
      const amount = Number(order.price) || Number(order.amount) || 0;
      return sum + calculateStripeFee(amount);
    }, 0);
  }, [orders]);

  const totalOpex = useMemo(() => operatingExpenses.reduce((s, e) => s + Number(e.amount), 0), [operatingExpenses]);
  const totalAdsSpend = useMemo(() => googleAdsExpenses.reduce((s, e) => s + Number(e.amount), 0), [googleAdsExpenses]);

  // New Net Profit = Revenue - Provider Costs - Stripe Fees - Google Ads - Operating Expenses
  const netProfitTotal = useMemo(() => {
    const rev = Number(totalRevenue);
    const costs = orders.reduce((s, o) => s + (Number(o.cost) || 0), 0);
    return Number((rev - costs - totalStripeFees - totalAdsSpend - totalOpex).toFixed(2));
  }, [totalRevenue, orders, totalStripeFees, totalAdsSpend, totalOpex]);

  // Current month stats for KPIs
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
    });
    const monthRevenue = monthOrders.reduce((s, o) => s + (Number(o.price) || Number(o.amount) || 0), 0);
    const monthAds = googleAdsByMonth.get(monthKey) || 0;
    const cpa = monthOrders.length > 0 ? monthAds / monthOrders.length : 0;
    const roas = monthAds > 0 ? monthRevenue / monthAds : 0;
    return { orders: monthOrders.length, revenue: monthRevenue, ads: monthAds, cpa, roas };
  }, [orders, googleAdsByMonth]);

  // Funnel vs Classic revenue comparison (last 6 months)
  const funnelVsClassicData = useMemo(() => {
    const now = new Date();
    const data: Array<{ name: string; funnel: number; classic: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      let funnel = 0, classic = 0;
      orders.forEach(o => {
        const od = new Date(o.created_at);
        const ok = `${od.getFullYear()}-${String(od.getMonth() + 1).padStart(2, '0')}`;
        if (ok !== mk) return;
        const amt = Number(o.price) || Number(o.amount) || 0;
        if (o.order_source && o.order_source.includes('FUNNEL')) funnel += amt;
        else classic += amt;
      });
      data.push({ name: d.toLocaleDateString('en-US', { month: 'short' }), funnel: Number(funnel.toFixed(2)), classic: Number(classic.toFixed(2)) });
    }
    return data;
  }, [orders]);

  // Retention: new vs returning customers
  const retentionData = useMemo(() => {
    let newCustomers = 0, returning = 0;
    orders.forEach(o => {
      const total = Number(o.customer_total_orders) || 1;
      if (total <= 1) newCustomers++;
      else returning++;
    });
    return [
      { name: 'Nouveaux', value: newCustomers, color: '#8B5CF6' },
      { name: 'Récurrents', value: returning, color: '#10B981' },
    ];
  }, [orders]);

  // CPA vs Average Cart over last 6 months
  const cpaVsCartData = useMemo(() => {
    const now = new Date();
    const data: Array<{ name: string; cpa: number; avgCart: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthOrders = orders.filter(o => {
        const od = new Date(o.created_at);
        return `${od.getFullYear()}-${String(od.getMonth() + 1).padStart(2, '0')}` === mk;
      });
      const monthRev = monthOrders.reduce((s, o) => s + (Number(o.price) || Number(o.amount) || 0), 0);
      const ads = googleAdsByMonth.get(mk) || 0;
      const cpa = monthOrders.length > 0 ? ads / monthOrders.length : 0;
      const avgCart = monthOrders.length > 0 ? monthRev / monthOrders.length : 0;
      data.push({ name: d.toLocaleDateString('en-US', { month: 'short' }), cpa: Number(cpa.toFixed(2)), avgCart: Number(avgCart.toFixed(2)) });
    }
    return data;
  }, [orders, googleAdsByMonth]);

  // Top Keywords by Revenue
  const topKeywords = useMemo(() => {
    const map: Record<string, { revenue: number; count: number; devices: Set<string> }> = {};
    orders.forEach(o => {
      const kw = o.ads_keyword || 'Direct / No Ads';
      const amt = Number(o.price) || Number(o.amount) || 0;
      if (!map[kw]) map[kw] = { revenue: 0, count: 0, devices: new Set() };
      map[kw].revenue += amt;
      map[kw].count++;
      if (o.ads_device) map[kw].devices.add(o.ads_device);
    });
    return Object.entries(map)
      .map(([keyword, d]) => ({ keyword, revenue: Number(d.revenue.toFixed(2)), count: d.count, devices: Array.from(d.devices) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [orders]);

  // Weekly Net Profit (last 12 weeks) — replaces monthly
  const weeklyNetProfitData = useMemo(() => {
    const now = new Date();
    const data: Array<{ name: string; netProfit: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      const weekOrders = orders.filter(o => {
        const d = new Date(o.created_at);
        return d >= weekStart && d < weekEnd;
      });
      const rev = weekOrders.reduce((s, o) => s + (Number(o.price) || Number(o.amount) || 0), 0);
      const costs = weekOrders.reduce((s, o) => s + (Number(o.cost) || 0), 0);
      const stripeFees = weekOrders.reduce((s, o) => s + calculateStripeFee(Number(o.price) || Number(o.amount) || 0), 0);
      const net = rev - costs - stripeFees;
      data.push({ name: label, netProfit: Number(net.toFixed(2)) });
    }
    return data;
  }, [orders]);

  const COLORS = ['#E1306C', '#00F2EA'];
  const RETENTION_COLORS = ['#8B5CF6', '#10B981'];

  const handleAddOpex = async () => {
    if (!opexMonth || !opexName || !opexAmount || !onAddOperatingExpense) return;
    setOpexSaving(true);
    try {
      await onAddOperatingExpense(opexMonth, opexName, Number(opexAmount));
      setOpexMonth('');
      setOpexName('');
      setOpexAmount('');
    } catch (e) {
      console.error('Failed to add operating expense:', e);
    } finally {
      setOpexSaving(false);
    }
  };

  const tooltipStyle = { backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' };

  return (
    <div className="space-y-8">
      {/* Revenue Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💰 Revenue Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white">
            <p className="text-yellow-100 text-xs font-medium uppercase">Today</p>
            <p className="text-2xl font-bold mt-1">€{revenueByPeriod.today}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-xs font-medium uppercase">Last 7 Days</p>
            <p className="text-2xl font-bold mt-1">€{revenueByPeriod.week}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-xs font-medium uppercase">Last 30 Days</p>
            <p className="text-2xl font-bold mt-1">€{revenueByPeriod.month}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-4 text-white">
            <p className="text-green-100 text-xs font-medium uppercase">All Time</p>
            <p className="text-2xl font-bold mt-1">€{totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">€{totalRevenue}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><TrendingUp className="w-8 h-8" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><ShoppingCart className="w-8 h-8" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Average Cart</p>
              <p className="text-3xl font-bold mt-1">€{averageCart}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><Target className="w-8 h-8" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold mt-1">{conversionRate}%</p>
              <p className="text-orange-200 text-xs mt-1">{totalVisitors} visitors</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><Users className="w-8 h-8" /></div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 2 (New: CPA, ROAS, Net Profit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">CPA Moyen (ce mois)</p>
              <p className="text-3xl font-bold mt-1">€{currentMonthStats.cpa.toFixed(2)}</p>
              <p className="text-rose-200 text-xs mt-1">{currentMonthStats.orders} commandes · €{currentMonthStats.ads.toFixed(0)} ads</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><DollarSign className="w-8 h-8" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">ROAS (ce mois)</p>
              <p className="text-3xl font-bold mt-1">{currentMonthStats.roas.toFixed(1)}x</p>
              <p className="text-indigo-200 text-xs mt-1">€{currentMonthStats.revenue.toFixed(0)} rev / €{currentMonthStats.ads.toFixed(0)} ads</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><Percent className="w-8 h-8" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium flex items-center gap-1">
                Bénéfice Net Total
                <Info className="w-3.5 h-3.5 opacity-60" />
              </p>
              <p className={`text-3xl font-bold mt-1 ${netProfitTotal < 0 ? 'text-red-200' : ''}`}>€{netProfitTotal.toFixed(2)}</p>
              <p className="text-emerald-200 text-xs mt-1">Stripe: €{totalStripeFees.toFixed(2)} · Ads: €{totalAdsSpend.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><TrendingUp className="w-8 h-8" /></div>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            Déduit : Fournisseurs, Ads, Stripe (1.5%+0.25€), Annexes
          </div>
        </div>
      </div>

      {/* Revenue Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue - Last 7 Days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `€${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`€${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#A78BFA' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue - Last 30 Days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} interval={2} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `€${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`€${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profit - Last 30 Days</h3>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">All Time Profit</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">€{totalProfit}</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyProfitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} interval={2} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`€${v}`, 'Profit']} />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#34D399' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Profit by Week */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Net Profit by Week (last 12 weeks)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyNetProfitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`€${v}`, 'Net Profit']} />
              <Bar dataKey="netProfit" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel vs Classic + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel vs Classic */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔀 Funnel vs Classique (6 mois)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelVsClassicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `€${v}`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="funnel" name="Funnel" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="classic" name="Classique" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retention / LTV Doughnut */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔁 Rétention Clients</h3>
          <div className="h-64 flex items-center justify-center">
            {orders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={retentionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {retentionData.map((entry, index) => (
                      <Cell key={`ret-${index}`} fill={RETENTION_COLORS[index % RETENTION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} clients`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{retentionData[0]?.value || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nouveaux</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{retentionData[1]?.value || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Récurrents</p>
            </div>
          </div>
        </div>
      </div>

      {/* CPA vs Panier Moyen */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📈 CPA vs Panier Moyen (6 mois)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cpaVsCartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#EF4444" fontSize={12} tickFormatter={(v) => `€${v}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" fontSize={12} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cpa" name="CPA" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
              <Line yAxisId="right" type="monotone" dataKey="avgCart" name="Panier Moyen" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Distribution & Top Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {orders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} orders`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <Instagram className="w-6 h-6 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instagram</p>
                <p className="font-bold text-gray-900 dark:text-white">{platformData[0]?.value || 0} orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <Music className="w-6 h-6 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">TikTok</p>
                <p className="font-bold text-gray-900 dark:text-white">{platformData[1]?.value || 0} orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Packages Sold</h3>
          {topPackages.length > 0 ? (
            <div className="space-y-3">
              {topPackages.map((pkg, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-500'}`}>{index + 1}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{pkg.followers.toLocaleString()} followers</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{pkg.platform}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{pkg.count} sales</p>
                    <p className="text-sm text-green-600 dark:text-green-400">€{pkg.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500"><p>No sales data yet</p></div>
          )}
        </div>
      </div>

      {/* Top Keywords Revenue */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔑 Top Keywords Revenue (Google Ads)</h3>
        {topKeywords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Keyword</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Orders</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Devices</th>
                </tr>
              </thead>
              <tbody>
                {topKeywords.map((kw, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-bold text-gray-500">{i + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{kw.keyword}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600 dark:text-green-400">€{kw.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{kw.count}</td>
                    <td className="py-3 px-4 text-right">
                      {kw.devices.length > 0 ? kw.devices.map((d, j) => (
                        <span key={j} className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ml-1 ${d === 'm' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {d === 'm' ? 'Mobile' : d === 'c' ? 'Desktop' : d === 't' ? 'Tablet' : d}
                        </span>
                      )) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-1">Aucune donnée de keyword</p>
            <p className="text-sm">Les keywords seront captés automatiquement via les paramètres URL des campagnes Google Ads</p>
          </div>
        )}
      </div>

      {/* Operating Expenses Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💼 Frais Annexes (SaaS, Proxies, etc.)</h3>
        {onAddOperatingExpense && (
          <div className="flex flex-wrap gap-3 mb-6">
            <input type="month" value={opexMonth} onChange={(e) => setOpexMonth(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" placeholder="Mois" />
            <input type="text" value={opexName} onChange={(e) => setOpexName(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm flex-1 min-w-[150px]" placeholder="Nom du frais (ex: Vercel)" />
            <input type="number" step="0.01" value={opexAmount} onChange={(e) => setOpexAmount(e.target.value)} className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" placeholder="Montant €" />
            <button onClick={handleAddOpex} disabled={opexSaving || !opexMonth || !opexName || !opexAmount}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
              <Plus className="w-4 h-4" />{opexSaving ? 'Saving...' : 'Ajouter'}
            </button>
          </div>
        )}
        {operatingExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Mois</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Nom</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Montant</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {operatingExpenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{e.month}</td>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{e.name}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">€{Number(e.amount).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">
                      {onDeleteOperatingExpense && (
                        <button onClick={() => onDeleteOperatingExpense(e.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  <td colSpan={2} className="py-2 px-3 font-bold text-gray-900 dark:text-white">Total</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">€{totalOpex.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Aucun frais annexe enregistré</p>
        )}
      </div>
    </div>
  );
}
