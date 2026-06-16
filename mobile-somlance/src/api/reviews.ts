import apiClient from './client';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export const getMyReviews = async (): Promise<Review[]> => {
  const response = await apiClient.get('/reviews/me/received');
  return response.data.data;
};

export const createReview = async (data: {
  projectId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}) => {
  const response = await apiClient.post('/reviews', data);
  return response.data.data;
};

export const getMyGivenReviews = async (): Promise<Review[]> => {
  const response = await apiClient.get('/reviews/me/given');
  return response.data.data;
};

export const updateReview = async (id: string, data: { rating: number; comment?: string }) => {
  const response = await apiClient.put(`/reviews/${id}`, data);
  return response.data.data;
};

export const deleteReview = async (id: string) => {
  const response = await apiClient.delete(`/reviews/${id}`);
  return response.data;
};
