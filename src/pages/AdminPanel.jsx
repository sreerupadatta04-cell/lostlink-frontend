import { useState, useEffect } from 'react';
import { adminGetUsers, adminGetItems, adminGetReports, adminDeleteUser } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { safe: 'text-signal', found: 'text-amber-400', recovered: 'text-blue-400' };

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, itemsRes, reportsRes] = await Promise.all([
        adminGetUsers(), adminGetItems(), adminGetReports()
      ]);
      setUsers(usersRes.data.users || []);
      setItems(itemsRes.data.items || []);
      setReports(reportsRes.data.messages || []);
      setStats(reportsRes.data.stats || {});
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}" and all their items? This cannot be undone.`)) return;
    try {
      await adminDeleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-signal/30 border-t-signal rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] dot-grid py-10 px-4">
      <div className="max-w-7xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
            <span>⚡</span>
          </div>
          <div>
            <h1 className="font-display font-700 text-2xl text-white">Admin Panel</h1>
            <p className="text-white/40 font-body text-sm">System overview and management</p>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers || 0, color: 'text-white' },
            { label: 'Total Items', value: stats.totalItems || 0, color: 'text-white' },
            { label: 'Safe Items', value: (stats.totalItems || 0) - (stats.foundItems || 0) - (stats.recoveredItems || 0), color: 'text-signal' },
            { label: 'Found Items', value: stats.foundItems || 0, color: 'text-amber-400' },
            { label: 'Recovered', value: stats.recoveredItems || 0, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className={`font-display font-700 text-2xl ${s.color} mb-1`}>{s.value}</p>
              <p className="text-xs font-body text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-ink-800 rounded-xl border border-white/5 mb-6 w-fit">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'users', label: `👥 Users (${users.length})` },
            { key: 'items', label: `🏷️ Items (${items.length})` },
            { key: 'reports', label: `💬 Reports (${reports.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${tab === t.key ? 'bg-signal text-ink-950 font-600' : 'text-white/40 hover:text-white/60'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-6">
              <h3 className="label mb-4">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(u => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-signal/10 border border-signal/20 rounded-lg flex items-center justify-center">
                      <span className="text-signal font-display font-700 text-xs">{u.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-body text-white/70">{u.name}</p>
                      <p className="text-xs font-body text-white/30">{u.email}</p>
                    </div>
                    {u.role === 'admin' && <span className="ml-auto badge bg-red-400/10 text-red-400 border border-red-400/20">Admin</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="label mb-4">Recent Items</h3>
              <div className="space-y-3">
                {items.slice(0, 5).map(item => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-body text-white/70">{item.name}</p>
                      <p className="text-xs font-body text-white/30">{item.userId?.name || 'Unknown'} · {item.category}</p>
                    </div>
                    <span className={`text-xs font-body ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Joined</th>
                    <th className="px-5 py-3 text-right text-xs font-display font-600 text-white/40 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-signal/10 rounded-lg flex items-center justify-center">
                            <span className="text-signal font-display font-700 text-xs">{u.name[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-body text-white/70">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-white/40">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-display font-600 ${u.role === 'admin' ? 'text-red-400' : 'text-white/40'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-body text-white/30">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id, u.name)}
                            className="text-xs font-body text-red-400/50 hover:text-red-400 transition-colors">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {tab === 'items' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Item</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Owner</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-display font-600 text-white/40 uppercase tracking-wider">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-body text-white/70">{item.name}</td>
                      <td className="px-5 py-3.5 text-sm font-body text-white/40">{item.userId?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-sm font-body text-white/40">{item.category}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-display font-600 ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-body text-white/30">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-white/30 font-body">No finder reports yet</p>
              </div>
            ) : reports.map(msg => (
              <div key={msg._id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-display font-600 ${msg.senderType === 'finder' ? 'text-signal' : 'text-amber-400'}`}>
                      {msg.senderType === 'finder' ? '🔍 Finder' : '👤 Owner'}
                    </span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs font-body text-white/40">{msg.itemId?.name || 'Unknown item'}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs font-body text-white/30">{msg.itemId?.category}</span>
                  </div>
                  <p className="text-sm font-body text-white/60">{msg.message}</p>
                  <p className="text-xs font-mono text-white/20 mt-1.5">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <span className={`badge ${msg.itemId?.status === 'found' ? 'badge-found' : msg.itemId?.status === 'recovered' ? 'badge-recovered' : 'badge-safe'} flex-shrink-0`}>
                  {msg.itemId?.status || 'unknown'}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
