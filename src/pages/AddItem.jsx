import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Wallet/Purse', 'Keys', 'Bag/Backpack', 'Jewelry', 'Clothing', 'Documents', 'Pet', 'Other'];

const CAT_ICONS = {
  'Electronics': '💻', 'Wallet/Purse': '👜', 'Keys': '🔑', 'Bag/Backpack': '🎒',
  'Jewelry': '💍', 'Clothing': '👕', 'Documents': '📄', 'Pet': '🐾', 'Other': '📦'
};

export default function AddItem() {
  const [form, setForm] = useState({ name: '', description: '', category: '', reward: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category) {
      return toast.error('Please fill in all required fields');
    }

    setLoading(true);
    try {
      const res = await createItem(form);
      toast.success('Item registered successfully!');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] dot-grid py-12 px-4">
      <div className="max-w-2xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-body mb-5 transition-colors group">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Back to Dashboard
          </button>
          <h1 className="font-display font-700 text-3xl text-white mb-2">Register an item</h1>
          <p className="text-white/40 font-body">Add details about your belonging and we'll generate a unique QR code</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="label">Item name <span className="text-signal">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. MacBook Pro, AirPods, Car Keys..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                maxLength={80}
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description <span className="text-signal">*</span></label>
              <textarea
                className="input resize-none h-28"
                placeholder="Describe the item — color, model, any identifying features..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                maxLength={500}
              />
              <p className="text-xs text-white/20 font-body mt-1.5 text-right">{form.description.length}/500</p>
            </div>

            {/* Category */}
            <div>
              <label className="label">Category <span className="text-signal">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-body transition-all ${
                      form.category === cat
                        ? 'bg-signal/10 border-signal/40 text-signal'
                        : 'bg-ink-900 border-white/8 text-white/40 hover:border-white/20 hover:text-white/60'
                    }`}
                  >
                    <span className="text-lg">{CAT_ICONS[cat]}</span>
                    <span className="leading-tight text-center">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reward */}
            <div>
              <label className="label">Reward offer <span className="text-white/20 normal-case font-body font-400">(optional)</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. ₹500 reward for safe return"
                value={form.reward}
                onChange={e => setForm({ ...form, reward: e.target.value })}
              />
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-4 bg-signal/5 border border-signal/15 rounded-xl">
              <span className="text-signal text-lg flex-shrink-0">ℹ️</span>
              <p className="text-sm font-body text-white/50 leading-relaxed">
                After registering, you'll get a unique QR code to print and attach to your item. Anyone who finds it can scan the code to notify you.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                  Generating QR code…
                </span>
              ) : '🏷️ Register & Generate QR Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
