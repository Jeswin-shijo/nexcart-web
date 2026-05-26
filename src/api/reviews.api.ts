import client from './client';

export const getProductReviews = (productId: string) =>
  client.get(`/reviews/product/${productId}`).then((r) => r.data);

export const createReview = (data: any) =>
  client.post('/reviews', data).then((r) => r.data);

export const deleteReview = (id: string) =>
  client.delete(`/reviews/${id}`).then((r) => r.data);
