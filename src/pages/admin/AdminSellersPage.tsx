import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSellers, approveSeller, rejectSeller } from '../../api/sellers.api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

function getSellerStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status?.toLowerCase()) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'pending': return 'warning';
    default: return 'default';
  }
}

const PAGE_LIMIT = 20;

export default function AdminSellersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-sellers', page],
    queryFn: () => getAllSellers(page, PAGE_LIMIT),
  });

  const sellers: any[] = data?.sellers || data?.data || (Array.isArray(data) ? data : []);
  const total: number = data?.total ?? sellers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const approveMutation = useMutation({
    mutationFn: approveSeller,
    onSuccess: () => {
      toast.success('Seller approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to approve seller');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectSeller,
    onSuccess: () => {
      toast.success('Seller rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reject seller');
    },
  });

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Seller Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage seller applications</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Sellers',
            count: total,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
          },
          {
            label: 'Pending Approval',
            count: sellers.filter((s: any) => s.status === 'pending').length,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          },
          {
            label: 'Approved',
            count: sellers.filter((s: any) => s.status === 'approved').length,
            color: 'bg-green-50 border-green-200 text-green-700',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 text-center ${stat.color}`}
          >
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : isError ? (
          <div className="text-center py-16 text-gray-500">Failed to load sellers.</div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="font-medium">No sellers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    GST Number
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((seller: any) => {
                  const user = seller.userId || seller.user || {};
                  const brand = seller.brandId || seller.brand || {};
                  const isApproved = seller.status === 'approved';
                  const isRejected = seller.status === 'rejected';

                  return (
                    <tr key={seller._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{user.name || '—'}</p>
                          <p className="text-xs text-gray-500">{user.email || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{brand.name || '—'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {seller.gstNumber || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {seller.bankName ? (
                          <div>
                            <p className="text-gray-700 text-xs font-medium">{seller.bankName}</p>
                            <p className="text-gray-500 text-xs">{seller.bankAccountNumber}</p>
                            <p className="text-gray-500 text-xs">{seller.ifscCode}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getSellerStatusVariant(seller.status)}>
                          {seller.status
                            ? seller.status.charAt(0).toUpperCase() + seller.status.slice(1)
                            : 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!isApproved && (
                            <button
                              onClick={() => approveMutation.mutate(seller._id)}
                              disabled={isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={13} />
                              Approve
                            </button>
                          )}
                          {!isRejected && (
                            <button
                              onClick={() => rejectMutation.mutate(seller._id)}
                              disabled={isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          )}
                          {isApproved && isRejected === false && (
                            <span className="text-xs text-gray-400">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && sellers.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} sellers)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
