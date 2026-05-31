import apiClient from './client';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AddressData {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

function toApiAddress(data: Partial<AddressData>) {
  const { fullName, ...rest } = data;
  return {
    ...rest,
    ...(fullName !== undefined ? { name: fullName } : {}),
  };
}

function fromApiAddress(address: any): AddressData {
  return {
    ...address,
    fullName: address.fullName || address.name || '',
  };
}

function normalizeAddresses(data: any) {
  const addresses = data?.addresses || data?.data || (Array.isArray(data) ? data : []);
  const normalized = addresses.map(fromApiAddress);
  if (Array.isArray(data)) return normalized;
  return { ...data, addresses: normalized, data: normalized };
}

export async function getProfile() {
  const response = await apiClient.get('/users/me');
  return response.data;
}

export async function getAdminUserStats() {
  const response = await apiClient.get('/users/admin/stats');
  return response.data;
}

export async function updateProfile(data: UpdateProfileData) {
  const response = await apiClient.patch('/users/me', data);
  return response.data;
}

export async function changePassword(data: ChangePasswordData) {
  const response = await apiClient.patch('/users/me/password', data);
  return response.data;
}

export async function getAddresses() {
  const response = await apiClient.get('/users/me/addresses');
  return normalizeAddresses(response.data);
}

export async function createAddress(data: AddressData) {
  const response = await apiClient.post('/users/me/addresses', toApiAddress(data));
  return fromApiAddress(response.data);
}

export async function updateAddress(id: string, data: Partial<AddressData>) {
  const response = await apiClient.patch(`/users/me/addresses/${id}`, toApiAddress(data));
  return fromApiAddress(response.data);
}

export async function deleteAddress(id: string) {
  const response = await apiClient.delete(`/users/me/addresses/${id}`);
  return response.data;
}
