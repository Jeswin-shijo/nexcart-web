import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../api/coupons.api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface Coupon {
  _id: string;
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
}

const couponSchema = z.object({
  code: z.string().min(2, 'Code required'),
  type: z.enum(['flat', 'percent']),
  value: z.coerce.number().positive('Value must be positive'),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).default(0),
  expiresAt: z.string().default(''),
  usageLimit: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean(),
});

type CouponForm = {
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  expiresAt: string;
  usageLimit: number;
  isActive: boolean;
};

function CouponModal({
  coupon,
  onClose,
}: {
  coupon: Coupon | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!coupon;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: coupon?.code ?? '',
      type: coupon?.type ?? 'flat',
      value: coupon?.value ?? 0,
      minOrderValue: coupon?.minOrderValue ?? 0,
      maxDiscount: coupon?.maxDiscount ?? 0,
      expiresAt: coupon?.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
        : '',
      usageLimit: coupon?.usageLimit ?? 0,
      isActive: coupon?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CouponForm) =>
      isEdit
        ? updateCoupon(coupon!._id, data)
        : createCoupon(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Coupon updated' : 'Coupon created');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      onClose();
    },
    onError: () => toast.error(isEdit ? 'Failed to update coupon' : 'Failed to create coupon'),
  });

  function onSubmit(data: any) {
    mutation.mutate(data as CouponForm);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {isEdit ? 'Edit Coupon' : 'Add Coupon'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              {...register('code')}
              onChange={(e) =>
                setValue('code', e.target.value.toUpperCase().replace(/\s/g, ''))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500 uppercase"
              placeholder="SAVE20"
            />
            {errors.code && (
              <p className="text-xs text-red-500 mt-0.5">{errors.code.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              {...register('type')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            >
              <option value="flat">Flat</option>
              <option value="percent">Percent</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value ({watch('type') === 'percent' ? '%' : '₹'})
            </label>
            <input
              {...register('value')}
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
            {errors.value && (
              <p className="text-xs text-red-500 mt-0.5">{errors.value.message}</p>
            )}
          </div>

          {/* Min Order Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Order Value (₹)
            </label>
            <input
              {...register('minOrderValue')}
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Max Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Discount (₹)
            </label>
            <input
              {...register('maxDiscount')}
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires At
            </label>
            <input
              {...register('expiresAt')}
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit (0 = unlimited)
            </label>
            <input
              {...register('usageLimit')}
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="w-4 h-4 accent-pink-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDialog({
  coupon,
  onClose,
}: {
  coupon: Coupon;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteCoupon(coupon._id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      onClose();
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Delete Coupon</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete coupon{' '}
          <span className="font-bold">{coupon.code}</span>? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white border-none"
          >
            {mutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null | undefined>(
    undefined
  ); // undefined = closed, null = add, Coupon = edit
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: () => getAllCoupons(page, 20),
  });

  const coupons: Coupon[] = Array.isArray(data)
    ? data
    : data?.coupons ?? data?.data ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage discount coupons</p>
        </div>
        <Button onClick={() => setModalCoupon(null)}>
          <Plus size={16} className="mr-1" />
          Add Coupon
        </Button>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : isError ? (
        <p className="text-center text-red-500 py-10">Failed to load coupons.</p>
      ) : coupons.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No coupons yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Min Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Max Disc.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-800">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          coupon.type === 'flat'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {coupon.type === 'flat' ? 'Flat' : 'Percent'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.maxDiscount ? `₹${coupon.maxDiscount}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.usageLimit
                        ? `${coupon.usedCount ?? 0}/${coupon.usageLimit}`
                        : `${coupon.usedCount ?? 0}/∞`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.isActive ? 'success' : 'default'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalCoupon(coupon)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingCoupon(coupon)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalCoupon !== undefined && (
        <CouponModal
          coupon={modalCoupon}
          onClose={() => setModalCoupon(undefined)}
        />
      )}

      {/* Delete dialog */}
      {deletingCoupon && (
        <DeleteDialog
          coupon={deletingCoupon}
          onClose={() => setDeletingCoupon(null)}
        />
      )}
    </div>
  );
}
