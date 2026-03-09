import { create } from 'zustand';
import type { Vote } from '../types';
import { votesApi, type VoteSubmitRequest } from '../api/votes';

interface VoteState {
  history: Vote[];
  isSubmitting: boolean;
  lastResult: string | null;
  error: string | null;
  fetchHistory: (userId: string) => Promise<void>;
  submit: (data: VoteSubmitRequest) => Promise<boolean>;
  clearResult: () => void;
}

export const useVoteStore = create<VoteState>((set) => ({
  history: [],
  isSubmitting: false,
  lastResult: null,
  error: null,

  fetchHistory: async (userId) => {
    try {
      const history = await votesApi.history(userId);
      set({ history });
    } catch { /* ignore */ }
  },

  submit: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await votesApi.submit(data);
      set({ isSubmitting: false, lastResult: res.status });
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Vote failed';
      set({ isSubmitting: false, error: msg });
      return false;
    }
  },

  clearResult: () => set({ lastResult: null, error: null }),
}));
