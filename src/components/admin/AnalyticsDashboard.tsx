'use client';

import { useMemo, useCallback } from 'react';
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
import { TrendingUp, ShoppingCart, Users, Target, Instagram, Music } from 'lucide-react';

interface Order {
  id: number;
  username: string;
  email?: string;
  platform: string;
  followers: number;
  price?: number;
  amount?: number;
  payment_status?: string;
  payment_intent_id?: string | null;
  created_at: string;
}

interface AnalyticsDashboardProps {
  orders: Order[];
  totalVisitors?: number;
}

type TimeRange = 'week' | 'month' | 'year';

export default function AnalyticsDashboard({ orders, totalVisitors = 0 }: AnalyticsDashboardProps) {
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

  const COLORS = ['#E1306C', '#00F2EA'];

  return (
    <div className="space-y-8">
      {/* Revenue Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          💰 Revenue Summary
        </h3>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">€{totalRevenue}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <ShoppingCart className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Average Cart */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Average Cart</p>
              <p className="text-3xl font-bold mt-1">€{averageCart}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold mt-1">{conversionRate}%</p>
              <p className="text-orange-200 text-xs mt-1">{totalVisitors} visitors</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart - Weekly */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Revenue - Last 7 Days
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `€${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`€${value}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#A78BFA' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart - Monthly */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Revenue - Last 30 Days
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} interval={2} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `€${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`€${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Distribution & Top Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Platform Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {orders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => [`${value} orders`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">
                <p>No data available</p>
              </div>
            )}
          </div>
          {/* Platform Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <Instagram className="w-6 h-6 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instagram</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {platformData[0]?.value || 0} orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <Music className="w-6 h-6 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">TikTok</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {platformData[1]?.value || 0} orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Packages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Top Packages Sold
          </h3>
          {topPackages.length > 0 ? (
            <div className="space-y-3">
              {topPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {pkg.followers.toLocaleString()} followers
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {pkg.platform}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {pkg.count} sales
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      €{pkg.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <p>No sales data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
