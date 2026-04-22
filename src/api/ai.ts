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
  chat: (messages: AiChatMessage[]) =>
    api.post<AiChatResponse>('/ai/chat', { messages }),
};
