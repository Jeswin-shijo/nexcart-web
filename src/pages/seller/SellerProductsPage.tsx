import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSellerProducts,
  getSellerProfile,
} from '../../api/sellers.api';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getCategories,
  createVariant,
  getVariantsByProduct,
  updateVariantStock,
} from '../../api/products.api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

// ------- Nav -------

const NAV_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/products', label: 'My Products', icon: Package },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/', label: 'Back to Store', icon: Store },
];

function SellerSidebar() {
  return (
    <aside className="w-64 shrink-0 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-pink-400 font-bold text-lg tracking-wide">Seller Hub</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/seller/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive && to !== '/'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

// ------- Product form -------

interface ProductFormData {
  title: string;
  slug: string;
  brandId: string;
  categoryId: string;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  basePrice: number;
  discountedPrice: number;
  description: string;
  images: string;
  tags: string;
}

const productSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  brandId: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  gender: z.enum(['men', 'women', 'unisex', 'kids']),
  basePrice: z.number().min(0, 'Base price required'),
  discountedPrice: z.number().min(0, 'Discounted price required'),
  description: z.string().min(5, 'Description is required'),
  images: z.string(),
  tags: z.string(),
});

// ------- Variant form -------

interface VariantFormData {
  size: string;
  color: string;
  sku: string;
  stock: number;
  additionalPrice: number;
}

const variantSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().min(0, 'Stock required'),
  additionalPrice: z.number().min(0, 'Price required'),
});

// ------- Product Modal -------

interface ProductModalProps {
  product?: any;
  onClose: () => void;
}

