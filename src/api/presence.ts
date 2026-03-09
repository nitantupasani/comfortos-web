import { api } from './client';
import type { PresenceEvent } from '../types';

export const presenceApi = {
  report: (event: PresenceEvent) =>
    api.post<{ status: string }>('/presence/events', event),
};
