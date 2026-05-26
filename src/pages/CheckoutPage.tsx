import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Plus, MapPin } from 'lucide-react';
import { getAddresses, createAddress } from '../api/users.api';
import { getCart } from '../api/cart.api';
import { placeOrder } from '../api/orders.api';
import { useCartStore } from '../store/cart.store';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageTransition from '../components/motion/PageTransition';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Nexcart Wallet balance' },
];

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { clearCartStore } = useCartStore();
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', pincode: '',
  });

  const { data: addressData, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });

  const addresses: Address[] = addressData?.addresses || addressData?.data || (Array.isArray(addressData) ? addressData : []);
  const cart = cartData?.cart || cartData;
  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discount;

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      refetchAddresses();
      setShowAddressForm(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
      toast.success('Address saved!');
    },
    onError: () => toast.error('Failed to save address'),
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      clearCartStore();
      setSuccessModal(true);
    },
    onError: () => toast.error('Failed to place order. Please try again.'),
  });

  function handleAddAddress() {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all address fields');
      return;
    }
    createAddressMutation.mutate(newAddress);
  }

  function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    placeOrderMutation.mutate({
      addressId: selectedAddress,
      paymentMethod,
      couponCode: couponApplied ? coupon : undefined,
    });
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === 'NEXCART10') {
      setCouponApplied(true);
      toast.success('Coupon applied! 10% discount');
    } else {
      toast.error('Invalid coupon code');
    }
  }

  if (successModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl p-8 max-w-sm w-full text-center border dark:border-dark-border">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2">Order Placed!</h2>
          <p className="text-gray-500 dark:text-dark-muted mb-6">Your order has been placed successfully. You'll receive a confirmation shortly.</p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/orders/my')}
          >
            View My Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6">Checkout</h1>

        {/* Step tabs */}
        <div className="flex items-center gap-0 mb-8">
          <button
            onClick={() => setStep('address')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${step === 'address' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-dark-muted'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'address' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-dark-muted'}`}>1</span>
            Address
          </button>
          <button
            onClick={() => step !== 'address' && setStep('payment')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${step === 'payment' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-dark-muted'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-dark-muted'}`}>2</span>
            Payment
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            {step === 'address' ? (
              <div className="bg-white dark:bg-dark-surface rounded-lg p-5 border border-transparent dark:border-dark-border">
                <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Delivery Address
                </h2>

                {addresses.length === 0 && !showAddressForm && (
                  <p className="text-gray-500 dark:text-dark-muted text-sm mb-4">No saved addresses. Add one below.</p>
                )}

                {/* Address list */}
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label key={addr._id} className={`flex gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress === addr._id ? 'border-primary bg-primary-50 dark:bg-primary/10' : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-muted'}`}>
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-800 dark:text-dark-text">{addr.fullName} · {addr.phone}</p>
                        <p className="text-gray-500 dark:text-dark-muted mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Add new address form */}
                {showAddressForm ? (
                  <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                      <Input label="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                    </div>
                    <Input label="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                      <Input label="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                      <Input label="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddAddress} disabled={createAddressMutation.isPending} size="sm">
                        {createAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                )}

                <Button
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  disabled={!selectedAddress}
                  onClick={() => setStep('payment')}
                >
                  Continue to Payment
                </Button>
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg p-5 border border-transparent dark:border-dark-border">
                <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-4">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((pm) => (
                    <label key={pm.id} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === pm.id ? 'border-primary bg-primary-50 dark:bg-primary/10' : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-muted'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-primary"
                      />
                      <span className="text-xl">{pm.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{pm.label}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Coupon Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code (try NEXCART10)"
                      disabled={couponApplied}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-dark-muted focus:outline-none focus:border-primary"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={couponApplied ? () => { setCouponApplied(false); setCoupon(''); } : applyCoupon}
                    >
                      {couponApplied ? 'Remove' : 'Apply'}
                    </Button>
                  </div>
                  {couponApplied && <p className="text-xs text-green-600 mt-1">✓ NEXCART10 applied — 10% off</p>}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending}
                >
                  {placeOrderMutation.isPending ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString()}`}
                </Button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white dark:bg-dark-surface rounded-lg p-5 sticky top-20 border border-transparent dark:border-dark-border">
              <h3 className="font-semibold text-gray-700 dark:text-dark-text uppercase text-sm mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartItems.map((item: { variantId: string; qty: number; price: number; product?: { title?: string; images?: string[] } }) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-gray-100 dark:bg-dark-bg rounded overflow-hidden shrink-0">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-dark-text truncate">{item.product?.title || 'Product'}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted">Qty: {item.qty}</p>
                    </div>
                    <p className="text-xs font-medium shrink-0 text-gray-800 dark:text-dark-text">₹{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-dark-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                  <span>Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 dark:text-dark-text border-t border-gray-100 dark:border-dark-border pt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
