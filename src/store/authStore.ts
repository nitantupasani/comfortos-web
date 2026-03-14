import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth';
import {
  firebaseEmailSignIn,
  firebaseEmailSignUp,
  firebaseGoogleSignIn,
  firebaseSignOut,
  getFirebaseIdToken,
} from '../lib/firebase';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  /** Sign in with email + password (Firebase → backend) */
  loginWithEmail: (email: string, password: string) => Promise<void>;
  /** Sign in with Google popup (Firebase → backend) */
  loginWithGoogle: () => Promise<void>;
  /** Create account + sign in (Firebase → backend) */
  signUp: (email: string, password: string, name: string) => Promise<void>;

  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

async function syncWithBackend(idToken: string): Promise<{ user: User; token: string }> {
  const { token, user } = await authApi.firebaseLogin(idToken);
  localStorage.setItem('auth_token', token);
  return { user, token };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  loginWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await firebaseEmailSignIn(email, password);
      const { user, token } = await syncWithBackend(idToken);
      set({ user, token, isLoading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      set({ error: msg, isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await firebaseGoogleSignIn();
      const { user, token } = await syncWithBackend(idToken);
      set({ user, token, isLoading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      set({ error: msg, isLoading: false });
    }
  },

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const idToken = await firebaseEmailSignUp(email, password, name);
      const { user, token } = await syncWithBackend(idToken);
      set({ user, token, isLoading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-up failed';
      set({ error: msg, isLoading: false });
    }
  },

  logout: async () => {
    try { await firebaseSignOut(); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      // Try to get a fresh Firebase token first
      const freshToken = await getFirebaseIdToken();
      if (freshToken) {
        localStorage.setItem('auth_token', freshToken);
        const { valid, user } = await authApi.validate();
        if (valid) {
          set({ user, token: freshToken, isLoading: false });
          return;
        }
      }
      // Fallback: validate the stored token
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        const { valid, user } = await authApi.validate();
        if (valid) {
          set({ user, token: stored, isLoading: false });
          return;
        }
      }
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
