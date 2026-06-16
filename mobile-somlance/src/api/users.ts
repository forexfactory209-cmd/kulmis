import apiClient from './client';

export const updateProfile = async (data: {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}) => {
  const response = await apiClient.put('/users/profile', data);
  return response.data.data;
};

export const updateFreelancerProfile = async (data: {
  title?: string;
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  portfolioUrl?: string;
  skills?: string[];
  portfolios?: { title: string; description?: string; imageUrl?: string; link?: string }[];
  certificates?: { name: string; issuingOrg: string; issueDate?: string; imageUrl?: string }[];
}) => {
  const response = await apiClient.put('/users/freelancer-profile', data);
  return response.data.data;
};

export const getProfile = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data.data;
};

export const getFreelancers = async (params?: any) => {
  const response = await apiClient.get('/users/freelancers', { params });
  return response.data.data;
};

export const uploadImage = async (uri: string) => {
  return uploadFile(uri);
};

export const uploadFile = async (uri: string, customName?: string) => {
  const formData = new FormData();
  const filename = customName || uri.split('/').pop() || 'file.dat';
  const match = /\.(\w+)$/.exec(filename);
  
  let type = 'application/octet-stream';
  if (match) {
    const ext = match[1].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) type = `image/${ext}`;
    else if (ext === 'pdf') type = 'application/pdf';
    else if (['doc', 'docx'].includes(ext)) type = 'application/msword';
  }

  formData.append('image', {
    uri,
    name: filename,
    type,
  } as any);

  const response = await apiClient.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data?.url || response.data.url;
};

// Favorites
export const toggleFavorite = async (freelancerId: string) => {
  const response = await apiClient.post(`/users/favorites/${freelancerId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await apiClient.get('/users/favorites');
  return response.data.data;
};

// Settings
export const changePassword = async (data: any) => {
  const response = await apiClient.post('/users/settings/change-password', data);
  return response.data;
};

export const toggleTwoFactor = async () => {
  const response = await apiClient.post('/users/settings/toggle-2fa');
  return response.data;
};

export const deleteAccount = async () => {
  const response = await apiClient.delete('/users/settings/delete-account');
  return response.data;
};
