import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
} from 'framer-motion';
import { History, Maximize2, Minimize2, Plus, Trash2, X } from 'lucide-react';
import {
  aiApi,
  AiChatMessage,
  ChatSessionSummary,
} from '../../api/ai';
import { ApiError } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { usePresenceStore } from '../../store/presenceStore';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

const BUBBLE_SIZE = 64;
const BUBBLE_MARGIN_X = 24;
const BUBBLE_MARGIN_Y = 96;
const DRAG_MOVE_THRESHOLD_PX = 6;

const BOT_NAME = 'Vos';
const SESSION_STORAGE_KEY = 'comfortos.chat.sessionId';

type TimeHook = { greeting: string; hook: string };

const timeHook = (hour: number): TimeHook => {
  if (hour < 5) {
    return {
      greeting: 'Stil, het is nacht',
      hook: "I'm running on a whisper — vents low, lights off. What has you up at this hour?",
    };
  }
  if (hour < 9) {
    return {
      greeting: 'Goedemorgen',
      hook: 'We are both just waking up. Want a quick read on how the building feels?',
    };
  }
  if (hour < 12) {
    return { greeting: 'Morning', hook: "The day is finding its rhythm. Ask me how we're holding up." };
  }
  if (hour < 14) {
    return { greeting: 'Lunchtime', hook: 'Midday lull in full effect. Perfect window for a quick check-in.' };
  }
  if (hour < 17) {
    return { greeting: 'Afternoon', hook: 'This is when I tend to run warmest. Curious what my sensors say?' };
  }
  if (hour < 19) {
    return { greeting: 'Wrap-up time', hook: 'Last stretch of the day. Anything you want to check before you head out?' };
  }
  if (hour < 22) {
    return { greeting: 'Goedenavond', hook: 'Things are quieting down. We are catching our breath — ask me anything.' };
  }
  return { greeting: 'Late-night check-in', hook: 'Most have clocked out. I keep one ear open, though. What do you need?' };
};

const welcomeFor = (buildingName: string | undefined, now: Date = new Date()): ChatMessage => {
  const { greeting, hook } = timeHook(now.getHours());
  const text = buildingName
    ? `${greeting}! I'm ${BOT_NAME}, the fox looking after ${buildingName}. ${hook}`
    : `${greeting}! I'm ${BOT_NAME}, your ComfortOS fox. Pick a building on the dashboard and I'll tell you how it's feeling. ${hook}`;
  return { id: 'welcome', role: 'bot', text };
};

