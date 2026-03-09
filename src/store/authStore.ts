import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      set({ error: msg, isLoading: false });
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const { valid, user } = await authApi.validate();
      if (valid) {
        set({ user, token, isLoading: false });
      } else {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isLoading: false });
      }
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
