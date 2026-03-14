import { api } from './client';

export interface FMRequestResponse {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  buildingId: string;
  buildingName: string;
  roleRequested: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export const fmRequestsApi = {
  /** Submit a new FM role request */
  create: (data: { buildingId: string; roleRequested?: string; message?: string }) =>
    api.post<FMRequestResponse>('/fm-requests', data),

  /** List FM requests (admin: all, user: own) */
  list: () => api.get<FMRequestResponse[]>('/fm-requests'),

  /** Admin approves or rejects a request */
  review: (requestId: string, data: { action: 'approve' | 'reject'; reviewNote?: string }) =>
    api.put<FMRequestResponse>(`/fm-requests/${requestId}/review`, data),
};
