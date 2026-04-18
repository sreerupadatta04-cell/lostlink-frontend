import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getNotifications, markAllRead } from '../services/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setUnread(0);
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-ink-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-signal rounded-lg flex items-center justify-center shadow-lg shadow-signal/20">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4V8C14 11.5 11.5 14.5 8 15.5C4.5 14.5 2 11.5 2 8V4L8 1Z" fill="#0a0a0f" fillOpacity="0.8"/>
                <circle cx="8" cy="8" r="2.5" fill="#0a0a0f"/>
              </svg>
            </div>
            <span className="font-display font-700 text-lg text-white group-hover:text-signal transition-colors">
              LostLink
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${isActive('/dashboard') ? 'bg-white/8 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  Dashboard
                </Link>
                <Link to="/items/add"
                  className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${isActive('/items/add') ? 'bg-white/8 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  Register Item
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${isActive('/admin') ? 'bg-white/8 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-body text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification bell */}
                <div className="relative">
                  <button
                    onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) fetchNotifications(); }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5L2 11H14L12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none" className="text-white/60"/>
                      <path d="M6.5 11C6.5 11.8 7.2 12.5 8 12.5C8.8 12.5 9.5 11.8 9.5 11" stroke="currentColor" strokeWidth="1.2" className="text-white/60"/>
                    </svg>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-signal text-ink-950 text-[10px] font-display font-700 rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-ink-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <span className="font-display font-600 text-sm text-white">Notifications</span>
                        {unread > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-signal hover:text-signal-dim transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifs.length === 0 ? (
                          <div className="p-6 text-center text-white/30 text-sm font-body">No notifications yet</div>
                        ) : (
                          notifs.slice(0, 10).map(n => (
                            <div key={n._id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors ${!n.read ? 'bg-signal/3' : ''}`}>
                              <div className="flex items-start gap-2">
                                {!n.read && <div className="w-1.5 h-1.5 bg-signal rounded-full mt-1.5 flex-shrink-0" />}
                                <div className={!n.read ? '' : 'pl-3.5'}>
                                  <p className="text-sm font-body text-white/80">{n.title}</p>
                                  <p className="text-xs font-body text-white/40 mt-0.5">{n.message}</p>
                                  <p className="text-xs font-mono text-white/20 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl">
                    <div className="w-6 h-6 bg-signal/20 border border-signal/30 rounded-lg flex items-center justify-center">
                      <span className="text-signal font-display font-700 text-xs">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-body text-white/70">{user.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl text-sm font-body text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden md:block px-4 py-2 text-sm font-body text-white/60 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-signal text-ink-950 rounded-xl text-sm font-display font-700 hover:bg-signal-dim transition-all">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-white/60">
                {menuOpen
                  ? <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  : <><rect y="3" width="16" height="1.5" rx="0.75"/><rect y="7.25" width="16" height="1.5" rx="0.75"/><rect y="11.5" width="16" height="1.5" rx="0.75"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && user && (
          <div className="md:hidden pb-4 animate-fade-in border-t border-white/5 mt-1 pt-3 space-y-1">
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-white hover:bg-white/5">Dashboard</Link>
            <Link to="/items/add" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-white hover:bg-white/5">Register Item</Link>
            {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-white hover:bg-white/5">Admin</Link>}
          </div>
        )}
      </div>

      {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
    </nav>
  );
}
