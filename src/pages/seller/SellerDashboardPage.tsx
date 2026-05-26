import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { getSellerStats, getSellerProducts } from '../../api/sellers.api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const NAV_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/products', label: 'My Products', icon: Package },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/', label: 'Back to Store', icon: Store },
];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

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

function DashboardHome() {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: getSellerStats,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: getSellerProducts,
  });

  const products: any[] = productsData?.products || productsData?.data || (Array.isArray(productsData) ? productsData : []);

  return (
    <div className="flex-1 p-8">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name || 'Seller'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <Badge variant="warning" className="px-3 py-1 text-sm">
          {stats?.status || 'pending'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Total Products"
          value={statsLoading ? '...' : (stats?.productCount ?? '—')}
          icon={<Package size={22} className="text-pink-500" />}
          color="bg-pink-100"
        />
        <StatCard
          label="Pending Orders"
          value={statsLoading ? '...' : (stats?.totalOrders ?? 0)}
          icon={<ShoppingBag size={22} className="text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          label="Revenue"
          value={statsLoading ? '...' : `₹${(stats?.revenue ?? 0).toLocaleString('en-IN')}`}
          icon={<TrendingUp size={22} className="text-green-600" />}
          color="bg-green-100"
        />
      </div>

      {/* My Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">My Products</h2>
          <NavLink
            to="/seller/products"
            className="text-sm text-pink-500 hover:text-pink-600 font-medium"
          >
            Manage All →
          </NavLink>
        </div>

        {productsLoading ? (
          <Spinner size="lg" className="py-12" />
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.slice(0, 5).map((product: any) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">{product.title}</td>
                    <td className="px-6 py-3 text-gray-600">
                      ₹{(product.discountedPrice ?? product.basePrice ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={product.isActive !== false ? 'success' : 'default'}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
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
  );
}

export default function SellerDashboardPage() {
  const location = useLocation();
  const isDashboardHome = location.pathname === '/seller/dashboard';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SellerSidebar />
      {isDashboardHome ? <DashboardHome /> : <Outlet />}
    </div>
  );
}
