import apiClient from './client';

export const registerSeller = (data: any) =>
  apiClient.post('/sellers/register', data).then((r) => r.data);

export const getSellerProfile = () =>
  apiClient.get('/sellers/me').then((r) => r.data);

export const updateSellerProfile = (data: any) =>
  apiClient.patch('/sellers/me', data).then((r) => r.data);

export const getSellerStats = () =>
  apiClient.get('/sellers/me/stats').then((r) => r.data);

export const getSellerProducts = () =>
  apiClient.get('/sellers/me/products').then((r) => r.data);

export const getAllSellers = (page = 1, limit = 20) =>
  apiClient.get('/sellers', { params: { page, limit } }).then((r) => r.data);

export const approveSeller = (id: string) =>
  apiClient.patch(`/sellers/${id}/approve`).then((r) => r.data);

export const rejectSeller = (id: string) =>
  apiClient.patch(`/sellers/${id}/reject`).then((r) => r.data);
