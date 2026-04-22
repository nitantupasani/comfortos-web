import { FormEvent, useMemo, useState } from 'react';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

const STARTER_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'bot',
    text: 'Hi! I am your ComfortOS AI assistant. Ask me anything about your building or dashboard.',
  },
];

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text },
      {
        id: crypto.randomUUID(),
        role: 'bot',
        text: 'Thanks for your message. Hook this widget to your backend AI endpoint to get live responses.',
      },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[1000] flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-teal-700 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">AI Assistant</p>
              <p className="text-xs text-teal-100">Online</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-teal-100 transition hover:bg-teal-600 hover:text-white"
              aria-label="Close chat"
            >
              Close
            </button>
          </header>

          <div className="max-h-72 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-5 ${
                  message.role === 'user'
                    ? 'ml-auto bg-teal-600 text-white'
                    : 'mr-auto bg-white text-gray-700 shadow-sm'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask the AI assistant..."
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

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-200"
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <img src="/fox.png" alt="AI bot" className="h-full w-full object-contain p-1.5" />
      </button>
    </div>
  )
}
