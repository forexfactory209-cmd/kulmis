import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getConversations, Conversation, deleteConversation } from '@/api/messages';
import { useDarkColors } from '@/store/themeStore';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/api/client';

const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const socketRef = React.useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          if (user) socket.emit('join_user', user.id);
        });

        socket.on('presence_result', (data: Record<string, boolean>) => {
          setPresence(prev => ({ ...prev, ...data }));
        });

        socket.on('user_status_changed', (data: { userId: string, status: string }) => {
          setPresence(prev => ({ ...prev, [data.userId]: data.status === 'online' }));
        });

        fetchConversations();

        return () => {
          socket.disconnect();
          socketRef.current = null;
        };
      }
    }, [isAuthenticated])
  );

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      
      // Request presence for all participants
      if (data.length > 0 && socketRef.current) {
        const userIds = data.map(c => c.participants[0]?.id).filter(Boolean);
        socketRef.current.emit('check_presence', userIds);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setConversations(prev => prev.filter(c => c.id !== id));
      await deleteConversation(id);
    } catch (error) {
      console.error('Failed to delete', error);
      fetchConversations(); // Revert
    }
  };

  const handlePinToggle = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getInitials = (f?: string, l?: string) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase() || 'U';

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) {
    return (
      <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
        <View style={s.em}>
          <Ionicons name="chatbubbles-outline" size={64} color={isDark ? '#334155' : Colors.neutral[300]} />
          <Text style={[s.emt, { color: textSecondary }]}>Login to see messages</Text>
          <Text style={[s.ems, { color: textMuted }]}>Connect with freelancers and clients</Text>
        </View>
      </View>
    );
  }

  // Sort: Pinned first, then by updated/last message
  const sortedConversations = [...conversations].sort((a, b) => {
    const aPinned = pinnedIds.has(a.id);
    const bPinned = pinnedIds.has(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
    const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
    return timeB - timeA;
  });

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    const isPinned = pinnedIds.has(id);

    return (
      <View style={{ flexDirection: 'row', width: 160, height: '100%' }}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#F59E0B' }]} onPress={() => handlePinToggle(id)}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={isPinned ? "bookmark-outline" : "bookmark"} size={26} color={Colors.white} />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.error }]} onPress={() => handleDelete(id)}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={26} color={Colors.white} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <View style={[s.h, { backgroundColor: bg }]}><Text style={[s.ht, { color: textPrimary }]}>Messages</Text></View>
      
      {loading && conversations.length === 0 ? (
        <View style={s.loader}><ActivityIndicator size="large" color={Colors.primary[600]} /></View>
      ) : (
        <FlatList 
          data={sortedConversations} 
          keyExtractor={i => i.id} 
          contentContainerStyle={{ paddingHorizontal: 0 }}
          refreshing={loading}
          onRefresh={fetchConversations}
          ListEmptyComponent={
            <View style={s.em}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={isDark ? '#334155' : Colors.neutral[300]} />
              <Text style={[s.emt, { color: textSecondary }]}>No messages yet</Text>
              <Text style={[s.ems, { color: textMuted }]}>Start a conversation from a project or profile</Text>
            </View>
          }
          renderItem={({ item }) => {
            const otherUser = item.participants[0] || { firstName: 'Unknown', lastName: 'User' };
            const name = `${otherUser.firstName} ${otherUser.lastName}`;
            const unread = item.unreadCount || 0;
            const displayUnread = unread > 9 ? '9+' : unread.toString();
            const isPinned = pinnedIds.has(item.id);
            
            return (
              <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}>
                <TouchableOpacity 
                  style={[s.card, { borderBottomColor: border, backgroundColor: isPinned ? (isDark ? '#1E293B' : '#F8FAFC') : bg }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    // Instantly clear unread count for premium responsive feel
                    setConversations(prev => prev.map(c => c.id === item.id ? { ...c, unreadCount: 0 } : c));
                    router.push({
                      pathname: '/chat/[id]',
                      params: { id: item.id, name: name, otherUserId: otherUser.id }
                    });
                  }}
                >
                  <View style={s.avWrap}>
                    <View style={s.av}><Text style={s.avi}>{getInitials(otherUser.firstName, otherUser.lastName)}</Text></View>
                    <View style={[s.onlineIndicator, { backgroundColor: presence[otherUser.id] ? Colors.success : Colors.neutral[400] }]} />
                  </View>
                  <View style={s.info}>
                    <View style={s.row}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[s.nm, { color: textPrimary }]}>{name}</Text>
                        {isPinned && <Ionicons name="pin" size={12} color={textMuted} />}
                      </View>
                      <Text style={[s.time, { color: textMuted }]}>{formatTime(item.lastMessage?.createdAt || item.updatedAt)}</Text>
                    </View>
                    <View style={s.row}>
                      <Text style={[s.msg, { color: unread > 0 ? textPrimary : textSecondary }, unread > 0 && { fontWeight: 'bold' }]} numberOfLines={1}>
                        {item.lastMessage?.content || 'No messages yet'}
                      </Text>
                      {unread > 0 && (
                        <View style={s.badge}>
                          <Text style={s.badgeT}>{displayUnread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }} 
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  h: { paddingHorizontal: 16, paddingTop: 8, marginBottom: 12 },
  ht: { fontSize: 24, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, paddingHorizontal: 16 },
  avWrap: { position: 'relative' },
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary[100], justifyContent: 'center', alignItems: 'center' },
  avi: { fontSize: 16, fontWeight: '700', color: Colors.primary[700] },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  info: { flex: 1, marginLeft: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nm: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12 },
  msg: { fontSize: 14, marginTop: 2, flex: 1, marginRight: 8 },
  badge: { backgroundColor: Colors.primary[700], width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeT: { fontSize: 11, fontWeight: '700', color: Colors.white },
  em: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emt: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  ems: { fontSize: 14, marginTop: 4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
