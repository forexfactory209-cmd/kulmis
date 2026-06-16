import { create } from 'zustand';
import { apiClient } from '../lib/axios';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  page: number;
  
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  incrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  hasMore: true,
  page: 1,

  fetchNotifications: async (page = 1) => {
    try {
      set({ loading: true });
      const res = await apiClient.get('/notifications', { params: { page, limit: 4 } });
      if (res.data.success) {
        const newNotifs = res.data.data.notifications;
        set(state => ({
          notifications: page === 1 ? newNotifs : [...state.notifications, ...newNotifs],
          page,
          hasMore: newNotifs.length === 4,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      if (res.data.success) {
        set({ unreadCount: res.data.data.count });
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  },

  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  incrementUnread: () => {
    set(state => ({ unreadCount: state.unreadCount + 1 }));
  },
}));
