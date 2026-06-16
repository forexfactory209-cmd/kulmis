import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getMessages, sendMessage, markAsRead, Message } from '@/api/messages';
import { uploadFile } from '@/api/users';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/api/client';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useDarkColors } from '@/store/themeStore';

const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

export default function ChatScreen() {
  const { id, name, otherUserId } = useLocalSearchParams<{ id: string, name: string, otherUserId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, border, statusBar, iconBg } = useDarkColors();
  
  const [chatName, setChatName] = useState(name);
  const [chatOtherUserId, setChatOtherUserId] = useState(otherUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pickingMedia, setPickingMedia] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();

    if (!chatName && id) {
      // Fetch details to resolve name
      const apiClient = require('@/api/client').default;
      apiClient.get(`/messages/conversations/${id}/details`)
        .then((res: any) => {
          if (res.data?.success && res.data?.data?.participants?.length > 0) {
            const p = res.data.data.participants[0];
            setChatName(`${p.firstName} ${p.lastName}`);
            setChatOtherUserId(p.id);
          }
        }).catch((e: any) => console.log('Failed to fetch convo details', e));
    }

    // Mark conversation as read when user opens it
    if (id) {
      markAsRead(id).catch(() => {});
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    if (id) {
      socketRef.current.emit('join_conversation', id);
    }
    
    // Also join user room to receive global status updates
    if (user?.id) {
      socketRef.current.emit('join_user', user.id);
    }

    if (chatOtherUserId) {
      socketRef.current.emit('check_presence', [chatOtherUserId]);
    }

    socketRef.current.on('presence_result', (data: Record<string, boolean>) => {
      if (chatOtherUserId && data[chatOtherUserId] !== undefined) {
        setIsOnline(data[chatOtherUserId]);
      }
    });

    socketRef.current.on('user_status_changed', (data: { userId: string, status: string }) => {
      if (data.userId === chatOtherUserId) {
        setIsOnline(data.status === 'online');
      }
    });

    socketRef.current.on('message_sent_ack', (msg: Message) => {
      setMessages(prev => {
        const tempMsgIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === msg.content);
        if (tempMsgIndex !== -1) {
          const newMsgs = [...prev];
          newMsgs[tempMsgIndex] = msg;
          return newMsgs;
        }
        if (!prev.some(m => m.id === msg.id)) {
          return [...prev, msg];
        }
        return prev;
      });
    });

    socketRef.current.on('receive_message', (newMessage: Message) => {
      setMessages(prev => {
        // Prevent duplicate messages
        if (prev.find(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      // Mark as read when receiving messages while chat is open
      if (id) markAsRead(id).catch(() => {});
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id, chatName, chatOtherUserId, user?.id]);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const data = await getMessages(id);
      if (data && data.length > 0) {
        setMessages(data.reverse());
      }
    } catch (error) {
      // Gracefully ignore API errors during MVP mock testing
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !id || sending) return;
    
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: inputText.trim(),
      senderId: user?.id || 'mock_user',
      conversationId: id as string,
      createdAt: new Date().toISOString(),
      sender: user || { firstName: 'You', lastName: '' }
    };
    
    try {
      setSending(true);
      // Optimistic update
      setMessages(prev => [...prev, tempMsg as Message]);
      setInputText('');
      
      // Emit via socket for real-time to others
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          conversationId: id,
          senderId: user?.id || 'mock_user',
          content: tempMsg.content,
        });
      }

    } catch (error) {
      console.log('API failed, but message remains locally.', error);
    } finally {
      setSending(false);
    }
  };

  const handlePickPhoto = async () => {
    setShowAttachMenu(false);
    if (pickingMedia) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required.');
      return;
    }
    setPickingMedia(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        const uploadedUrl = await uploadFile(uri);
        const tempMsg = {
          id: `temp-${Date.now()}`,
          content: `📷 Photo`,
          attachmentUrl: uploadedUrl,
          attachmentType: 'image',
          senderId: user?.id || 'mock_user',
          conversationId: id as string,
          createdAt: new Date().toISOString(),
          sender: user || { firstName: 'You', lastName: '' }
        };
        setMessages(prev => [...prev, tempMsg as any]);
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: id,
            senderId: user?.id || 'mock_user',
            content: tempMsg.content,
          });
        }
      }
    } finally {
      setPickingMedia(false);
    }
  };

  const handleTakePhoto = async () => {
    setShowAttachMenu(false);
    if (pickingMedia) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }
    setPickingMedia(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        const uploadedUrl = await uploadFile(uri);
        const tempMsg = {
          id: `temp-${Date.now()}`,
          content: `📷 Photo`,
          attachmentUrl: uploadedUrl,
          attachmentType: 'image',
          senderId: user?.id || 'mock_user',
          conversationId: id as string,
          createdAt: new Date().toISOString(),
          sender: user || { firstName: 'You', lastName: '' }
        };
        setMessages(prev => [...prev, tempMsg as any]);
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: id,
            senderId: user?.id || 'mock_user',
            content: tempMsg.content,
          });
        }
      }
    } finally {
      setPickingMedia(false);
    }
  };

  const handlePickDocument = async () => {
    setShowAttachMenu(false);
    if (pickingMedia) return;
    setPickingMedia(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets?.length > 0) {
        const doc = result.assets[0];
        const uploadedUrl = await uploadFile(doc.uri, doc.name);
        const tempMsg = {
          id: `temp-${Date.now()}`,
          content: `📄 ${doc.name}`,
          attachmentUrl: uploadedUrl,
          attachmentType: 'document',
          senderId: user?.id || 'mock_user',
          conversationId: id as string,
          createdAt: new Date().toISOString(),
          sender: user || { firstName: 'You', lastName: '' }
        };
        setMessages(prev => [...prev, tempMsg as any]);
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: id,
            senderId: user?.id || 'mock_user',
            content: tempMsg.content,
          });
        }
      }
    } catch (err) {
      console.log('Document picker error', err);
    } finally {
      setPickingMedia(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initials = (chatName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F5F6FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[s.container, { paddingTop: insets.top, backgroundColor: isDark ? '#0F172A' : '#F5F6FA' }]}>
        <StatusBar barStyle={statusBar} backgroundColor={bg} />
        
        {/* Header */}
        <View style={[s.nav, { backgroundColor: bg, borderBottomColor: border }]}>
          <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: iconBg }]}>
            <Ionicons name="chevron-back" size={24} color={textPrimary} />
          </TouchableOpacity>
          <View style={s.navCenter}>
            <View style={[s.navAvatar, { backgroundColor: isDark ? '#1E293B' : Colors.primary[100] }]}>
              <Text style={s.navAvatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={[s.navTitle, { color: textPrimary }]}>{chatName || 'Chat'}</Text>
              <Text style={[s.navStatus, { color: isOnline ? Colors.success : textSecondary }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: iconBg }]}>
            <Ionicons name="ellipsis-vertical" size={20} color={textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Messages Area */}
        {loading && messages.length === 0 ? (
          <View style={s.loader}><ActivityIndicator size="large" color={Colors.primary[600]} /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={s.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMe = item.senderId === user?.id;
              const msg = item as any;
              return (
                <View style={[s.msgBubble, isMe ? s.myMsg : [s.theirMsg, { backgroundColor: bg, borderColor: border }]]}>
                  {msg.attachmentType === 'image' && msg.attachmentUrl ? (
                    <Image source={{ uri: msg.attachmentUrl }} style={s.attachImage} resizeMode="cover" />
                  ) : null}
                  <Text style={[s.msgText, isMe ? s.myMsgText : { color: textPrimary }]}>
                    {item.content}
                  </Text>
                  <Text style={[s.msgTime, isMe ? s.myMsgTime : { color: textSecondary }]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {/* Input Area — sits directly above the keyboard */}
        <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: bg, borderTopColor: border }]}>
          <TouchableOpacity style={[s.attachBtn, { backgroundColor: isDark ? '#1E293B' : Colors.primary[50], borderColor: isDark ? border : Colors.primary[100] }]} onPress={() => setShowAttachMenu(true)}>
            <Ionicons name="add" size={24} color={Colors.primary[600]} />
          </TouchableOpacity>
          <View style={[s.inputWrapper, { backgroundColor: iconBg }]}>
            <TextInput
              style={[s.input, { color: textPrimary }]}
              placeholder="Type a message..."
              placeholderTextColor={textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity 
            style={[s.sendBtn, !inputText.trim() && s.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons name="send" size={18} color={inputText.trim() ? Colors.white : Colors.neutral[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Attachment Bottom Sheet */}
      <Modal visible={showAttachMenu} transparent animationType="slide" onRequestClose={() => setShowAttachMenu(false)}>
        <TouchableOpacity style={s.attachOverlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)}>
          <View style={[s.attachSheet, { paddingBottom: insets.bottom + 16, backgroundColor: bg }]}>
            <View style={[s.attachHandle, { backgroundColor: border }]} />
            <Text style={[s.attachTitle, { color: textPrimary }]}>Share</Text>
            <View style={s.attachGrid}>
              <TouchableOpacity style={s.attachOption} onPress={handlePickPhoto}>
                <View style={[s.attachCircle, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="images" size={26} color="#43A047" />
                </View>
                <Text style={[s.attachLabel, { color: textSecondary }]}>Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.attachOption} onPress={handleTakePhoto}>
                <View style={[s.attachCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="camera" size={26} color="#1E88E5" />
                </View>
                <Text style={[s.attachLabel, { color: textSecondary }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.attachOption} onPress={handlePickDocument}>
                <View style={[s.attachCircle, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="document" size={26} color="#FB8C00" />
                </View>
                <Text style={[s.attachLabel, { color: textSecondary }]}>Document</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.attachOption} onPress={() => setShowAttachMenu(false)}>
                <View style={[s.attachCircle, { backgroundColor: '#FCE4EC' }]}>
                  <Ionicons name="location" size={26} color="#E53935" />
                </View>
                <Text style={[s.attachLabel, { color: textSecondary }]}>Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  nav: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
  },
  navCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  navAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary[700] },
  navTitle: { fontSize: 16, fontWeight: '700' },
  navStatus: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  messageList: { padding: 16, paddingBottom: 8 },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginBottom: 8 },
  myMsg: { alignSelf: 'flex-end', backgroundColor: Colors.primary[700], borderBottomRightRadius: 4 },
  theirMsg: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  msgText: { fontSize: 15, lineHeight: 21 },
  myMsgText: { color: Colors.white },
  msgTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  myMsgTime: { color: 'rgba(255,255,255,0.6)' },
  attachImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 6 },
  inputArea: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 8, 
    paddingTop: 8, 
    borderTopWidth: 1, 
  },
  attachBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 6,
    marginBottom: 2,
    borderWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 22,
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: 2,
  },
  input: { 
    maxHeight: 100, 
    paddingHorizontal: 16, 
    paddingTop: 10, 
    paddingBottom: 10, 
    fontSize: 15, 
  },
  sendBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: Colors.primary[600], 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 6,
    marginBottom: 2,
  },
  sendBtnDisabled: { backgroundColor: Colors.neutral[100] },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  attachOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  attachSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  attachHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  attachTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  attachGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  attachOption: { alignItems: 'center', width: 72 },
  attachCircle: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  attachLabel: { fontSize: 12, fontWeight: '600' },
});
