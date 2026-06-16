import apiClient from './client';

export interface Conversation {
  id: string;
  lastMessage: Message | null;
  participants: User[];
  updatedAt: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await apiClient.get('/messages/conversations');
  return response.data.data;
};

export const getMessages = async (conversationId: string, page = 1, limit = 50): Promise<Message[]> => {
  const response = await apiClient.get(`/messages/${conversationId}?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
  const response = await apiClient.post(`/messages/${conversationId}`, { content });
  return response.data.data;
};

export const createConversation = async (participantId: string): Promise<{ id: string }> => {
  const response = await apiClient.post('/messages/conversations/create', { participantId });
  return response.data.data;
};

export const markAsRead = async (conversationId: string): Promise<void> => {
  await apiClient.put(`/messages/${conversationId}/read`);
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/messages/conversations/${conversationId}`);
};
