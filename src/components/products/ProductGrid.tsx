import { motion, type Variants } from 'framer-motion';
import Spinner from '../ui/Spinner';
import ProductCard, { type Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-1">No products found</h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <motion.div key={product._id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
