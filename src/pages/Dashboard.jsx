import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getItems, deleteItem, updateItemStatus } from '../services/api';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  safe: 'badge-safe',
  found: 'badge-found',
  recovered: 'badge-recovered'
};

const STATUS_LABELS = { safe: '🔒 Safe', found: '🔍 Found', recovered: '✅ Recovered' };

const CAT_ICONS = {
  'Electronics': '💻', 'Wallet/Purse': '👜', 'Keys': '🔑', 'Bag/Backpack': '🎒',
  'Jewelry': '💍', 'Clothing': '👕', 'Documents': '📄', 'Pet': '🐾', 'Other': '📦'
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [search, statusFilter, categoryFilter]);

  const fetchItems = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await getItems(params);
      setItems(res.data.items);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteItem(id);
      toast.success('Item deleted');
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === 'found' ? 'recovered' : item.status === 'safe' ? 'safe' : 'recovered';
    if (item.status === 'safe') return;
    try {
      await updateItemStatus(item._id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, status: newStatus } : i));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const stats = {
    total: items.length,
    safe: items.filter(i => i.status === 'safe').length,
    found: items.filter(i => i.status === 'found').length,
    recovered: items.filter(i => i.status === 'recovered').length,
  };

  return (
    <div className="min-h-[calc(100vh-64px)] dot-grid py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="font-display font-700 text-3xl text-white mb-1">
              My Items
            </h1>
            <p className="text-white/40 font-body text-sm">
              Welcome back, <span className="text-white/60">{user?.name}</span>
            </p>
          </div>
          <Link to="/items/add" className="btn-primary px-6 py-3 inline-flex items-center gap-2 self-start sm:self-auto">
            <span>+</span> Register Item
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in">
          {[
            { label: 'Total Items', value: stats.total, color: 'text-white' },
            { label: 'Safe', value: stats.safe, color: 'text-signal' },
            { label: 'Found', value: stats.found, color: 'text-amber-400' },
            { label: 'Recovered', value: stats.recovered, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="card p-4 sm:p-5">
              <p className={`font-display font-700 text-2xl sm:text-3xl ${s.color} mb-1`}>{s.value}</p>
              <p className="text-xs font-body text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input w-full sm:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="safe">Safe</option>
            <option value="found">Found</option>
            <option value="recovered">Recovered</option>
          </select>
          <select className="input w-full sm:w-48" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {['Electronics','Wallet/Purse','Keys','Bag/Backpack','Jewelry','Clothing','Documents','Pet','Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-signal/30 border-t-signal rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-display font-600 text-white text-xl mb-2">
              {search || statusFilter || categoryFilter ? 'No items match your filters' : 'No items yet'}
            </h3>
            <p className="text-white/40 font-body text-sm mb-6">
              {search || statusFilter || categoryFilter ? 'Try adjusting your search' : 'Register your first item to get started'}
            </p>
            {!search && !statusFilter && !categoryFilter && (
              <Link to="/items/add" className="btn-primary px-6 py-3 inline-block">Register First Item</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item._id} className="card p-5 hover:border-white/10 transition-all duration-300 group flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ink-700 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {CAT_ICONS[item.category] || '📦'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-600 text-white text-base truncate">{item.name}</h3>
                      <p className="text-xs font-body text-white/40">{item.category}</p>
                    </div>
                  </div>
                  <span className={STATUS_COLORS[item.status]}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm font-body text-white/50 leading-relaxed line-clamp-2 mb-4 flex-1">
                  {item.description}
                </p>

                {/* Reward */}
                {item.reward && (
                  <div className="mb-3 px-3 py-1.5 bg-amber-400/5 border border-amber-400/15 rounded-lg">
                    <p className="text-xs font-body text-amber-400/80">🎁 {item.reward}</p>
                  </div>
                )}

                {/* QR ID */}
                <div className="mb-4 px-3 py-1.5 bg-ink-900 rounded-lg">
                  <p className="text-xs font-mono text-white/25 truncate">{item.qrCodeId}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/8 text-sm font-body text-white/60 hover:text-white transition-all"
                  >
                    View Details
                  </button>
                  {item.status === 'found' && (
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className="flex-1 py-2 rounded-xl bg-signal/10 hover:bg-signal/15 text-sm font-body text-signal transition-all"
                    >
                      Mark Recovered
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    disabled={deleting === item._id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/5 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 3.5H12M5 3.5V2.5C5 2 5.5 1.5 6 1.5H8C8.5 1.5 9 2 9 2.5V3.5M10.5 3.5L10 11C10 11.5 9.5 12 9 12H5C4.5 12 4 11.5 4 11L3.5 3.5H10.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <p className="text-xs font-body text-white/20 mt-3">
                  Registered {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
