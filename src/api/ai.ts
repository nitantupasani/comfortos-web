import { api } from './client';

export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

interface AiChatResponse {
  reply: string;
}

export const aiApi = {
  chat: (messages: AiChatMessage[], buildingId?: string | null) =>
    api.post<AiChatResponse>('/ai/chat', {
      messages,
      ...(buildingId ? { buildingId } : {}),
    }),

  /** Marketing-only chat for the public landing page. No auth, no tools. */
  publicChat: (messages: AiChatMessage[]) =>
    api.post<AiChatResponse>('/ai/chat/public', { messages }),
};
