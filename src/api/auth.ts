import { api } from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  googleLogin: (idToken: string) =>
    api.post<AuthResponse>('/auth/google', { idToken }),

  refresh: () => api.post<AuthResponse>('/auth/refresh'),

  logout: () => api.post<{ status: string }>('/auth/logout'),

  validate: () => api.get<{ valid: boolean; user: AuthResponse['user'] }>('/auth/validate'),
};
