import { create } from 'zustand';
import { getNotifications, markAllNotificationsAsRead } from '../api/notifications';

interface NotificationState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  incrementUnread: () => void;
  clearUnread: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  
  fetchUnreadCount: async () => {
    try {
      // Just fetch page 1 which includes the most recent
      const notifs = await getNotifications(1, 50);
      const unread = notifs.filter(n => !n.isRead).length;
      set({ unreadCount: unread });
    } catch (e) {
      console.warn('Failed to fetch unread count', e);
    }
  },
  
  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },
  
  clearUnread: async () => {
    set({ unreadCount: 0 });
    // In background, actually mark them all read on the server?
    // Usually opening the screen marks individual ones, or there is a "Mark All Read" button.
    // The user wants it to clear exactly when they open the screen: "when he open the screen it disappear"
    try {
      await markAllNotificationsAsRead();
    } catch (e) {
      console.warn('Failed to clear unread on server', e);
    }
  }
}));
