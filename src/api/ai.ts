import { api } from './client';

export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

interface AiChatResponse {
  reply: string;
  sessionId: string | null;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  buildingId: string | null;
  buildingName: string | null;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ChatMessageOut {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
}

export interface ChatSessionDetail extends ChatSessionSummary {
  messages: ChatMessageOut[];
}

export const aiApi = {
  chat: (
    messages: AiChatMessage[],
    buildingId?: string | null,
    sessionId?: string | null,
  ) =>
    api.post<AiChatResponse>('/ai/chat', {
      messages,
      ...(buildingId ? { buildingId } : {}),
      ...(sessionId ? { sessionId } : {}),
    }),

  /** Marketing-only chat for the public landing page. No auth, no tools. */
  publicChat: (messages: AiChatMessage[]) =>
    api.post<AiChatResponse>('/ai/chat/public', { messages }),

  // ── Sessions ─────────────────────────────────────────────────────────

  createSession: (buildingId?: string | null) =>
    api.post<ChatSessionDetail>('/ai/sessions', {
      ...(buildingId ? { buildingId } : {}),
    }),

  listSessions: (buildingId?: string | null) => {
    const qs = buildingId ? `?buildingId=${encodeURIComponent(buildingId)}` : '';
    return api.get<ChatSessionSummary[]>(`/ai/sessions${qs}`);
  },

  getSession: (sessionId: string) =>
    api.get<ChatSessionDetail>(`/ai/sessions/${encodeURIComponent(sessionId)}`),

  renameSession: (sessionId: string, title: string) =>
    api.put<ChatSessionSummary>(
      `/ai/sessions/${encodeURIComponent(sessionId)}`,
      { title },
    ),

  deleteSession: (sessionId: string) =>
    api.delete<void>(`/ai/sessions/${encodeURIComponent(sessionId)}`),
};
