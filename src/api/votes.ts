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

export interface VoteAnalyticsResponse {
  buildingId: string;
  buildingName: string;
  totalVotes: number;
  votes: Vote[];
}

export const votesApi = {
  submit: (data: VoteSubmitRequest) =>
    api.post<VoteSubmitResponse>('/votes', data),

  history: (userId: string) =>
    api.get<Vote[]>(`/votes/history?userId=${userId}`),

  analytics: (buildingId: string, dateFrom?: string, dateTo?: string, zone?: string) => {
    const params = new URLSearchParams({ buildingId });
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (zone) params.set('zone', zone);
    return api.get<VoteAnalyticsResponse>(`/votes/analytics?${params.toString()}`);
  },
};
