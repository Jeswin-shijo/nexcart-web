import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { registerSeller } from '../../api/sellers.api';
import { getBrands } from '../../api/products.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const sellerRegisterSchema = z.object({
  gstNumber: z.string().optional(),
  bankAccountNumber: z.string().min(5, 'Bank account number is required'),
  ifscCode: z.string().min(5, 'IFSC code is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  brandId: z.string().min(1, 'Please select a brand'),
});

type SellerRegisterFormData = z.infer<typeof sellerRegisterSchema>;

export default function SellerRegisterPage() {
  const navigate = useNavigate();

  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const brands: any[] = brandsData?.brands || brandsData?.data || (Array.isArray(brandsData) ? brandsData : []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerRegisterFormData>({
    resolver: zodResolver(sellerRegisterSchema),
  });

  const mutation = useMutation({
    mutationFn: registerSeller,
    onSuccess: () => {
      toast.success('Seller profile created! Awaiting approval.');
      navigate('/seller/dashboard');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = (data: SellerRegisterFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Become a Seller</h1>
          <p className="text-sm text-gray-500 mt-2">
            Complete your seller profile to start selling on Nexcart.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Brand selection */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Brand <span className="text-red-500">*</span>
            </label>
            {brandsLoading ? (
              <Spinner size="sm" />
            ) : (
              <select
                {...register('brandId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="">Select your brand...</option>
                {brands.map((b: any) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
            {errors.brandId && <p className="text-xs text-red-500">{errors.brandId.message}</p>}
          </div>

          <Input
            label="GST Number (optional)"
            placeholder="22AAAAA0000A1Z5"
            error={errors.gstNumber?.message}
            {...register('gstNumber')}
          />

          <Input
            label="Bank Account Number"
            placeholder="Enter your bank account number"
            error={errors.bankAccountNumber?.message}
            {...register('bankAccountNumber')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="IFSC Code"
              placeholder="SBIN0001234"
              error={errors.ifscCode?.message}
              {...register('ifscCode')}
            />
            <Input
              label="Bank Name"
              placeholder="State Bank of India"
              error={errors.bankName?.message}
              {...register('bankName')}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white border-0"
            >
              {mutation.isPending ? 'Submitting...' : 'Complete Registration'}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Your account will be reviewed and approved within 24-48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
