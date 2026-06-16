import { create } from 'zustand';
import apiClient from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  avatarUrl: string | null;
  isVerified: boolean;
  freelancerProfile?: any;
  clientProfile?: any;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitializing: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitializing: true, // Wait for session initialization
  isLoading: false, // For login/register forms
  isAuthenticated: false,
  error: null,

  initializeAuth: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('Kulmis_user');
      const accessToken = await SecureStore.getItemAsync('Kulmis_access_token');
      const refreshToken = await SecureStore.getItemAsync('Kulmis_refresh_token');

      if (userStr && accessToken) {
        const user = JSON.parse(userStr);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      }
    } catch (e) {
      console.log('Failed to restore auth session', e);
    } finally {
      set({ isInitializing: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Persist locally
      await SecureStore.setItemAsync('Kulmis_user', JSON.stringify(user));
      await SecureStore.setItemAsync('Kulmis_access_token', accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync('Kulmis_refresh_token', refreshToken);
      }

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Login connection failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;

      // Persist locally
      await SecureStore.setItemAsync('Kulmis_user', JSON.stringify(user));
      await SecureStore.setItemAsync('Kulmis_access_token', accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync('Kulmis_refresh_token', refreshToken);
      }

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Registration connection failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('Kulmis_user');
      await SecureStore.deleteItemAsync('Kulmis_access_token');
      await SecureStore.deleteItemAsync('Kulmis_refresh_token');
    } catch (e) {
      console.log('Error during logout secure storage cleanup', e);
    }
    delete apiClient.defaults.headers.common['Authorization'];
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data.data, isAuthenticated: true });
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
