import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItemByQR, sendMessage } from '../services/api';
import toast from 'react-hot-toast';

const CAT_ICONS = {
  'Electronics': '💻', 'Wallet/Purse': '👜', 'Keys': '🔑', 'Bag/Backpack': '🎒',
  'Jewelry': '💍', 'Clothing': '👕', 'Documents': '📄', 'Pet': '🐾', 'Other': '📦'
};

export default function ScanPage() {
  const { qrCodeId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ message: '', finderName: '', finderContact: '' });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await getItemByQR(qrCodeId);
        setItem(res.data.item);
      } catch (err) {
        setError(err.response?.data?.message || 'Item not found');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [qrCodeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return toast.error('Please enter a message');

    setSending(true);
    try {
      await sendMessage({
        itemId: item._id,
        message: form.message,
        finderName: form.finderName || 'Anonymous Finder',
        finderContact: form.finderContact || 'Not provided',
        senderType: 'finder'
      });
      setSent(true);
      toast.success('Message sent to the owner!');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-ink-950 dot-grid flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-signal/30 border-t-signal rounded-full animate-spin" />
        <p className="text-white/40 font-body text-sm">Looking up item…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-ink-950 dot-grid flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="text-6xl mb-6">❓</div>
        <h1 className="font-display font-700 text-2xl text-white mb-3">Item Not Found</h1>
        <p className="text-white/40 font-body mb-8">{error}</p>
        <Link to="/" className="btn-primary px-6 py-3 inline-block">Go to LostLink</Link>
      </div>
    </div>
  );

  if (sent) return (
    <div className="min-h-screen bg-ink-950 dot-grid flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="w-20 h-20 bg-signal/10 border border-signal/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="font-display font-700 text-3xl text-white mb-3">Message Sent!</h1>
        <p className="text-white/50 font-body text-lg mb-2">Thank you for helping reunite this item with its owner.</p>
        <p className="text-white/30 font-body text-sm mb-8">The owner has been notified and will reach out if contact info was provided.</p>
        <div className="card p-5 text-left mb-8">
          <p className="text-xs font-mono text-white/30 mb-2">YOUR MESSAGE</p>
          <p className="text-sm font-body text-white/60 italic">"{form.message}"</p>
        </div>
        <Link to="/" className="btn-ghost px-6 py-3 inline-block">
          Learn about LostLink →
        </Link>
      </div>
    </div>
  );

  const isRecovered = item.status === 'recovered';

  return (
    <div className="min-h-screen bg-ink-950 dot-grid py-12 px-4">
      <div className="max-w-lg mx-auto animate-slide-up">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-7 h-7 bg-signal rounded-lg flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4V8C14 11.5 11.5 14.5 8 15.5C4.5 14.5 2 11.5 2 8V4L8 1Z" fill="#0a0a0f" fillOpacity="0.8"/>
                <circle cx="8" cy="8" r="2.5" fill="#0a0a0f"/>
              </svg>
            </div>
            <span className="font-display font-700 text-white group-hover:text-signal transition-colors">LostLink</span>
          </Link>
          <p className="text-xs font-body text-white/30 mt-2">Smart Lost & Found System</p>
        </div>

        {/* QR scan result banner */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-signal/8 border border-signal/20 rounded-xl mb-5 text-center justify-center">
          <div className="w-2 h-2 bg-signal rounded-full animate-pulse" />
          <span className="text-signal text-sm font-body">QR Code scanned successfully</span>
        </div>

        {/* Item card */}
        <div className="card p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-ink-700 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
              {CAT_ICONS[item.category] || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-700 text-xl text-white">{item.name}</h1>
                {isRecovered && <span className="badge bg-blue-400/10 text-blue-400 border border-blue-400/20">Already Recovered</span>}
              </div>
              <p className="text-white/40 font-body text-sm mb-3">{item.category}</p>
              <p className="text-white/60 font-body text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>

          {item.reward && (
            <div className="mt-4 px-4 py-2.5 bg-amber-400/8 border border-amber-400/20 rounded-xl">
              <p className="text-sm font-body text-amber-400">🎁 Reward: {item.reward}</p>
            </div>
          )}
        </div>

        {/* Privacy notice */}
        <div className="flex gap-3 p-4 bg-ink-800 border border-white/5 rounded-xl mb-5">
          <span className="text-signal">🔒</span>
          <p className="text-sm font-body text-white/40 leading-relaxed">
            <span className="text-white/60 font-500">Owner's personal information is protected.</span> Your message will be delivered anonymously through LostLink's secure system.
          </p>
        </div>

        {/* Action */}
        {isRecovered ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-display font-600 text-white text-lg mb-2">Already Recovered</h3>
            <p className="text-white/40 font-body text-sm">This item has been marked as recovered by its owner.</p>
          </div>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary w-full py-4 text-base glow-signal"
          >
            📢 Report Found – Notify Owner
          </button>
        ) : (
          <div className="card p-6 animate-slide-up">
            <h3 className="font-display font-700 text-white text-lg mb-1">Contact the Owner</h3>
            <p className="text-sm font-body text-white/40 mb-5">Your identity stays anonymous. The owner will only see your message.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Your message <span className="text-signal">*</span></label>
                <textarea
                  className="input resize-none h-28"
                  placeholder="Where did you find this item? Any useful details for the owner…"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="label">Your name <span className="text-white/20 normal-case font-body font-400">(optional)</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Anonymous Finder"
                  value={form.finderName}
                  onChange={e => setForm({ ...form, finderName: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Your contact <span className="text-white/20 normal-case font-body font-400">(optional)</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Phone or email (for the owner to reach you)"
                  value={form.finderContact}
                  onChange={e => setForm({ ...form, finderContact: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5 py-3 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={sending} className="btn-primary flex-1 py-3">
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : '📨 Send Notification to Owner'}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-xs font-body text-white/20 mt-6">
          Powered by <Link to="/" className="text-signal/50 hover:text-signal transition-colors">LostLink</Link> — Smart Lost & Found
        </p>
      </div>
    </div>
  );
}
