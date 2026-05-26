import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orders.api';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';

interface OrderItem {
  variantId?: string;
  qty: number;
  price: number;
  product?: {
    title?: string;
    images?: string[];
  };
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
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

export default function OrdersPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  });

  const orders: Order[] = data?.orders || data?.data || (Array.isArray(data) ? data : []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Package size={80} className="mx-auto text-gray-200 dark:text-dark-border mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-dark-muted mb-6">When you place orders, they'll show up here</p>
          <Link to="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6">My Orders</h1>
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-dark-surface rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow border border-transparent dark:border-dark-border"
              onClick={() => navigate(`/orders/my/${order._id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Order ID and date */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500 dark:text-dark-muted">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-gray-400 dark:text-dark-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-2">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-12 h-14 bg-gray-100 dark:bg-dark-bg rounded overflow-hidden shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-surface dark:to-dark-bg flex items-center justify-center">
                            <Package size={14} className="text-gray-300 dark:text-dark-border" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-dark-muted">+{order.items.length - 3} more</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-dark-muted">
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-base font-bold text-gray-900 dark:text-dark-text">₹{order.totalAmount?.toLocaleString()}</span>
                  <ChevronRight size={16} className="text-gray-400 dark:text-dark-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
