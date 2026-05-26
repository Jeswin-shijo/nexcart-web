import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Package, ShoppingBag, TrendingUp, LayoutDashboard, Tag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../api/orders.api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

function StatCard({ label, value, icon, color, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {change && <p className="text-xs text-green-600 mt-1">↑ {change}</p>}
    </div>
  );
}

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'confirmed':
    case 'shipped': return 'warning';
    default: return 'default';
  }
}

const SIDEBAR_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/orders/my', label: 'Orders', icon: <ShoppingBag size={16} /> },
  { to: '/admin/sellers', label: 'Sellers', icon: <Store size={16} /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <Tag size={16} /> },
];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['all-orders-admin', page],
    queryFn: () => getAllOrders(page, 20),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['all-orders-admin'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const orders = data?.orders || data?.data || (Array.isArray(data) ? data : []);
  const totalRevenue = orders.reduce((sum: number, o: { totalAmount?: number }) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-1 w-48 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">Admin</p>
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
            >
              <span className="text-gray-400">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your store's performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value="—"
          icon={<Users size={18} className="text-blue-600" />}
          color="bg-blue-100"
          change="Coming soon"
        />
        <StatCard
          label="Total Products"
          value="—"
          icon={<Package size={18} className="text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          label="Total Orders"
          value={isLoading ? '...' : orders.length}
          icon={<ShoppingBag size={18} className="text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          label="Revenue"
          value={isLoading ? '...' : `₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp size={18} className="text-pink-600" />}
          color="bg-pink-100"
          change="This period"
        />
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/sellers"
            className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-100 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <Store size={16} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Sellers</span>
          </Link>
          <Link
            to="/admin/coupons"
            className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-100 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
              <Tag size={16} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Coupons</span>
          </Link>
          <Link
            to="/orders/my"
            className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-100 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={16} className="text-pink-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Orders</span>
          </Link>
        </div>
      </div>

      {/* Placeholder charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Overview</h3>
          <div className="flex items-end gap-2 h-32">
            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-primary rounded-t opacity-70 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {[
              { status: 'Pending', color: 'bg-yellow-400', count: orders.filter((o: { status: string }) => o.status === 'pending').length },
              { status: 'Confirmed', color: 'bg-blue-400', count: orders.filter((o: { status: string }) => o.status === 'confirmed').length },
              { status: 'Shipped', color: 'bg-purple-400', count: orders.filter((o: { status: string }) => o.status === 'shipped').length },
              { status: 'Delivered', color: 'bg-green-400', count: orders.filter((o: { status: string }) => o.status === 'delivered').length },
              { status: 'Cancelled', color: 'bg-red-400', count: orders.filter((o: { status: string }) => o.status === 'cancelled').length },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600 flex-1">{item.status}</span>
                <span className="text-sm font-medium text-gray-800">{item.count}</span>
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} rounded-full h-2 transition-all`}
                    style={{ width: orders.length ? `${(item.count / orders.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <span className="text-sm text-gray-500">{orders.length} orders</span>
        </div>
        {isLoading ? (
          <Spinner size="lg" className="py-12" />
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: { _id: string; createdAt: string; totalAmount?: number; status: string }) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700 text-xs">#{order._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => statusMutation.mutate({ id: order._id, status: e.target.value })}
                        disabled={statusMutation.isPending}
                        className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-primary"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </div>{/* end main content */}
      </div>{/* end flex gap-6 */}
    </div>
  );
}
