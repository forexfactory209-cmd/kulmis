import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import { connectSocket, getSocket } from '../../../lib/socket';
import { useAuthStore } from '../../../store/useAuthStore';

interface Conversation {
  id: string;
  lastMessage?: { content: string; createdAt: string; senderId: string };
  otherUser: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const MessagesPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || '';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialConvoId = searchParams.get('convo');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(initialConvoId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Load conversations from REST API ───
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/messages/conversations');
        if (res.data.success) {
          const convos: Conversation[] = res.data.data.map((c: any) => {
            const other = c.participants?.[0] || { id: '', firstName: 'Unknown', lastName: '' };
            return {
              id: c.id,
              lastMessage: c.lastMessage || null,
              otherUser: other,
              unreadCount: c.unreadCount || 0,
            };
          });
          setConversations(convos);
          if (convos.length > 0 && !selectedConvoId && !initialConvoId) {
            setSelectedConvoId(convos[0].id);
          } else if (initialConvoId && !convos.find(c => c.id === initialConvoId)) {
            // Edge case: If they navigated with convo ID but it wasn't in the list
            // we could fetch it, but usually the backend will return all user convos
            setSelectedConvoId(initialConvoId);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userId]);

  // ─── Socket.io setup ───
  useEffect(() => {
    if (!userId) return;
    const socket = connectSocket(userId);

    // Listen for incoming messages
    socket.on('receive_message', (msg: Message) => {
      if (msg.conversationId === selectedConvoId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          if (msg.senderId === userId) {
            const tempMsgIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === msg.content);
            if (tempMsgIndex !== -1) {
              const newMsgs = [...prev];
              newMsgs[tempMsgIndex] = msg;
              return newMsgs;
            }
          }
          return [...prev, msg];
        });
      }
      // Update conversation list last message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId }, unreadCount: msg.conversationId === selectedConvoId ? 0 : c.unreadCount + 1 }
            : c
        )
      );
    });

    // Online/offline tracking
    socket.on('user_status_changed', ({ userId: uid, status }: { userId: string; status: string }) => {
      setOnlineUsers((prev) => ({ ...prev, [uid]: status === 'online' }));
    });

    // Check presence of contacts
    const otherUserIds = conversations.map((c) => c.otherUser.id).filter(Boolean);
    if (otherUserIds.length > 0) {
      socket.emit('check_presence', otherUserIds);
    }
    socket.on('presence_result', (result: Record<string, boolean>) => {
      setOnlineUsers((prev) => ({ ...prev, ...result }));
    });

    socket.on('message_sent_ack', (msg: Message) => {
      if (msg.conversationId === selectedConvoId) {
        setMessages((prev) => {
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
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent_ack');
      socket.off('user_status_changed');
      socket.off('presence_result');
    };
  }, [userId, selectedConvoId, conversations.length]);

  // ─── Load messages when a conversation is selected ───
  useEffect(() => {
    if (!selectedConvoId) return;
    const fetchMessages = async () => {
      try {
        setMsgLoading(true);
        const res = await apiClient.get(`/messages/${selectedConvoId}`);
        if (res.data.success) {
          setMessages(res.data.data.reverse ? res.data.data.reverse() : res.data.data);
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setMsgLoading(false);
      }
    };
    fetchMessages();

    // Join the Socket.io room for this conversation
    const socket = getSocket();
    socket.emit('join_conversation', selectedConvoId);

    // Mark as read
    apiClient.put(`/messages/${selectedConvoId}/read`).catch(() => {});
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvoId ? { ...c, unreadCount: 0 } : c))
    );
  }, [selectedConvoId]);

  // ─── Auto-scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message via Socket.io (real-time) ───
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConvoId) return;
    const socket = getSocket();
    socket.emit('send_message', {
      conversationId: selectedConvoId,
      senderId: userId,
      content: newMessage.trim(),
    });
    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConvoId,
      senderId: userId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvoId
          ? { ...c, lastMessage: { content: optimistic.content, createdAt: optimistic.createdAt, senderId: userId } }
          : c
      )
    );
    setNewMessage('');
  }, [newMessage, selectedConvoId, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId);

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm) return true;
    const name = `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const timeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Chat List */}
      <div style={{ width: 340, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: 14 }}>No conversations yet</div>
          ) : (
            filteredConversations.map((chat) => {
              const isOnline = onlineUsers[chat.otherUser.id] || false;
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedConvoId(chat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer',
                    background: selectedConvoId === chat.id ? '#F0FDF4' : 'transparent',
                    borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => { if (selectedConvoId !== chat.id) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (selectedConvoId !== chat.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0',
                      backgroundImage: chat.otherUser.avatarUrl ? `url(${chat.otherUser.avatarUrl})` : undefined,
                      backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#475569', fontWeight: 700, fontSize: 16
                    }}>
                      {!chat.otherUser.avatarUrl && chat.otherUser.firstName?.charAt(0)}
                    </div>
                    {isOnline && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, background: '#10B981', borderRadius: 6, border: '2px solid #FFFFFF' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: chat.unreadCount > 0 ? 700 : 600, color: '#0F172A', fontSize: 14 }}>{chat.otherUser.firstName} {chat.otherUser.lastName}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{chat.lastMessage ? timeAgo(chat.lastMessage.createdAt) : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <p style={{ fontSize: 13, color: chat.unreadCount > 0 ? '#475569' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, maxWidth: 200, fontWeight: chat.unreadCount > 0 ? 500 : 400 }}>
                        {chat.lastMessage?.senderId === userId ? 'You: ' : ''}{chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{chat.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0',
                  backgroundImage: selectedConvo.otherUser.avatarUrl ? `url(${selectedConvo.otherUser.avatarUrl})` : undefined,
                  backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#475569', fontWeight: 700, fontSize: 14
                }}>
                  {!selectedConvo.otherUser.avatarUrl && selectedConvo.otherUser.firstName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{selectedConvo.otherUser.firstName} {selectedConvo.otherUser.lastName}</div>
                  <div style={{ fontSize: 12, color: onlineUsers[selectedConvo.otherUser.id] ? '#10B981' : '#94A3B8' }}>
                    {onlineUsers[selectedConvo.otherUser.id] ? '● Online' : '● Offline'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748B' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                </button>
                <button style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748B' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} className="custom-scrollbar">
              {msgLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#94A3B8' }}>
                  No messages yet. Say hello! 👋
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === userId;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '60%', padding: '12px 16px',
                        background: isMe ? '#10B981' : '#F1F5F9',
                        color: isMe ? '#FFFFFF' : '#0F172A',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: 14, lineHeight: 1.5
                      }}>
                        {msg.content}
                        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7, textAlign: 'right' }}>{formatTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 12, alignItems: 'center' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#0F172A' }}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                style={{ background: newMessage.trim() ? '#10B981' : '#94A3B8', border: 'none', color: '#FFFFFF', width: 40, height: 40, borderRadius: 8, cursor: newMessage.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#94A3B8', gap: 16 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <p style={{ fontSize: 16, fontWeight: 500 }}>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MessagesPage;
