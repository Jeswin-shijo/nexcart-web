import client from './client';

export const getAllCoupons = (page = 1, limit = 20) =>
  client.get('/coupons', { params: { page, limit } }).then((r) => r.data);

export const createCoupon = (data: any) =>
  client.post('/coupons', data).then((r) => r.data);

export const updateCoupon = (id: string, data: any) =>
  client.patch(`/coupons/${id}`, data).then((r) => r.data);

export const deleteCoupon = (id: string) =>
  client.delete(`/coupons/${id}`).then((r) => r.data);

export const validateCoupon = (code: string, orderTotal: number) =>
  client.post('/coupons/validate', { code, orderTotal }).then((r) => r.data);