function ProductModal({ product, onClose }: ProductModalProps) {
  const queryClient = useQueryClient();

  const { data: brandsData } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const brands: any[] = brandsData?.brands || brandsData?.data || (Array.isArray(brandsData) ? brandsData : []);
  const categories: any[] = categoriesData?.categories || categoriesData?.data || (Array.isArray(categoriesData) ? categoriesData : []);

  const { data: sellerData } = useQuery({ queryKey: ['seller-profile'], queryFn: getSellerProfile });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          title: product.title || '',
          slug: product.slug || '',
          brandId: product.brandId?._id || product.brandId || '',
          categoryId: product.categoryId?._id || product.categoryId || '',
          gender: product.gender || 'unisex',
          basePrice: product.basePrice || 0,
          discountedPrice: product.discountedPrice || 0,
          description: product.description || '',
          images: (product.images || []).join(', '),
          tags: (product.tags || []).join(', '),
        }
      : {
          title: '',
          slug: '',
          brandId: '',
          categoryId: '',
          gender: 'unisex' as const,
          basePrice: 0,
          discountedPrice: 0,
          description: '',
          images: '',
          tags: '',
        },
  });

  const titleValue = watch('title');
  useEffect(() => {
    if (!product) {
      const slug = titleValue
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug || '');
    }
  }, [titleValue, product, setValue]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update product');
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    const payload = {
      ...data,
      basePrice: Number(data.basePrice),
      discountedPrice: Number(data.discountedPrice),
      images: data.images ? data.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      sellerId: (sellerData as any)?._id || (sellerData as any)?.id,
    };
    if (product) {
      updateMutation.mutate({ id: product._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-lg">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" error={errors.title?.message} {...register('title')} />
            <Input label="Slug" error={errors.slug?.message} {...register('slug')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <select
                {...register('brandId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select brand...</option>
                {brands.map((b: any) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              {errors.brandId && <p className="text-xs text-red-500">{errors.brandId.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                {...register('categoryId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select category...</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Price (₹)"
              type="number"
              step="0.01"
              error={errors.basePrice?.message}
              {...register('basePrice', { valueAsNumber: true })}
            />
            <Input
              label="Discounted Price (₹)"
              type="number"
              step="0.01"
              error={errors.discountedPrice?.message}
              {...register('discountedPrice', { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <Input
            label="Images (comma-separated URLs)"
            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            {...register('images')}
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="casual, summer, trending"
            {...register('tags')}
          />
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-pink-500 hover:bg-pink-600 text-white border-0"
            onClick={handleSubmit(onSubmit)}
          >
            {isPending ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ------- Variant Manager -------

interface VariantManagerProps {
  productId: string;
  productTitle: string;
}

function VariantManager({ productId, productTitle }: VariantManagerProps) {
  const queryClient = useQueryClient();
  const [editingStock, setEditingStock] = useState<{ id: string; stock: number } | null>(null);

  const { data: variantsData, isLoading } = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => getVariantsByProduct(productId),
  });

  const variants: any[] = variantsData?.variants || variantsData?.data || (Array.isArray(variantsData) ? variantsData : []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema) as any,
    defaultValues: { size: '', color: '', sku: '', additionalPrice: 0, stock: 0 },
  });

  const addVariantMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      toast.success('Variant added');
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      reset({ size: '', color: '', sku: '', additionalPrice: 0, stock: 0 });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add variant');
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => updateVariantStock(id, stock),
    onSuccess: () => {
      toast.success('Stock updated');
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      setEditingStock(null);
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const onAddVariant: SubmitHandler<VariantFormData> = (data) => {
    addVariantMutation.mutate({
      ...data,
      stock: Number(data.stock),
      additionalPrice: Number(data.additionalPrice),
      productId,
    });
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Variants for: <span className="text-pink-500">{productTitle}</span>
      </h4>

      {isLoading ? (
        <Spinner size="sm" className="py-4" />
      ) : variants.length === 0 ? (
        <p className="text-sm text-gray-500 mb-3">No variants yet.</p>
      ) : (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Color</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">+Price</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v: any) => (
                <tr key={v._id} className="border-b border-gray-100">
                  <td className="py-2 px-3">{v.size}</td>
                  <td className="py-2 px-3">{v.color}</td>
                  <td className="py-2 px-3 font-mono text-xs">{v.sku}</td>
                  <td className="py-2 px-3">
                    {editingStock !== null && editingStock.id === v._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingStock.stock}
                          onChange={(e) =>
                            setEditingStock({ id: v._id, stock: Number(e.target.value) })
                          }
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={() => {
                            if (editingStock) {
                              updateStockMutation.mutate({ id: editingStock.id, stock: editingStock.stock });
                            }
                          }}
                          className="text-xs text-green-600 font-medium hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStock(null)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer text-gray-700 hover:text-pink-500"
                        onClick={() => setEditingStock({ id: v._id, stock: v.stock })}
                      >
                        {v.stock}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">₹{v.additionalPrice}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => setEditingStock({ id: v._id, stock: v.stock })}
                      className="text-xs text-pink-500 hover:underline"
                    >
                      Edit Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add variant form */}
      <form onSubmit={handleSubmit(onAddVariant)} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Input label="Size" error={errors.size?.message} placeholder="M, L, XL" {...register('size')} />
        <Input label="Color" error={errors.color?.message} placeholder="Red" {...register('color')} />
        <Input label="SKU" error={errors.sku?.message} placeholder="ABC-001" {...register('sku')} />
        <Input
          label="Stock"
          type="number"
          error={errors.stock?.message}
          {...register('stock', { valueAsNumber: true })}
        />
        <Input
          label="Additional Price (₹)"
          type="number"
          step="0.01"
          error={errors.additionalPrice?.message}
          {...register('additionalPrice', { valueAsNumber: true })}
        />
        <div className="flex items-end">
          <Button
            type="submit"
            size="sm"
            disabled={addVariantMutation.isPending}
            className="bg-pink-500 hover:bg-pink-600 text-white border-0 w-full"
          >
            {addVariantMutation.isPending ? 'Adding...' : 'Add Variant'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ------- Main Page -------

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [expandedVariants, setExpandedVariants] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['seller-products'],
    queryFn: getSellerProducts,
  });

  const products: any[] = productsData?.products || productsData?.data || (Array.isArray(productsData) ? productsData : []);

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setDeleteConfirm(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    },
  });

  const discountPercent = (base: number, discounted: number) => {
    if (!base || base === 0) return 0;
    return Math.round(((base - discounted) / base) * 100);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SellerSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
          </div>
          <Button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="bg-pink-500 hover:bg-pink-600 text-white border-0 flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <Spinner size="lg" className="py-16" />
          ) : isError ? (
            <div className="text-center py-16 text-gray-500">Failed to load products.</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Add your first product to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thumbnail</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product: any) => (
                    <>
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package size={18} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{product.title}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {product.brandId?.name || product.brand?.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {product.categoryId?.name || product.category?.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          ₹{(product.discountedPrice ?? product.basePrice ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          {product.basePrice && product.discountedPrice ? (
                            <span className="text-green-600 font-medium">
                              {discountPercent(product.basePrice, product.discountedPrice)}% off
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={product.isActive !== false ? 'success' : 'default'}>
                            {product.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditProduct(product); setShowModal(true); }}
                              className="p-1.5 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product._id)}
                              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              onClick={() =>
                                setExpandedVariants(expandedVariants === product._id ? null : product._id)
                              }
                              className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              title="Manage Variants"
                            >
                              {expandedVariants === product._id ? (
                                <ChevronUp size={15} />
                              ) : (
                                <ChevronDown size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedVariants === product._id && (
                        <tr key={`${product._id}-variants`}>
                          <td colSpan={8} className="px-6 pb-4 bg-gray-50">
                            <VariantManager productId={product._id} productTitle={product.title} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
