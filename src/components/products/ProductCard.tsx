import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleWishlist } from '../../api/wishlist.api';
import toast from 'react-hot-toast';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  images?: string[];
  brandId?: { name: string } | null;
  discountedPrice: number;
  basePrice: number;
  ratings?: {
    average?: number;
    avg?: number;
    count: number;
  };
}

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string, newState: boolean) => void;
}

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }: ProductCardProps) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const discountPercent =
    product.basePrice > product.discountedPrice
      ? Math.round(((product.basePrice - product.discountedPrice) / product.basePrice) * 100)
      : 0;
  const ratingAverage = product.ratings?.average ?? product.ratings?.avg;

  async function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      await toggleWishlist(product._id);
      const newState = !wishlisted;
      setWishlisted(newState);
      if (newState) setHeartAnim(true);
      toast.success(newState ? 'Added to wishlist' : 'Removed from wishlist');
      onWishlistToggle?.(product._id, newState);
    } catch {
      toast.error('Login to add to wishlist');
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-dark-surface rounded-sm overflow-hidden cursor-pointer group"
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-dark-bg overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <motion.img
            src={product.images[0]}
            alt={product.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-surface dark:to-dark-bg flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Wishlist button */}
        <motion.button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          whileTap={{ scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="absolute top-2 right-2 p-1.5 bg-white dark:bg-dark-surface rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <AnimatePresence>
            <motion.span
              key={heartAnim ? 'anim' : 'idle'}
              animate={heartAnim ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              onAnimationComplete={() => setHeartAnim(false)}
            >
              <Heart
                size={16}
                className={wishlisted ? 'fill-primary text-primary' : 'text-gray-400'}
              />
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute bottom-2 left-2 bg-primary-50 border border-primary-100 text-primary text-xs font-semibold px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {product.brandId?.name && (
          <p className="text-xs text-gray-500 dark:text-dark-muted font-medium uppercase truncate mb-0.5">
            {product.brandId.name}
          </p>
        )}
        <p className="text-sm text-gray-800 dark:text-dark-text truncate">{product.title}</p>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-gray-900 dark:text-dark-text">
            ₹{product.discountedPrice.toLocaleString()}
          </span>
          {product.basePrice > product.discountedPrice && (
            <>
              <span className="text-xs text-gray-400 dark:text-dark-muted line-through">
                ₹{product.basePrice.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 font-medium">
                ({discountPercent}% off)
              </span>
            </>
          )}
        </div>

        {/* Ratings */}
        {product.ratings && product.ratings.count > 0 && ratingAverage !== undefined && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
              <span>{ratingAverage.toFixed(1)}</span>
              <Star size={10} className="fill-white" />
            </div>
            <span className="text-xs text-gray-400 dark:text-dark-muted">({product.ratings.count})</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
