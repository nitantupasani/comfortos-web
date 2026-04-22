import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
} from 'framer-motion';
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

// Anchoring for the fox bubble (matches the Tailwind `bottom-24 right-6` +
// `h-16 w-16` classes used below). Keeping these in JS lets us translate
// the bubble with motion values while the anchor stays stable.
const BUBBLE_SIZE = 64;      // h-16 / w-16 = 64px
const BUBBLE_MARGIN_X = 24;  // right-6
const BUBBLE_MARGIN_Y = 96;  // bottom-24
const DRAG_MOVE_THRESHOLD_PX = 6;

// Vos — Dutch for "fox" (and the name of the legendary fox from Van den Vos
// Reynaerde). The icon is a fox, and the platform's roots are Dutch; Vos is
// the ComfortOS guide that each building speaks through.
const BOT_NAME = 'Vos';

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
    return {
      greeting: 'Morning',
      hook: "The day is finding its rhythm. Ask me how we're holding up.",
    };
  }
  if (hour < 14) {
    return {
      greeting: 'Lunchtime',
      hook: 'Midday lull in full effect. Perfect window for a quick check-in.',
    };
  }
  if (hour < 17) {
    return {
      greeting: 'Afternoon',
      hook: 'This is when I tend to run warmest. Curious what my sensors say?',
    };
  }
  if (hour < 19) {
    return {
      greeting: 'Wrap-up time',
      hook: 'Last stretch of the day. Anything you want to check before you head out?',
    };
  }
  if (hour < 22) {
    return {
      greeting: 'Goedenavond',
      hook: 'Things are quieting down. We are catching our breath — ask me anything.',
    };
  }
  return {
    greeting: 'Late-night check-in',
    hook: 'Most have clocked out. I keep one ear open, though. What do you need?',
  };
};

const welcomeFor = (buildingName: string | undefined, now: Date = new Date()): ChatMessage => {
  const { greeting, hook } = timeHook(now.getHours());
  const text = buildingName
    ? `${greeting}! I'm ${BOT_NAME}, the fox looking after ${buildingName}. ${hook}`
    : `${greeting}! I'm ${BOT_NAME}, your ComfortOS fox. Pick a building on the dashboard and I'll tell you how it's feeling. ${hook}`;
  return { id: 'welcome', role: 'bot', text };
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

  const handleDragStart = () => {
    wasDragged.current = false;
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (
      Math.abs(info.offset.x) + Math.abs(info.offset.y) > DRAG_MOVE_THRESHOLD_PX
    ) {
      wasDragged.current = true;
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    clampBubbleY();
    // Snap horizontally to the nearest edge, Messenger-style.
    const viewportMidX = window.innerWidth / 2;
    const snapRight = info.point.x > viewportMidX;
    const leftTargetX = -(window.innerWidth - BUBBLE_MARGIN_X * 2 - BUBBLE_SIZE);
    animate(bubbleX, snapRight ? 0 : leftTargetX, {
      type: 'spring',
      stiffness: 300,
      damping: 28,
    });
  };

  // Build & conversation state ───────────────────────────────────────────
  useEffect(() => {
    setMessages([welcomeFor(buildingName)]);
  }, [buildingId, buildingName]);

  // When the user (re)opens the chat with nothing in it, regenerate the
  // welcome so the greeting reflects the current time of day.
  useEffect(() => {
    if (!isOpen) return;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [welcomeFor(buildingName)];
      }
      return prev;
    });
  }, [isOpen, buildingName]);

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

  const headerTitle = buildingName ?? BOT_NAME;
  const headerSubtitle = buildingName
    ? `with ${BOT_NAME}, your ComfortOS fox`
    : 'your ComfortOS fox';

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

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
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
