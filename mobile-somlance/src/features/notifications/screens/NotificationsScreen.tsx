import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/api/notifications';
import { useDarkColors } from '@/store/themeStore';

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  PROJECT: { icon: 'briefcase', color: Colors.primary[600] },
  PROPOSAL: { icon: 'document-text', color: '#8B5CF6' },
  MESSAGE: { icon: 'chatbubble', color: '#3B82F6' },
  PAYMENT: { icon: 'wallet', color: Colors.success },
  REVIEW: { icon: 'star', color: '#F59E0B' },
  SYSTEM: { icon: 'information-circle', color: Colors.neutral[500] },
  INVITATION: { icon: 'mail', color: '#F59E0B' },
  INVITATION_ACCEPTED: { icon: 'checkmark-circle', color: Colors.success },
  INVITATION_REJECTED: { icon: 'close-circle', color: Colors.error },
  CONTRACT_TERMINATED: { icon: 'alert-circle', color: Colors.error },
  CONTRACT_WITHDRAWN: { icon: 'exit', color: Colors.neutral[500] },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { clearUnread } = require('@/store/notificationStore').useNotificationStore();

  useEffect(() => {
    fetchNotifs();
    clearUnread(); // Clear badge when screen opens — user's requirement
  }, []);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePress = async (item: Notification) => {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
        setNotifs(n => n.map(x => x.id === item.id ? { ...x, isRead: true } : x));
      } catch (e) {}
    }
    
    // Parse the type to navigate. Format: CATEGORY|referenceId
    const parts = item.type.split('|');
    const category = parts[0];
    const refId = parts[1];

    if (category === 'MESSAGE' && refId) {
      router.push({ pathname: '/chat', params: { id: refId } });
    } else if (category === 'PROJECT' && refId) {
      router.push({ pathname: '/job-details', params: { id: refId } });
    } else if (category === 'PROPOSAL' && refId) {
      router.push({ pathname: '/job-details', params: { id: refId } });
    } else if (category === 'INVITATION' && refId) {
      router.push({ pathname: '/invitation-details', params: { id: refId } } as any);
    }
  };

  const getIcon = (type: string) => {
    const category = type.split('|')[0];
    return ICON_MAP[category] || ICON_MAP.SYSTEM;
  };

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={bg} />
      <View style={[s.h, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: cardBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.ht, { color: textPrimary }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}><Text style={s.markAll}>Read all</Text></TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <FlatList data={notifs} keyExtractor={i => i.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: textMuted }}>No notifications yet.</Text>}
          renderItem={({ item }) => {
            const ic = getIcon(item.type);
            return (
              <TouchableOpacity style={[s.card, { borderBottomColor: border }, !item.isRead && { backgroundColor: isDark ? '#1E293B' : Colors.primary[50] + '30' }]} activeOpacity={0.7} onPress={() => handlePress(item)}>
                <View style={[s.iconWrap, { backgroundColor: ic.color + '15' }]}>
                  <Ionicons name={ic.icon as any} size={20} color={ic.color} />
                </View>
                <View style={s.info}>
                  <Text style={[s.title, { color: textPrimary }]}>{item.title}</Text>
                  <Text style={[s.content, { color: textSecondary }]} numberOfLines={2}>{item.content}</Text>
                  <Text style={[s.time, { color: textMuted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                {!item.isRead && <View style={s.dot} />}
              </TouchableOpacity>
            );
          }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  h: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  ht: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  markAll: { fontSize: 14, color: Colors.primary[600], fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.neutral[50] },
  cardUnread: { backgroundColor: Colors.primary[50] + '30' },
  iconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.neutral[900] },
  content: { fontSize: 14, color: Colors.neutral[500], marginTop: 2, lineHeight: 20 },
  time: { fontSize: 12, color: Colors.neutral[400], marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary[600], marginTop: 4 },
});
