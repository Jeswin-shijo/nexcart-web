import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { getMyOrders } from '../../api/orders.api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const NAV_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/products', label: 'My Products', icon: Package },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/', label: 'Back to Store', icon: Store },
];

function SellerSidebar() {
  return (
    <aside className="w-64 shrink-0 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-pink-400 font-bold text-lg tracking-wide">Seller Hub</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/seller/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive && to !== '/'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'];

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'confirmed':
    case 'shipped': return 'warning';
    default: return 'default';
  }
}

export default function SellerOrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-orders-seller'],
    queryFn: getMyOrders,
  });

  const allOrders: any[] = data?.orders || data?.data || (Array.isArray(data) ? data : []);

  const filteredOrders =
    activeTab === 'All'
      ? allOrders
      : allOrders.filter((o: any) => o.status?.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SellerSidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <Spinner size="lg" className="py-16" />
          ) : isError ? (
            <div className="text-center py-16 text-gray-500">Failed to load orders.</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No orders found</p>
              {activeTab !== 'All' && (
                <p className="text-sm mt-1">Try switching to a different filter tab.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order: any) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/orders/my/${order._id}`)}
                    >
                      <td className="px-6 py-4 font-mono text-gray-700 text-xs">
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {order.userId?.name || order.user?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.items?.length ?? order.orderItems?.length ?? '—'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                        ₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                            : '—'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
