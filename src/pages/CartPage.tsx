import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCart, updateCartItem, clearCart } from '../api/cart.api';
import { useCartStore } from '../store/cart.store';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PageTransition from '../components/motion/PageTransition';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCart, clearCartStore } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });

  useEffect(() => {
    if (data) {
      setCart(data?.cart || data);
    }
  }, [data, setCart]);

  const updateMutation = useMutation({
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) =>
      updateCartItem(variantId, qty),
    onSuccess: (result) => {
      setCart(result?.cart || result);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => toast.error('Failed to update cart'),
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      clearCartStore();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: () => toast.error('Failed to clear cart'),
  });

  const cart = data?.cart || data;
  const items = cart?.items || [];
  const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-200 dark:text-dark-border mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2">Your bag is empty</h2>
          <p className="text-gray-500 dark:text-dark-muted mb-6">Add items to it now</p>
          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6">My Bag ({items.length} items)</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart items */}
          <div className="flex-1 space-y-3">
            <AnimatePresence>
              {items.map((item: CartItem) => (
                <motion.div
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <CartItemRow
                    item={item}
                    onUpdate={(qty) => updateMutation.mutate({ variantId: item.variantId, qty })}
                    isUpdating={updateMutation.isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white dark:bg-dark-surface rounded-lg p-5 sticky top-20">
              <h3 className="font-semibold text-gray-700 dark:text-dark-text uppercase text-sm mb-4">Price Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700 dark:text-dark-text">
                  <span>Price ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-dark-text">
                  <span>Delivery Charges</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-dark-border pt-3 flex justify-between font-semibold text-gray-900 dark:text-dark-text">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  Add ₹{(499 - subtotal).toLocaleString()} more for free delivery
                </p>
              )}
              <Button
                size="lg"
                className="w-full mt-5"
                onClick={() => navigate('/checkout')}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

interface CartItem {
  variantId: string;
  qty: number;
  price: number;
  size?: string;
  color?: string;
  product?: {
    _id: string;
    title: string;
    images?: string[];
    slug?: string;
    brandId?: { name: string };
  };
}

interface CartItemRowProps {
  item: CartItem;
  onUpdate: (qty: number) => void;
  isUpdating: boolean;
}

function CartItemRow({ item, onUpdate, isUpdating }: CartItemRowProps) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-4 flex gap-4">
      {/* Image */}
      <div className="w-24 h-28 bg-gray-100 dark:bg-dark-bg rounded overflow-hidden shrink-0">
        {item.product?.images?.[0] ? (
          <img
            src={item.product.images[0]}
            alt={item.product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-surface dark:to-dark-bg" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {item.product?.brandId?.name && (
          <p className="text-xs text-gray-500 dark:text-dark-muted font-medium uppercase mb-0.5">{item.product.brandId.name}</p>
        )}
        <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">{item.product?.title || 'Product'}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-dark-muted mt-1">
          {item.size && <span>Size: <strong className="text-gray-700 dark:text-dark-text">{item.size}</strong></span>}
          {item.color && <span>Color: <strong className="text-gray-700 dark:text-dark-text">{item.color}</strong></span>}
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-dark-text mt-2">₹{item.price.toLocaleString()}</p>

        {/* Qty stepper */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdate(item.qty - 1)}
            disabled={item.qty <= 1 || isUpdating}
            className="w-7 h-7 border border-gray-300 dark:border-dark-border rounded flex items-center justify-center hover:border-primary disabled:opacity-40 text-gray-600 dark:text-dark-text"
          >
            <Minus size={12} />
          </button>
          <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-dark-text">{item.qty}</span>
          <button
            onClick={() => onUpdate(item.qty + 1)}
            disabled={isUpdating}
            className="w-7 h-7 border border-gray-300 dark:border-dark-border rounded flex items-center justify-center hover:border-primary disabled:opacity-40 text-gray-600 dark:text-dark-text"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onUpdate(0)}
        disabled={isUpdating}
        className="text-gray-400 hover:text-red-500 transition-colors self-start"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
