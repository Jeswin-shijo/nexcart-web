import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, getCategories, getBrands } from '../api/products.api';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters, { type FilterState } from '../components/products/ProductFilters';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';

const SORT_OPTIONS = [
  { label: 'Recommended', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Newest', value: 'newest' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filters: FilterState = {
    gender: searchParams.get('gender') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    brandId: searchParams.get('brandId') || undefined,
  };

  const sortBy = searchParams.get('sortBy') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { ...filters, sortBy, search, page }],
    queryFn: () =>
      getProducts({
        gender: filters.gender,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        categoryId: filters.categoryId,
        brandId: filters.brandId,
        sortBy: sortBy || undefined,
        search: search || undefined,
        page,
        limit: 20,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const products = productsData?.products || productsData?.data || (Array.isArray(productsData) ? productsData : []);
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData?.categories || categoriesData?.data || (Array.isArray(categoriesData) ? categoriesData : []);
  const brands = brandsData?.brands || brandsData?.data || (Array.isArray(brandsData) ? brandsData : []);

  function handleFiltersChange(newFilters: FilterState) {
    const params = new URLSearchParams(searchParams);
    if (newFilters.gender) params.set('gender', newFilters.gender); else params.delete('gender');
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice); else params.delete('minPrice');
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice); else params.delete('maxPrice');
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId); else params.delete('categoryId');
    if (newFilters.brandId) params.set('brandId', newFilters.brandId); else params.delete('brandId');
    setSearchParams(params);
    setFiltersOpen(false);
  }

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('sortBy', value); else params.delete('sortBy');
    setSearchParams(params);
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              {productsData?.total || products.length} items
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort - always visible */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 dark:border-dark-border rounded px-3 py-1.5 text-sm text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Filters toggle (mobile) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white dark:bg-dark-surface rounded-lg p-4">
              <ProductFilters
                filters={filters}
                onChange={handleFiltersChange}
                categories={categories}
                brands={brands}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} isLoading={isLoading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-dark-muted">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                className="absolute inset-0 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)}
              />
              <motion.div
                className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-dark-surface overflow-y-auto"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="font-semibold text-gray-800 dark:text-dark-text">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)} className="text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <ProductFilters
                    filters={filters}
                    onChange={handleFiltersChange}
                    categories={categories}
                    brands={brands}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