const formatTimestamp = (iso: string): string => {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

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

  // Session state ────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const sessionKey = buildingId ?? 'none';

  // Fox-bubble drag state ────────────────────────────────────────────────
  const bubbleX = useMotionValue(0);
  const bubbleY = useMotionValue(0);
  const wasDragged = useRef(false);

  const clampBubbleY = () => {
    const maxUp = -(window.innerHeight - BUBBLE_SIZE - BUBBLE_MARGIN_Y - 16);
    const y = bubbleY.get();
    if (y < maxUp) bubbleY.set(maxUp);
    if (y > 0) bubbleY.set(0);
  };

  const handleDragStart = () => { wasDragged.current = false; };
  const handleDrag = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) + Math.abs(info.offset.y) > DRAG_MOVE_THRESHOLD_PX) {
      wasDragged.current = true;
    }
  };
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    clampBubbleY();
    const viewportMidX = window.innerWidth / 2;
    const snapRight = info.point.x > viewportMidX;
    const leftTargetX = -(window.innerWidth - BUBBLE_MARGIN_X * 2 - BUBBLE_SIZE);
    animate(bubbleX, snapRight ? 0 : leftTargetX, {
      type: 'spring', stiffness: 300, damping: 28,
    });
  };

  // Resolve session on user / building change. Fresh logins start a new
  // session; refreshes within the same login reuse the stored id.
  useEffect(() => {
    if (!user) {
      setSessionId(null);
      return;
    }
    let cancelled = false;
    const stored = localStorage.getItem(`${SESSION_STORAGE_KEY}:${sessionKey}`);
    const resolve = async () => {
      if (stored) {
        try {
          const detail = await aiApi.getSession(stored);
          if (cancelled) return;
          setSessionId(detail.id);
          const hydrated: ChatMessage[] =
            detail.messages.length > 0
              ? detail.messages.map((m) => ({
                  id: m.id,
                  role: m.role === 'user' ? 'user' : 'bot',
                  text: m.content,
                }))
              : [welcomeFor(buildingName)];
          setMessages(hydrated);
          return;
        } catch {
          // Stored session is gone — fall through to create a new one.
          localStorage.removeItem(`${SESSION_STORAGE_KEY}:${sessionKey}`);
        }
      }
      try {
        const created = await aiApi.createSession(buildingId);
        if (cancelled) return;
        setSessionId(created.id);
        localStorage.setItem(`${SESSION_STORAGE_KEY}:${sessionKey}`, created.id);
        setMessages([welcomeFor(buildingName)]);
      } catch {
        // No backend or unauthorized — fall back to local-only session.
        if (!cancelled) setSessionId(null);
      }
    };
    resolve();
    return () => { cancelled = true; };
  }, [user?.id, buildingId, buildingName, sessionKey]);

  // Refresh welcome when the chat reopens and the conversation is blank.
  useEffect(() => {
    if (!isOpen) return;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') return [welcomeFor(buildingName)];
      return prev;
    });
  }, [isOpen, buildingName]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  if (!user) return null;

  const refreshSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const list = await aiApi.listSessions(buildingId);
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const startNewSession = async () => {
    try {
      const created = await aiApi.createSession(buildingId);
      setSessionId(created.id);
      localStorage.setItem(`${SESSION_STORAGE_KEY}:${sessionKey}`, created.id);
      setMessages([welcomeFor(buildingName)]);
      setShowHistory(false);
    } catch {
      // fall back silently
    }
  };

  const openSession = async (id: string) => {
    try {
      const detail = await aiApi.getSession(id);
      setSessionId(detail.id);
      localStorage.setItem(`${SESSION_STORAGE_KEY}:${sessionKey}`, detail.id);
      const hydrated: ChatMessage[] =
        detail.messages.length > 0
          ? detail.messages.map((m) => ({
              id: m.id,
              role: m.role === 'user' ? 'user' : 'bot',
              text: m.content,
            }))
          : [welcomeFor(detail.buildingName ?? undefined)];
      setMessages(hydrated);
      setShowHistory(false);
    } catch {
      // ignore
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await aiApi.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === sessionId) {
        await startNewSession();
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    // Keep the welcome in the history so Gemini sees the offer it is
    // replying to. Without this, a short 'yes' has no context and Vos
    // mis-routes it (most commonly to the complaint flow).
    const history: AiChatMessage[] = nextMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const { reply, sessionId: returnedSid } = await aiApi.chat(history, buildingId, sessionId);
      if (returnedSid && returnedSid !== sessionId) {
        setSessionId(returnedSid);
        localStorage.setItem(`${SESSION_STORAGE_KEY}:${sessionKey}`, returnedSid);
      }
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

  const headerTitle = buildingName ?? BOT_NAME;
  const headerSubtitle = buildingName ? `with ${BOT_NAME}, your ComfortOS fox` : 'your ComfortOS fox';

  const panelClass = isFullscreen
    ? 'fixed inset-0 z-[1100] flex flex-col bg-white'
    : 'fixed bottom-24 right-6 z-[1050] flex h-[min(85vh,38rem)] w-[min(95vw,24rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={panelClass}
            style={{ transformOrigin: 'bottom right' }}
          >
            <header className="flex items-center justify-between bg-teal-700 px-4 py-3 text-white" translate="no">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" translate="no">{headerTitle}</p>
                <p className="truncate text-xs text-teal-100" translate="no">{headerSubtitle}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowHistory((v) => {
                      const next = !v;
                      if (next) void refreshSessions();
                      return next;
                    });
                  }}
                  className={`rounded-md p-1.5 transition ${
                    showHistory
                      ? 'bg-teal-600 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  }`}
                  aria-label="Chat history"
                  title="Chat history"
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={startNewSession}
                  className="rounded-md p-1.5 text-teal-100 transition hover:bg-teal-600 hover:text-white"
                  aria-label="Start new chat"
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen((v) => !v)}
                  className="rounded-md p-1.5 text-teal-100 transition hover:bg-teal-600 hover:text-white"
                  aria-label={isFullscreen ? 'Exit full screen' : 'Expand to full screen'}
                  title={isFullscreen ? 'Exit full screen' : 'Full screen'}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                    setShowHistory(false);
                  }}
                  className="rounded-md p-1.5 text-teal-100 transition hover:bg-teal-600 hover:text-white"
                  aria-label="Close chat"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {showHistory ? (
              <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Past chats
                  </p>
                  <button
                    type="button"
                    onClick={startNewSession}
                    className="flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-teal-700"
                  >
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>
                {isLoadingSessions ? (
                  <p className="px-2 text-xs text-gray-500">Loading…</p>
                ) : sessions.length === 0 ? (
                  <p className="px-2 text-xs text-gray-500">
                    No past conversations yet. Start chatting and they will show up here.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {sessions.map((s) => {
                      const isActive = s.id === sessionId;
                      return (
                        <li
                          key={s.id}
                          className={`group flex items-center gap-2 rounded-md border px-2 py-2 transition ${
                            isActive
                              ? 'border-teal-400 bg-white'
                              : 'border-transparent bg-white hover:border-gray-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openSession(s.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-[13px] font-medium text-gray-900">
                              {s.title || 'Untitled'}
                            </p>
                            <p className="truncate text-[11px] text-gray-500">
                              {(s.buildingName || 'No building') + ' · '}
                              {formatTimestamp(s.lastMessageAt)} ·{' '}
                              {s.messageCount} {s.messageCount === 1 ? 'msg' : 'msgs'}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSession(s.id)}
                            className="rounded-md p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete session"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
                {messages.map((message) => {
                  const isWelcome = message.id === 'welcome';
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-5 ${
                        message.role === 'user'
                          ? 'ml-auto bg-teal-600 text-white'
                          : 'mr-auto bg-white text-gray-700 shadow-sm'
                      }`}
                      {...(isWelcome ? { translate: 'no' as const } : {})}
                    >
                      {message.text}
                    </div>
                  );
                })}
                {isSending && (
                  <div
                    className="mr-auto max-w-[85%] rounded-xl bg-white px-3 py-2 text-sm italic text-gray-500 shadow-sm"
                    translate="no"
                  >
                    Thinking…
                  </div>
                )}
              </div>
            )}

            {!showHistory && (
              <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3" translate="no">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={buildingName ? `Ask ${buildingName} anything…` : 'Ask the AI assistant…'}
                    disabled={isSending}
                    className="input h-10"
                    translate="no"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                    translate="no"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {!isFullscreen && (
        <motion.button
          type="button"
          style={{ x: bubbleX, y: bubbleY }}
          drag
          dragMomentum={false}
          dragElastic={0.15}
          whileDrag={{ scale: 1.1, boxShadow: '0 18px 40px rgba(0,0,0,0.28)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            if (wasDragged.current) {
              e.preventDefault();
              e.stopPropagation();
              wasDragged.current = false;
              return;
            }
            setIsOpen((prev) => !prev);
          }}
          className="fixed bottom-24 right-6 z-[1000] h-16 w-16 cursor-grab touch-none overflow-hidden rounded-full border border-gray-200 bg-white shadow-xl active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-teal-200"
          aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        >
          <img
            src="/fox.png"
            alt="AI bot"
            draggable={false}
            className="pointer-events-none h-full w-full object-contain p-1.5"
          />
        </motion.button>
      )}
    </>
  );
}
