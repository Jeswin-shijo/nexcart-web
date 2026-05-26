import apiClient from './client';

export async function getCart() {
  const response = await apiClient.get('/cart');
  return response.data;
}

export async function addToCart(variantId: string, qty: number) {
  const response = await apiClient.post('/cart/items', { variantId, qty });
  return response.data;
}

export async function updateCartItem(variantId: string, qty: number) {
  const response = await apiClient.patch(`/cart/items/${variantId}`, { qty });
  return response.data;
}

export async function clearCart() {
  const response = await apiClient.delete('/cart');
  return response.data;
}
