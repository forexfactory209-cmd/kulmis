import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/MessagesScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { getConversations, Conversation } from '@/api/messages';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useFocusEffect } from 'expo-router';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/api/client';

const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

export default function MessagesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const tabs = ['All', 'Clients', 'System'];
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const socketRef = React.useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
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
      console.error('Failed to fetch conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== user?.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeBtn}>
          <Ionicons name="create-outline" size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.neutral[400]} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={Colors.neutral[400]}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading messages...</Text>
        ) : conversations.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No messages yet.</Text>
        ) : (
          conversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const initials = otherUser ? (otherUser.firstName?.charAt(0) || '') + (otherUser.lastName?.charAt(0) || '') : '?';
            const unread = conv.unreadCount || 0;
            const displayUnread = unread > 9 ? '9+' : unread.toString();

            return (
              <TouchableOpacity 
                key={conv.id} 
                style={styles.chatItem}
                onPress={() => {
                  // Instantly clear unread count for premium responsive feel
                  setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                  router.push({ pathname: '/chat/[id]', params: { id: conv.id, name: `${otherUser?.firstName} ${otherUser?.lastName}`, otherUserId: otherUser?.id || '' } });
                }}
              >
                <View style={styles.avatarWrap}>
                  <View style={[styles.avatar, { backgroundColor: Colors.primary[100] }]}>
                    <Text style={styles.avatarInitials}>{initials.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.onlineIndicator, { backgroundColor: presence[otherUser?.id || ''] ? Colors.success : Colors.neutral[400] }]} />
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{otherUser?.firstName} {otherUser?.lastName}</Text>
                    <Text style={styles.chatTime}>
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </Text>
                  </View>
                  <View style={styles.chatPreview}>
                    <Text style={unread > 0 ? styles.chatMessageUnread : styles.chatMessageRead} numberOfLines={1}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </Text>
                    {unread > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{displayUnread}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
