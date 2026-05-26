import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWishlist } from '../api/wishlist.api';
import ProductCard from '../components/products/ProductCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const wishlist = data?.wishlist || data;
  const products = wishlist?.productIds || wishlist?.products || (Array.isArray(wishlist) ? wishlist : []);

  function handleWishlistToggle(_productId: string, newState: boolean) {
    if (!newState) {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Heart size={80} className="mx-auto text-gray-200 dark:text-dark-border mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-dark-muted mb-6">Save items you love to your wishlist</p>
          <Link to="/products">
            <Button size="lg">Discover Products</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6">
          My Wishlist ({products.length} items)
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product: { _id: string; title: string; slug: string; images?: string[]; brandId?: { name: string } | null; discountedPrice: number; basePrice: number; ratings?: { average: number; count: number } }) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
