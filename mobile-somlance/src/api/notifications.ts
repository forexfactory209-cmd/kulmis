import api from './client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return data.data.notifications as Notification[];
};

export const markNotificationAsRead = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await api.put(`/notifications/read-all`);
  return data;
};

export const triggerNotification = async (payload: {
  targetUserId: string;
  title: string;
  content: string;
  type: string;
}) => {
  const { data } = await api.post(`/notifications/trigger`, payload);
  return data;
};
