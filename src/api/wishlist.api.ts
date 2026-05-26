import apiClient from './client';

export async function getWishlist() {
  const response = await apiClient.get('/wishlist');
  return response.data;
}

export async function toggleWishlist(productId: string) {
  const response = await apiClient.post('/wishlist/toggle', { productId });
  return response.data;
}
