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
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export async function getProfile() {
  const response = await apiClient.get('/users/me');
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
  return response.data;
}

export async function createAddress(data: AddressData) {
  const response = await apiClient.post('/users/me/addresses', data);
  return response.data;
}

export async function updateAddress(id: string, data: Partial<AddressData>) {
  const response = await apiClient.patch(`/users/me/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddress(id: string) {
  const response = await apiClient.delete(`/users/me/addresses/${id}`);
  return response.data;
}
