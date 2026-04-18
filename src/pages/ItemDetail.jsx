import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, getMessages, replyMessage, updateItemStatus } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { safe: 'badge-safe', found: 'badge-found', recovered: 'badge-recovered' };
const STATUS_LABELS = { safe: '🔒 Safe', found: '🔍 Found', recovered: '✅ Recovered' };

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchData = async () => {
    try {
      const [itemRes, msgRes] = await Promise.all([getItem(id), getMessages(id)]);
      setItem(itemRes.data.item);
      setMessages(msgRes.data.messages || []);
    } catch {
      toast.error('Failed to load item');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await replyMessage({ itemId: id, message: reply });
      toast.success('Reply sent!');
      setReply('');
      fetchData();
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await updateItemStatus(id, status);
      setItem(prev => ({ ...prev, status }));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const downloadQR = () => {
    if (!item?.qrCodeImage) return;
    const link = document.createElement('a');
    link.download = `lostlink-${item.name.replace(/\s+/g, '-')}.png`;
    link.href = item.qrCodeImage;
    link.click();
  };

  const copyLink = () => {
    const url = `${window.location.origin}/scan/${item.qrCodeId}`;
    navigator.clipboard.writeText(url);
    toast.success('Scan link copied!');
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-signal/30 border-t-signal rounded-full animate-spin" />
    </div>
  );

  if (!item) return null;

  const scanUrl = `http://192.168.0.106:5174/scan/${item.qrCodeId}`;
  const unreadCount = messages.filter(m => m.senderType === 'finder' && !m.read).length;

  return (
    <div className="min-h-[calc(100vh-64px)] dot-grid py-10 px-4">
      <div className="max-w-5xl mx-auto animate-slide-up">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-body mb-6 transition-colors group">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display font-700 text-2xl sm:text-3xl text-white">{item.name}</h1>
              <span className={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</span>
            </div>
            <p className="text-white/40 font-body text-sm">{item.category}</p>
          </div>

          {/* Status actions */}
          <div className="flex gap-2 flex-wrap">
            {item.status === 'found' && (
              <button onClick={() => handleStatusUpdate('recovered')} className="btn-primary px-4 py-2 text-sm">
                ✅ Mark Recovered
              </button>
            )}
            {item.status === 'recovered' && (
              <button onClick={() => handleStatusUpdate('safe')} className="btn-ghost px-4 py-2 text-sm">
                🔒 Mark Safe
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-ink-800 rounded-xl border border-white/5 mb-6 w-fit">
          {[
            { key: 'info', label: 'Item Info' },
            { key: 'qr', label: 'QR Code' },
            { key: 'messages', label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-body transition-all ${
                activeTab === tab.key
                  ? 'bg-signal text-ink-950 font-600'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-6">
              <h3 className="label mb-4">Item Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Name</p>
                  <p className="text-white font-body">{item.name}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Description</p>
                  <p className="text-white/70 font-body text-sm leading-relaxed">{item.description}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Category</p>
                  <p className="text-white font-body">{item.category}</p>
                </div>
                {item.reward && (
                  <div>
                    <p className="text-xs text-white/30 font-body mb-1">Reward</p>
                    <p className="text-amber-400 font-body text-sm">{item.reward}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Registered</p>
                  <p className="text-white/50 font-body text-sm">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="label mb-4">QR Code Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">QR Code ID</p>
                  <p className="text-xs font-mono text-white/50 break-all">{item.qrCodeId}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Scan URL</p>
                  <p className="text-xs font-mono text-signal/70 break-all">{scanUrl}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Status</p>
                  <span className={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</span>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-body mb-1">Messages received</p>
                  <p className="text-white font-body">{messages.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Tab */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center gap-6">
            <div className="card p-8 flex flex-col items-center gap-5 max-w-sm w-full">
              <div className="text-center mb-2">
                <h3 className="font-display font-700 text-white text-lg mb-1">Your QR Code</h3>
                <p className="text-sm font-body text-white/40">Print and attach this to your item</p>
              </div>

              {item.qrCodeImage ? (
                <div className="p-4 bg-white rounded-2xl shadow-2xl">
                  <img src={item.qrCodeImage} alt="QR Code" className="w-52 h-52" />
                </div>
              ) : (
                <div className="w-52 h-52 bg-ink-900 rounded-2xl flex items-center justify-center">
                  <p className="text-white/20 text-sm">QR not available</p>
                </div>
              )}

              <div className="w-full space-y-2">
                <button onClick={downloadQR} className="btn-primary w-full py-3">
                  ⬇️ Download QR Code
                </button>
                <button onClick={copyLink} className="btn-ghost w-full py-3">
                  🔗 Copy Scan Link
                </button>
              </div>
            </div>

            <div className="card p-5 max-w-sm w-full">
              <h4 className="font-display font-600 text-white text-sm mb-3">How to use your QR code</h4>
              <ol className="space-y-2 text-sm font-body text-white/50">
                <li className="flex gap-2"><span className="text-signal font-mono">1.</span> Download and print the QR code</li>
                <li className="flex gap-2"><span className="text-signal font-mono">2.</span> Attach it to your item (label, sticker, tag)</li>
                <li className="flex gap-2"><span className="text-signal font-mono">3.</span> If lost, a finder scans it with any phone camera</li>
                <li className="flex gap-2"><span className="text-signal font-mono">4.</span> They can send you an anonymous message</li>
                <li className="flex gap-2"><span className="text-signal font-mono">5.</span> You receive a notification instantly</li>
              </ol>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-display font-600 text-white">Conversation</h3>
                <span className="text-xs font-body text-white/30">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-white/30 font-body text-sm">No messages yet. When a finder scans your QR code and sends a message, it will appear here.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} className={`flex ${msg.senderType === 'owner' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-3 ${
                        msg.senderType === 'owner'
                          ? 'bg-signal/15 border border-signal/20'
                          : 'bg-ink-900 border border-white/8'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-display font-600 text-white/50">
                            {msg.senderType === 'owner' ? '👤 You' : `🔍 ${msg.finderName}`}
                          </span>
                        </div>
                        <p className="text-sm font-body text-white/80 leading-relaxed">{msg.message}</p>
                        {msg.senderType === 'finder' && msg.finderContact && msg.finderContact !== 'Not provided' && (
                          <p className="text-xs font-body text-white/30 mt-1.5">📞 {msg.finderContact}</p>
                        )}
                        <p className="text-xs font-mono text-white/20 mt-1.5">{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="p-4 border-t border-white/5">
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Reply to finder…"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                  />
                  <button type="submit" disabled={sending || !reply.trim()} className="btn-primary px-5 py-3 text-sm">
                    {sending ? '…' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
