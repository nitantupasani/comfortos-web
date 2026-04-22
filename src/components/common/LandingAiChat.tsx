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

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

// Matches Tailwind `bottom-24 right-6 h-16 w-16` on the bubble.
const BUBBLE_SIZE = 64;
const BUBBLE_MARGIN_X = 24;
const BUBBLE_MARGIN_Y = 96;
const DRAG_MOVE_THRESHOLD_PX = 6;

const BOT_NAME = 'Vos';

const timeHook = (hour: number): string => {
  if (hour < 5) return "It's late. I keep one ear open. Curious about ComfortOS?";
  if (hour < 9) return 'Goedemorgen! Want a quick tour of what ComfortOS does?';
  if (hour < 12) return 'Morning. Ask me what ComfortOS is and why it exists.';
  if (hour < 14) return 'Lunchtime lull — a good moment for a 90-second pitch.';
  if (hour < 17) return "Afternoon. What would you like to know about ComfortOS?";
  if (hour < 19) return 'Wrapping up the day? Ask away while I have your attention.';
  if (hour < 22) return 'Goedenavond. Ask me anything about ComfortOS.';
  return 'Still awake? Ask me anything about ComfortOS.';
};

const welcomeFor = (now: Date = new Date()): ChatMessage => ({
  id: 'welcome',
  role: 'bot',
  text: `Hi, I'm ${BOT_NAME}, the ComfortOS fox. ${timeHook(now.getHours())}`,
});

export default function LandingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeFor()]);
  const [isSending, setIsSending] = useState(false);

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
    const viewportMidX = window.innerWidth / 2;
    const snapRight = info.point.x > viewportMidX;
    const leftTargetX = -(window.innerWidth - BUBBLE_MARGIN_X * 2 - BUBBLE_SIZE);
    animate(bubbleX, snapRight ? 0 : leftTargetX, {
      type: 'spring',
      stiffness: 300,
      damping: 28,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [welcomeFor()];
      }
      return prev;
    });
  }, [isOpen]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending],
  );

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
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const { reply } = await aiApi.publicChat(history);
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

  const panelClass = isFullscreen
    ? 'fixed inset-0 z-[1100] flex flex-col bg-white'
    : 'fixed bottom-24 right-6 z-[1050] flex h-[min(85vh,38rem)] w-[min(95vw,24rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="landing-chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={panelClass}
            style={{ transformOrigin: 'bottom right' }}
          >
            <header className="flex items-center justify-between bg-teal-700 px-4 py-3 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{BOT_NAME}</p>
                <p className="truncate text-xs text-teal-100">your ComfortOS fox</p>
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
                  placeholder="Ask me about ComfortOS…"
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
          aria-label={isOpen ? 'Close Vos chat' : 'Open Vos chat'}
        >
          <img
            src="/fox.png"
            alt="Vos the ComfortOS fox"
            draggable={false}
            className="pointer-events-none h-full w-full object-contain p-1.5"
          />
        </motion.button>
      )}
    </>
  );
}
