import { api } from './client';
import type { Vote, VoteSubmitResponse } from '../types';

export interface VoteSubmitRequest {
  voteUuid: string;
  buildingId: string;
  userId: string;
  payload: Record<string, unknown>;
  schemaVersion: number;
  createdAt: string;
}

export const votesApi = {
  submit: (data: VoteSubmitRequest) =>
    api.post<VoteSubmitResponse>('/votes', data),

  history: (userId: string) =>
    api.get<Vote[]>(`/votes/history?userId=${userId}`),
};
