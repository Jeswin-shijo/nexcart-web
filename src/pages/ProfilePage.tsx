import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, MapPin, Lock, Plus, Trash2, Edit2, Check } from 'lucide-react';
import {
  getProfile, updateProfile, changePassword,
  getAddresses, createAddress, updateAddress, deleteAddress,
} from '../api/users.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PageTransition from '../components/motion/PageTransition';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';

type Tab = 'profile' | 'addresses' | 'password';

interface AddressData {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

const emptyAddress = { fullName: '', phone: '', street: '', city: '', state: '', pincode: '' };

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile Info', icon: <User size={16} /> },
    { id: 'addresses' as Tab, label: 'Addresses', icon: <MapPin size={16} /> },
    { id: 'password' as Tab, label: 'Change Password', icon: <Lock size={16} /> },
  ];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6">My Profile</h1>
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Sidebar nav */}
          <div className="sm:w-48 shrink-0">
            <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden border border-transparent dark:border-dark-border">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors border-l-2 ${
                    tab === t.id
                      ? 'border-primary bg-primary-50 dark:bg-primary/10 text-primary'
                      : 'border-transparent text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {tab === 'profile' && <ProfileTab />}
            {tab === 'addresses' && <AddressesTab />}
            {tab === 'password' && <PasswordTab />}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function ProfileTab() {
  const { setAuth, token } = useAuthStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const [form, setForm] = useState({ name: '', phone: '' });
  const [initialized, setInitialized] = useState(false);

  if (data && !initialized) {
    setForm({ name: data?.user?.name || data?.name || '', phone: data?.user?.phone || data?.phone || '' });
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      const updatedUser = result?.user || result;
      if (updatedUser && token) {
        setAuth({ id: updatedUser._id || updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }, token);
      }
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) return <Spinner size="lg" className="py-12" />;

  const user = data?.user || data;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 border border-transparent dark:border-dark-border">
      <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-5">Profile Information</h2>
      <div className="flex flex-col gap-4 max-w-md">
        <div>
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-1">Email</p>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-text bg-gray-50 dark:bg-dark-bg px-3 py-2 rounded border border-gray-200 dark:border-dark-border">
            {user?.email}
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Email cannot be changed</p>
        </div>
        <Input
          label="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="w-fit"
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

function AddressesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);

  const { data, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const addresses: AddressData[] = data?.addresses || data?.data || (Array.isArray(data) ? data : []);

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setForm(emptyAddress);
      toast.success('Address added');
    },
    onError: () => toast.error('Failed to add address'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyAddress }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setEditId(null);
      setForm(emptyAddress);
      toast.success('Address updated');
    },
    onError: () => toast.error('Failed to update address'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
    onError: () => toast.error('Failed to delete address'),
  });

  function startEdit(addr: AddressData) {
    setEditId(addr._id);
    setForm({ fullName: addr.fullName, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode });
  }

  function handleSubmit() {
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all fields');
      return;
    }
    if (editId) {
      updateMutation.mutate({ id: editId, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  if (isLoading) return <Spinner size="lg" className="py-12" />;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 border border-transparent dark:border-dark-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-800 dark:text-dark-text">Saved Addresses</h2>
        {!showForm && !editId && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="flex items-center gap-1">
            <Plus size={14} /> Add New
          </Button>
        )}
      </div>

      {/* Address form */}
      {(showForm || editId) && (
        <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text">{editId ? 'Edit Address' : 'New Address'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <Input label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="flex items-center gap-1">
              <Check size={14} /> {editId ? 'Update' : 'Save'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyAddress); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Address list */}
      <div className="space-y-3">
        {addresses.length === 0 && <p className="text-sm text-gray-500 dark:text-dark-muted">No addresses saved yet.</p>}
        {addresses.map((addr) => (
          <div key={addr._id} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 flex gap-3">
            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-800 dark:text-dark-text">{addr.fullName} · {addr.phone}</p>
              <p className="text-gray-500 dark:text-dark-muted mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
              {addr.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(addr)} className="text-gray-400 hover:text-primary">
                <Edit2 size={15} />
              </button>
              <button onClick={() => deleteMutation.mutate(addr._id)} disabled={deleteMutation.isPending} className="text-gray-400 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  });

  function handleSubmit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    mutation.mutate({ currentPassword: form.currentPassword, newPassword: form.newPassword });
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 border border-transparent dark:border-dark-border">
      <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-5">Change Password</h2>
      <div className="flex flex-col gap-4 max-w-md">
        <Input
          label="Current Password"
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          placeholder="••••••••"
        />
        <Input
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          placeholder="At least 6 characters"
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="••••••••"
        />
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-fit">
          {mutation.isPending ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </div>
  );
}
