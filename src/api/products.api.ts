import apiClient from './client';

export interface ProductQueryParams {
  categoryId?: string;
  brandId?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export async function getProducts(params?: ProductQueryParams) {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function getProductBySlug(slug: string) {
  const response = await apiClient.get(`/products/${slug}`);
  return response.data;
}

export async function getCategories() {
  const response = await apiClient.get('/products/categories');
  return response.data;
}

export async function getBrands() {
  const response = await apiClient.get('/products/brands');
  return response.data;
}

export async function createProduct(data: any) {
  const response = await apiClient.post('/products', data);
  return response.data;
}

export async function updateProduct(id: string, data: any) {
  const response = await apiClient.patch(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string) {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
}

export async function createVariant(data: any) {
  const response = await apiClient.post('/products/variants', data);
  return response.data;
}

export async function getVariantsByProduct(productId: string) {
  const response = await apiClient.get(`/products/${productId}/variants`);
  return response.data;
}

export async function updateVariantStock(variantId: string, stock: number) {
  const response = await apiClient.patch(`/products/variants/${variantId}/stock`, { stock });
  return response.data;
}
