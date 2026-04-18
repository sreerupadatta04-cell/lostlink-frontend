import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const FEATURES = [
  {
    icon: '🏷️',
    title: 'Register & Tag',
    desc: 'Register any belonging and get a unique QR code to attach to it.',
  },
  {
    icon: '📱',
    title: 'Finder Scans',
    desc: 'Anyone who finds your item scans the QR code — no app needed.',
  },
  {
    icon: '🔔',
    title: 'Instant Alert',
    desc: 'You get notified immediately when your item is found.',
  },
  {
    icon: '🔒',
    title: 'Stay Anonymous',
    desc: 'Communicate securely without exposing personal details.',
  },
];

const CATEGORIES = ['Electronics', 'Wallet/Purse', 'Keys', 'Bag/Backpack', 'Jewelry', 'Documents', 'Pet', 'Other'];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen dot-grid">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-signal/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-signal/10 border border-signal/20 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse" />
            <span className="text-signal text-sm font-body">Smart Lost & Found System</span>
          </div>

          <h1 className="font-display font-800 text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-6">
            Never lose your
            <br />
            <span className="text-signal">belongings</span> again
          </h1>

          <p className="max-w-xl mx-auto text-lg text-white/50 font-body leading-relaxed mb-10">
            Register items, generate QR codes, and receive instant anonymous notifications when a finder scans your tag.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-base px-8 py-4 glow-signal">
                  Go to Dashboard →
                </Link>
                <Link to="/items/add" className="btn-ghost text-base px-8 py-4">
                  Register an Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-4 glow-signal">
                  Start for Free →
                </Link>
                <Link to="/login" className="btn-ghost text-base px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mock QR card */}
        <div className="mt-16 flex justify-center animate-fade-in">
          <div className="relative w-48 h-48 bg-ink-800 border border-white/8 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="grid grid-cols-5 gap-1 p-4 opacity-60">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.4 ? 'bg-signal' : 'bg-transparent'}`} />
              ))}
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-[9px] font-mono text-white/30 tracking-widest">LOSTLINK</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-700 text-3xl sm:text-4xl text-white mb-4">How LostLink works</h2>
          <p className="text-white/40 font-body max-w-md mx-auto">Four simple steps to protect everything you own</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-6 hover:border-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 bg-signal/10 border border-signal/20 rounded-2xl flex items-center justify-center text-xl mb-5 group-hover:bg-signal/15 transition-colors">
                {f.icon}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-signal/60">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display font-600 text-white">{f.title}</h3>
              </div>
              <p className="text-sm font-body text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="card p-8 sm:p-12 text-center">
          <h2 className="font-display font-700 text-2xl text-white mb-3">Protect anything that matters</h2>
          <p className="text-white/40 font-body mb-8">From everyday items to irreplaceable possessions</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {CATEGORIES.map(cat => (
              <span key={cat} className="px-4 py-2 bg-white/4 border border-white/6 rounded-xl text-sm font-body text-white/50 hover:text-white/70 hover:border-white/12 transition-all cursor-default">
                {cat}
              </span>
            ))}
          </div>

          {!user && (
            <div className="mt-10">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base glow-signal inline-block">
                Create your free account →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
