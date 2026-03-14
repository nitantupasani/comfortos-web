import { api } from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  /** Send Firebase ID token to backend for verification + local user lookup/creation */
  firebaseLogin: (idToken: string) =>
    api.post<AuthResponse>('/auth/firebase', { idToken }),

  validate: () => api.get<{ valid: boolean; user: AuthResponse['user'] }>('/auth/validate'),
};
