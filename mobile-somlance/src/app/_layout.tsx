import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../theme';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFavoritesStore } from '../store/favoritesStore';

export default function RootLayout() {
  const { initializeAuth, isInitializing, isAuthenticated } = useAuthStore();
  const { initTheme } = useThemeStore();
  const { fetchFavorites } = useFavoritesStore();

  const [notificationSocket, setNotificationSocket] = React.useState<any>(null);
  const { fetchUnreadCount, incrementUnread } = require('../store/notificationStore').useNotificationStore();

  useEffect(() => {
    initializeAuth();
    initTheme();
    
    // Configure Expo Notifications for foreground display
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated && useAuthStore.getState().user) {
      fetchFavorites();
      fetchUnreadCount();
      
      // Initialize global notification socket
      const { API_BASE_URL } = require('../api/client');
      const io = require('socket.io-client');
      const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      
      const user = useAuthStore.getState().user;
      socket.emit('join_user', user?.id);
      
      socket.on('new_notification', async (notif: any) => {
        // Increment the global badge count
        incrementUnread();
        
        // Show native drop-down push notification using Expo
        const Notifications = require('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notif.title || 'New Notification',
            body: notif.content || 'You have a new update.',
            data: { type: notif.type, id: notif.id, refId: notif.type?.split('|')[1] },
            sound: 'default',
          },
          trigger: null, // trigger immediately
        });
      });
      
      // Handle tap on a native push notification (when app is in background/foreground)
      const NotificationsLib = require('expo-notifications');
      const { addNotificationResponseReceivedListener } = NotificationsLib;
      const sub = addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;
        const category = data?.type?.split('|')[0];
        const refId = data?.type?.split('|')[1];
        if ((category === 'INVITATION') && refId) {
          const { router } = require('expo-router');
          router.push({ pathname: '/invitation-details', params: { id: refId } });
        } else if (category === 'MESSAGE' && refId) {
          const { router } = require('expo-router');
          router.push({ pathname: '/chat/[id]', params: { id: refId } });
        }
      });
      
      setNotificationSocket(socket);
      
      return () => {
        socket.disconnect();
        sub.remove();
      };
    } else if (!isAuthenticated && notificationSocket) {
      notificationSocket.disconnect();
      setNotificationSocket(null);
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary[700]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(freelancer-tabs)" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="search-results" />
          <Stack.Screen name="earnings" />
          <Stack.Screen name="withdraw" />
          <Stack.Screen name="earnings/history" />
          <Stack.Screen name="earnings/escrow" />
          <Stack.Screen name="earnings/completed-jobs" />
          <Stack.Screen name="earnings/project-details" />
          <Stack.Screen name="invitation-details" />
          <Stack.Screen name="my-businesses" />
          <Stack.Screen name="business-details" />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
