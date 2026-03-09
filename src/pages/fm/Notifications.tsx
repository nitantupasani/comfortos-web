import { useState } from 'react';
import { Bell, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

export default function FMNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.post('/notifications/send', { title, body });
      setSent(true);
      setTitle('');
      setBody('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Bell className="h-6 w-6 text-teal-500" />
        Send Notification
      </h2>
      <p className="text-sm text-gray-500">
        Send a push notification to all building occupants. Only available for facility managers and admins.
      </p>

      <form onSubmit={handleSend} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
            placeholder="Notification title…"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-300 outline-none resize-none"
            rows={4}
            placeholder="Notification body…"
            required
          />
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
        {sent && (
          <div className="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Notification sent successfully
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? 'Sending…' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}
