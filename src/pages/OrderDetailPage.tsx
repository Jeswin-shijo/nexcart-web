import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, MapPin, CreditCard, Check } from 'lucide-react';
import { getOrderById, cancelOrder } from '../api/orders.api';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'confirmed':
    case 'shipped': return 'warning';
    default: return 'default';
  }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id!),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: () => toast.error('Failed to cancel order'),
  });

  const order = data?.order || data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-gray-600 dark:text-dark-muted">Order not found</p>
        <Button onClick={() => navigate('/orders/my')}>My Orders</Button>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status?.toLowerCase());
  const canCancel = ['pending', 'confirmed'].includes(order.status?.toLowerCase());

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <button onClick={() => navigate('/orders/my')} className="text-sm text-gray-500 dark:text-dark-muted hover:text-primary mb-1 flex items-center gap-1">
              ← My Orders
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusVariant(order.status)}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </Badge>
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Status timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white dark:bg-dark-surface rounded-lg p-5 border border-transparent dark:border-dark-border">
                <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-4">Order Timeline</h3>
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-400 dark:text-dark-muted'}`}>
                          {i <= currentStep ? <Check size={14} /> : i + 1}
                        </div>
                        <span className={`text-xs mt-1 text-center capitalize ${i <= currentStep ? 'text-primary font-medium' : 'text-gray-400 dark:text-dark-muted'}`}>
                          {step}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 mb-4 rounded ${i < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white dark:bg-dark-surface rounded-lg p-5 border border-transparent dark:border-dark-border">
              <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                <Package size={18} className="text-primary" /> Order Items
              </h3>
              <div className="space-y-4">
                {order.items?.map((item: { variantId?: string; qty: number; price: number; size?: string; color?: string; product?: { title?: string; images?: string[]; brandId?: { name?: string } } }, i: number) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-dark-border last:border-0 last:pb-0">
                    <div className="w-16 h-20 bg-gray-100 dark:bg-dark-bg rounded overflow-hidden shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-dark-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.product?.brandId?.name && (
                        <p className="text-xs text-gray-500 dark:text-dark-muted uppercase font-medium">{item.product.brandId.name}</p>
                      )}
                      <p className="text-sm text-gray-800 dark:text-dark-text font-medium">{item.product?.title || 'Product'}</p>
                      <div className="flex gap-3 text-xs text-gray-500 dark:text-dark-muted mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.qty}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-dark-text mt-1">₹{item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Delivery address */}
            {order.address && (
              <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-transparent dark:border-dark-border">
                <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-3 flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-primary" /> Delivery Address
                </h3>
                <div className="text-sm text-gray-600 dark:text-dark-muted space-y-0.5">
                  <p className="font-medium text-gray-800 dark:text-dark-text">{order.address.fullName}</p>
                  <p>{order.address.phone}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-transparent dark:border-dark-border">
              <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-3 flex items-center gap-2 text-sm">
                <CreditCard size={16} className="text-primary" /> Payment
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                  <span>Method</span>
                  <span className="uppercase font-medium text-gray-800 dark:text-dark-text">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString() || order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                  <span>Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-dark-text border-t border-gray-100 dark:border-dark-border pt-2">
                  <span>Total</span>
                  <span>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
