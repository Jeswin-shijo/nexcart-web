import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductBySlug } from '../api/products.api';
import { addToCart } from '../api/cart.api';
import { toggleWishlist } from '../api/wishlist.api';
import { useCartStore } from '../store/cart.store';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PageTransition from '../components/motion/PageTransition';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setCart } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  const product = data?.product || data;

  const addToCartMutation = useMutation({
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) =>
      addToCart(variantId, qty),
    onSuccess: (cartData) => {
      setCart(cartData?.cart || cartData);
      toast.success('Added to bag!');
    },
    onError: () => {
      toast.error('Please login to add to cart');
    },
  });

  function handleAddToCart() {
    if (!selectedVariant && product?.variants?.length > 0) {
      toast.error('Please select a size');
      return;
    }
    const variantId = selectedVariant || product?._id;
    addToCartMutation.mutate({ variantId, qty: 1 });
  }

  async function handleWishlist() {
    try {
      await toggleWishlist(product._id);
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Please login to add to wishlist');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50 dark:bg-dark-bg">
        <p className="text-gray-600 dark:text-dark-muted">Product not found</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const images: string[] = product.images || [];
  const discountPercent = product.basePrice > product.discountedPrice
    ? Math.round(((product.basePrice - product.discountedPrice) / product.basePrice) * 100)
    : 0;
  const variants = product.variants || [];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 dark:text-dark-muted mb-6 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-primary">Products</button>
          <span>/</span>
          <span className="text-gray-800 dark:text-dark-text truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="lg:w-[45%]">
            <div className="flex gap-3">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2 w-16">
                  {images.slice(0, 6).map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-20 border-2 rounded overflow-hidden ${selectedImage === i ? 'border-primary' : 'border-gray-200 dark:border-dark-border'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative bg-gray-100 dark:bg-dark-surface rounded-lg overflow-hidden aspect-[3/4]">
                <AnimatePresence mode="wait">
                  {images.length > 0 ? (
                    <motion.img
                      key={selectedImage}
                      src={images[selectedImage]}
                      alt={product.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-muted">
                      <ShoppingBag size={64} />
                    </div>
                  )}
                </AnimatePresence>

                {/* Image nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                      disabled={selectedImage === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-dark-surface/80 rounded-full p-1 shadow disabled:opacity-30"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((i) => Math.min(images.length - 1, i + 1))}
                      disabled={selectedImage === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-dark-surface/80 rounded-full p-1 shadow disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:flex-1">
            {/* Brand */}
            {product.brandId?.name && (
              <p className="text-sm font-semibold text-gray-500 dark:text-dark-muted uppercase mb-1">{product.brandId.name}</p>
            )}

            {/* Title */}
            <h1 className="text-xl font-medium text-gray-800 dark:text-dark-text mb-3">{product.title}</h1>

            {/* Ratings */}
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-green-600 text-white text-sm px-2 py-0.5 rounded">
                  <span>{product.ratings.average?.toFixed(1)}</span>
                  <Star size={12} className="fill-white" />
                </div>
                <span className="text-sm text-gray-500 dark:text-dark-muted">({product.ratings.count} ratings)</span>
              </div>
            )}

            {/* Price */}
            <div className="border-t border-b border-gray-100 dark:border-dark-border py-4 mb-4">
              <p className="text-xs text-gray-400 dark:text-dark-muted uppercase tracking-wide mb-1">Price</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                  ₹{product.discountedPrice?.toLocaleString()}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-base text-gray-400 dark:text-dark-muted line-through">
                      ₹{product.basePrice?.toLocaleString()}
                    </span>
                    <span className="text-base text-green-600 font-semibold">
                      {discountPercent}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Inclusive of all taxes</p>
            </div>

            {/* Size selector */}
            {variants.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2 flex items-center gap-2">
                  SELECT SIZE
                  <span className="text-xs text-primary font-medium cursor-pointer">Size Guide</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant: { _id: string; size?: string; color?: string; stock?: number }) => (
                    <motion.button
                      key={variant._id}
                      onClick={() => setSelectedVariant(variant._id)}
                      disabled={variant.stock === 0}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 border rounded text-sm font-medium transition-colors
                        ${selectedVariant === variant._id
                          ? 'border-primary bg-primary-50 dark:bg-primary/10 text-primary'
                          : 'border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:border-gray-400 dark:hover:border-dark-muted'
                        }
                        ${variant.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                      `}
                    >
                      {variant.size || variant.color || variant._id.slice(-4)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="w-full flex items-center gap-2"
                >
                  <ShoppingBag size={18} />
                  {addToCartMutation.isPending ? 'Adding...' : 'Add to Bag'}
                </Button>
              </motion.div>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlist}
                className="flex items-center gap-2"
              >
                <Heart size={18} className={wishlisted ? 'fill-primary text-primary' : ''} />
                Wishlist
              </Button>
            </div>

            {/* Delivery info */}
            <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 mb-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                <span>🚚</span>
                <div>
                  <span className="font-medium">Free Delivery</span>
                  <span className="text-gray-500 dark:text-dark-muted ml-1">on orders above ₹499</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                <span>↩️</span>
                <div>
                  <span className="font-medium">30 Day Returns</span>
                  <span className="text-gray-500 dark:text-dark-muted ml-1">Easy hassle-free returns</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                <span>✅</span>
                <span className="font-medium">100% Authentic</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text uppercase mb-2">Product Details</h3>
                <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text uppercase mb-2">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-100 dark:border-dark-border">
                        <td className="py-2 text-gray-500 dark:text-dark-muted capitalize w-1/3">{key}</td>
                        <td className="py-2 text-gray-800 dark:text-dark-text">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
