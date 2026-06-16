import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

// Restore user from localStorage on init
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (raw && token) return JSON.parse(raw) as User;
  } catch {}
  return null;
})();

export const useAuthStore = create<AuthState>((set: any) => ({
  user: storedUser,
  isAuthenticated: !!storedUser,
  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
