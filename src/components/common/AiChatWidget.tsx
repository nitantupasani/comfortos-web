import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { aiApi, AiChatMessage } from '../../api/ai';
import { ApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { usePresenceStore } from '../../store/presenceStore';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

const welcomeFor = (buildingName: string | undefined): ChatMessage => ({
  id: 'welcome',
  role: 'bot',
  text: buildingName
    ? `Hi, I'm ${buildingName}. Ask me how I'm doing, what people have been saying, or if something is bothering you right now.`
    : 'Hi! Pick a building from the dashboard and I can tell you how it is feeling, what is trending, and log issues for you.',
});

export default function AiChatWidget() {
  const user = useAuthStore((s) => s.user);
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const buildingId = activeBuilding?.id ?? null;
  const buildingName = activeBuilding?.name;

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeFor(buildingName)]);
  const [isSending, setIsSending] = useState(false);

  // When the selected building changes, reset the welcome so the persona
  // introduces the new building. Existing conversation is cleared.
  useEffect(() => {
    setMessages([welcomeFor(buildingName)]);
  }, [buildingId, buildingName]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending],
  );

  if (!user) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    const history: AiChatMessage[] = nextMessages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

    try {
      const { reply } = await aiApi.chat(history, buildingId);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', text: reply },
      ]);
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong reaching the AI assistant.';
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', text: `Sorry — ${detail}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const headerTitle = buildingName ?? 'ComfortOS Assistant';
  const headerSubtitle = buildingName ? 'speaking as your building' : 'Online';

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[1100] flex flex-col items-stretch'
    : 'fixed bottom-24 right-6 z-[1000] flex flex-col items-end gap-3';

  const panelClass = isFullscreen
    ? 'flex h-full w-full flex-col overflow-hidden bg-white'
    : 'flex w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl';

  const transcriptClass = isFullscreen
    ? 'flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4'
    : 'max-h-72 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3';

  return (
    <div className={wrapperClass}>
      {isOpen && (
        <section className={panelClass}>
          <header className="flex items-center justify-between bg-teal-700 px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{headerTitle}</p>
              <p className="truncate text-xs text-teal-100">{headerSubtitle}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsFullscreen((v) => !v)}
                className="rounded-md p-1.5 text-teal-100 transition hover:bg-teal-600 hover:text-white"
                aria-label={isFullscreen ? 'Exit full screen' : 'Expand to full screen'}
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }}
                className="rounded-md p-1.5 text-teal-100 transition hover:bg-teal-600 hover:text-white"
                aria-label="Close chat"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className={transcriptClass}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-5 ${
                  message.role === 'user'
                    ? 'ml-auto bg-teal-600 text-white'
                    : 'mr-auto bg-white text-gray-700 shadow-sm'
                }`}
              >
                {message.text}
              </div>
            ))}
            {isSending && (
              <div className="mr-auto max-w-[85%] rounded-xl bg-white px-3 py-2 text-sm italic text-gray-500 shadow-sm">
                Thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  buildingName
                    ? `Ask ${buildingName} anything…`
                    : 'Ask the AI assistant…'
                }
                disabled={isSending}
                className="input h-10"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      )}

      {!isFullscreen && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-200"
          aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        >
          <img src="/fox.png" alt="AI bot" className="h-full w-full object-contain p-1.5" />
        </button>
      )}
    </div>
  );
}
