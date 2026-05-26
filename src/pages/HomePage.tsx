import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { getProducts } from '../api/products.api';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';

const CATEGORIES = [
  { label: 'Men', emoji: '👔', color: 'bg-blue-100 dark:bg-blue-900/30', query: 'men' },
  { label: 'Women', emoji: '👗', color: 'bg-pink-100 dark:bg-pink-900/30', query: 'women' },
  { label: 'Kids', emoji: '🧒', color: 'bg-yellow-100 dark:bg-yellow-900/30', query: 'kids' },
  { label: 'Sports', emoji: '⚽', color: 'bg-green-100 dark:bg-green-900/30', query: 'unisex' },
  { label: 'Beauty', emoji: '💄', color: 'bg-purple-100 dark:bg-purple-900/30', query: 'women' },
  { label: 'Home', emoji: '🏠', color: 'bg-orange-100 dark:bg-orange-900/30', query: '' },
];

export default function HomePage() {
  const trendingRef = useRef(null);
  const newArrivalsRef = useRef(null);
  const trendingInView = useInView(trendingRef, { once: true, margin: '-80px' });
  const newArrivalsInView = useInView(newArrivalsRef, { once: true, margin: '-80px' });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => getProducts({ limit: 8, page: 1 }),
  });

  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => getProducts({ limit: 8, page: 1, sortBy: 'newest' }),
  });

  const trendingProducts = trendingData?.products || trendingData?.data || trendingData || [];
  const newArrivalsProducts = newArrivalsData?.products || newArrivalsData?.data || newArrivalsData || [];

  return (
    <PageTransition>
      <div>
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-primary to-pink-600 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
            <motion.div
              className="flex-1 text-center md:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-pink-200 text-sm font-medium uppercase tracking-widest mb-3">New Season Arrivals</p>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Fashion That<br />
                <span className="text-yellow-300">Speaks For You</span>
              </h1>
              <p className="text-pink-100 text-lg mb-8 max-w-md">
                Discover thousands of styles from top brands. Free delivery on orders above ₹499.
              </p>
              <motion.div
                className="flex gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Link to="/products">
                  <Button size="lg" className="bg-white text-primary hover:bg-pink-50">
                    Shop Now <ArrowRight size={18} className="ml-1" />
                  </Button>
                </Link>
                <Link to="/products?gender=women">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Women's
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-9xl">👗</span>
              </div>
            </motion.div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        </div>

        {/* Offer strip */}
        <div className="bg-primary-50 dark:bg-primary/10 border-y border-primary-100 dark:border-primary/20 py-2">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 text-sm text-primary font-medium overflow-x-auto whitespace-nowrap">
            <span>🚚 Free Delivery above ₹499</span>
            <span>|</span>
            <span>↩️ Easy 30-day Returns</span>
            <span>|</span>
            <span>✅ 100% Authentic Products</span>
            <span>|</span>
            <span>💳 Secure Payments</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Category Bubbles */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6 text-center">Shop by Category</h2>
            <div className="flex gap-6 justify-center flex-wrap">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  to={`/products${cat.query ? `?gender=${cat.query}` : ''}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <motion.div
                    className={`w-20 h-20 ${cat.color} rounded-full flex items-center justify-center text-4xl shadow-sm`}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {cat.emoji}
                  </motion.div>
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text group-hover:text-primary transition-colors">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Promotional banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <motion.div
              className="md:col-span-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-8 text-white flex items-center gap-6"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-wider mb-1">Limited Time</p>
                <h3 className="text-3xl font-bold mb-2">Up to 70% Off</h3>
                <p className="text-yellow-100 mb-4">On selected brands and categories</p>
                <Link to="/products">
                  <Button size="sm" className="bg-white text-orange-600 hover:bg-yellow-50">
                    Shop Sale
                  </Button>
                </Link>
              </div>
              <span className="text-7xl ml-auto">🏷️</span>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white flex flex-col justify-between"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-wider mb-1">New Collection</p>
                <h3 className="text-2xl font-bold mb-2">Summer Vibes</h3>
                <p className="text-purple-200 text-sm">Fresh arrivals every day</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Link to="/products">
                  <Button size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
                    Explore
                  </Button>
                </Link>
                <span className="text-4xl">☀️</span>
              </div>
            </motion.div>
          </div>

          {/* Trending Now */}
          <div className="mb-12" ref={trendingRef}>
            <motion.div
              className="flex items-center justify-between mb-6"
              animate={trendingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">Trending Now</h2>
                <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">What everyone's buying</p>
              </div>
              <Link to="/products" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </motion.div>
            <ProductGrid products={Array.isArray(trendingProducts) ? trendingProducts : []} isLoading={trendingLoading} />
          </div>

          {/* New Arrivals */}
          <div className="mb-12" ref={newArrivalsRef}>
            <motion.div
              className="flex items-center justify-between mb-6"
              animate={newArrivalsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">New Arrivals</h2>
                <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">Just landed in our store</p>
              </div>
              <Link to="/products?sortBy=newest" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </motion.div>
            <ProductGrid products={Array.isArray(newArrivalsProducts) ? newArrivalsProducts : []} isLoading={newArrivalsLoading} />
          </div>

          {/* Brand showcase */}
          <div className="bg-white dark:bg-dark-surface rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2">Top Brands</h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">Authentic products from 500+ brands</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Nike', 'Adidas', 'Puma', 'H&M', 'Zara', 'Levis', 'Tommy', 'US Polo'].map((brand) => (
                <Link
                  key={brand}
                  to={`/products?search=${brand}`}
                  className="px-6 py-2 border border-gray-200 dark:border-dark-border rounded-full text-sm font-medium text-gray-600 dark:text-dark-muted hover:border-primary hover:text-primary transition-colors"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
