import { api } from './client';

export type ComplaintType = 'hot' | 'cold' | 'air_quality' | 'cleanliness' | 'other';

export interface ComplaintComment {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  buildingId: string;
  buildingName: string;
  createdBy: string;
  authorName: string;
  complaintType: ComplaintType;
  title: string;
  description: string | null;
  createdAt: string;
  cosignCount: number;
  cosignerIds: string[];
  viewerHasCosigned: boolean;
  comments: ComplaintComment[];
}

export const complaintsApi = {
  list: (buildingId?: string) =>
    api.get<Complaint[]>(
      buildingId ? `/complaints?buildingId=${encodeURIComponent(buildingId)}` : '/complaints',
    ),

  get: (complaintId: string) => api.get<Complaint>(`/complaints/${complaintId}`),

  create: (data: {
    buildingId: string;
    complaintType: ComplaintType;
    title: string;
    description?: string;
  }) => api.post<Complaint>('/complaints', data),

  cosign: (complaintId: string) =>
    api.post<Complaint>(`/complaints/${complaintId}/cosign`),

  uncosign: (complaintId: string) =>
    api.delete<Complaint>(`/complaints/${complaintId}/cosign`),

  comment: (complaintId: string, body: string) =>
    api.post<Complaint>(`/complaints/${complaintId}/comments`, { body }),
};
