import apiClient from './client';

export interface PlaceOrderData {
  addressId: string;
  paymentMethod?: string;
  method?: string;
  couponCode?: string;
}

export async function placeOrder(data: PlaceOrderData) {
  const response = await apiClient.post('/orders', {
    ...data,
    method: data.method || data.paymentMethod,
  });
  return response.data;
}

export async function getMyOrders() {
  const response = await apiClient.get('/orders/my');
  return response.data;
}

export async function getOrderById(id: string) {
  const response = await apiClient.get(`/orders/my/${id}`);
  return response.data;
}

export async function cancelOrder(id: string) {
  const response = await apiClient.patch(`/orders/my/${id}/cancel`);
  return response.data;
}

export async function getAllOrders(page = 1, limit = 20) {
  const response = await apiClient.get('/orders', { params: { page, limit } });
  return response.data;
}

export async function updateOrderStatus(id: string, status: string) {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });
  return response.data;
}
