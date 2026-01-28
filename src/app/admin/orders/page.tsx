'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, Calendar, DollarSign, User, Hash, Instagram, Music, Loader2 } from 'lucide-react';

interface Order {
  id: number;
  username: string;
  platform: string;
  followers: number;
  amount: number;
  payment_id: string;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return false;
      }

      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp < Date.now()) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
          return false;
        }
      } catch {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
        return false;
      }

      return true;
    };

    const fetchOrders = async () => {
      if (!checkAuth()) return;

      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/orders/list', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0);
  };

  const getTotalOrders = () => orders.length;

  const getRecentOrders = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return orders.filter(order => new Date(order.created_at) > oneDayAgo).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-gray-300">View and manage all customer orders</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white mt-1">{getTotalOrders()}</p>
              </div>
              <Package className="w-12 h-12 text-indigo-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">{formatCurrency(getTotalRevenue())}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Last 24h</p>
                <p className="text-3xl font-bold text-white mt-1">{getRecentOrders()}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Followers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-lg">No orders yet</p>
                      <p className="text-gray-500 text-sm mt-1">Orders will appear here after customers make purchases</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-white">
                          <Hash className="w-4 h-4 mr-1 text-gray-400" />
                          {order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-white">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          @{order.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {order.platform === 'instagram' ? (
                            <>
                              <Instagram className="w-4 h-4 mr-2 text-pink-400" />
                              <span className="text-pink-400 font-medium">Instagram</span>
                            </>
                          ) : (
                            <>
                              <Music className="w-4 h-4 mr-2 text-cyan-400" />
                              <span className="text-cyan-400 font-medium">TikTok</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        +{order.followers.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
                          {order.payment_id.substring(0, 20)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
