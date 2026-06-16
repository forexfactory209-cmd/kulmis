import api from './api';

export const getFullAnalytics = async () => {
  const response = await api.get('/admin/analytics/full');
  return response.data;
};

export const getReviews = async (params) => {
  const response = await api.get('/admin/reviews', { params });
  return response.data;
};

export const getCategories = async (params) => {
  const response = await api.get('/admin/categories', { params });
  return response.data;
};

export const createCategory = async (name) => {
  const response = await api.post('/admin/categories', { name });
  return response.data;
};

export const deleteCategory = async (name) => {
  const response = await api.delete(`/admin/categories/${encodeURIComponent(name)}`);
  return response.data;
};

export const renameCategory = async (name, newName) => {
  const response = await api.put(`/admin/categories/${encodeURIComponent(name)}`, { newName });
  return response.data;
};

export const getJobsMonitoring = async (params) => {
  const response = await api.get('/admin/jobs-monitoring', { params });
  return response.data;
};

export const getCategoryDetail = async (name) => {
  const response = await api.get(`/admin/categories/${encodeURIComponent(name)}/detail`);
  return response.data;
};

export const getClientActivity = async (id) => {
  const response = await api.get(`/admin/users/${id}/client-activity`);
  return response.data;
};

export const getFreelancerActivity = async (id) => {
  const response = await api.get(`/admin/users/${id}/freelancer-activity`);
  return response.data;
};
