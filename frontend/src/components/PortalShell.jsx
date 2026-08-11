import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import { FileText, History, LogOut, Search, Bell, Menu, User, Settings, FileCheck2, ShieldCheck, Database, Key } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Seal from './Seal';
import { useNotifications } from '../context/NotificationContext';

const NAV_STRUCTURE = {
  lawyer: [
    { section: 'Workspace', items: [
      { to: '/lawyer', label: 'My Documents', icon: FileText },
      { to: '/lawyer/audit', label: 'Ledger Audit', icon: History },
    ]},
  ],
  judge: [
    { section: 'Review & Verification', items: [
      { to: '/judge', label: 'Verification Queue', icon: FileCheck2 },
      { to: '/judge/audit', label: 'Ledger Audit', icon: History },
    ]},
  ],
  admin: [
    { section: 'Administration', items: [
      { to: '/admin', label: 'Infrastructure Status', icon: Database },
      { to: '/admin/audit', label: 'Global Audit Log', icon: History },
    ]},
  ],
  client: [
    { section: 'Accessible Records', items: [
      { to: '/client', label: 'Shared With Me', icon: FileText },
      { to: '/client/audit', label: 'Record Audit Trail', icon: History },
    ]},
  ],
};

const ROLE_LABEL = {
  lawyer: 'Legal Counsel',
  judge: 'Hon. Court',
  admin: 'Registry Admin',
  client: 'Client Access',
};

const ROLE_ACCENT = {
  lawyer: { bar: 'bg-seal', badge: 'bg-seal/10 text-seal-dark border-seal/20', dot: 'bg-seal' },
  judge: { bar: 'bg-verified', badge: 'bg-verified-bg text-verified-dark border-verified/20', dot: 'bg-verified' },
  admin: { bar: 'bg-ink', badge: 'bg-ink/5 text-ink border-ink/10', dot: 'bg-ink' },
  client: { bar: 'bg-maroon', badge: 'bg-maroon/5 text-maroon-dark border-maroon/20', dot: 'bg-maroon' },
};

export default function PortalShell({ role, user, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const notifRef = useRef();
  const profileRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const sections = NAV_STRUCTURE[role] || [];
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.lawyer;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const auditPath = `/${role}/audit`;
    navigate(`${auditPath}?docId=${encodeURIComponent(q)}`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-paper-dim border-r border-line">
      <div className="h-16 flex items-center px-6 border-b border-line bg-white">
        <Seal status="verified" size={24} animate={false} />
        <span className="ml-2.5 font-display font-semibold text-lg tracking-tight text-ink">eVault</span>
      </div>

      <div className="px-5 py-4 border-b border-line bg-white">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate mb-1">Session Context</p>
        <div className={`flex items-center gap-2 text-sm font-medium px-2.5 py-1.5 rounded-md border ${accent.badge}`}>
          <ShieldCheck size={14} />
          {ROLE_LABEL[role]}
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6" aria-label="Portal navigation">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-light">{section.section}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-seal/30 ${
                      active
                        ? 'bg-ink text-white shadow-sm'
                        : 'text-slate hover:bg-slate/10 hover:text-ink'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-white' : 'text-slate-light'} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-line bg-white">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate hover:text-maroon hover:bg-maroon/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-maroon/20"
        >
          <LogOut size={16} /> Secure Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-dim flex flex-col md:flex-row font-body text-ink selection:bg-seal/20 selection:text-seal-dark">
      <aside className="hidden md:block w-[260px] shrink-0 z-20 shadow-sm relative">
        <div className={`absolute top-0 w-full h-1 z-10 ${accent.bar}`} />
        <SidebarContent />
      </aside>

      <header className="md:hidden flex items-center justify-between border-b border-line bg-white px-4 h-14 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Seal status="verified" size={20} animate={false} />
          <span className="font-display font-semibold text-base">eVault</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-slate hover:text-ink focus:outline-none focus:ring-2 focus:ring-seal/30 rounded"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={20} />
        </button>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-[260px] h-full bg-white shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <div className={`absolute top-0 w-full h-1 z-10 ${accent.bar}`} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate hover:text-ink z-50 bg-white/80 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-seal/30"
                aria-label="Close navigation menu"
              >
                ✕
              </button>
              <SidebarContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="hidden md:flex h-16 bg-white border-b border-line items-center justify-between px-8 sticky top-0 z-10">
          <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={16} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registry IDs, case references, or hashes..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-paper-dim border border-transparent rounded-md focus:bg-white focus:border-seal focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-seal/20 transition-all placeholder:text-slate-light"
                aria-label="Search registry"
              />
            </div>
          </form>

          <div className="flex items-center gap-5 ml-6">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-full transition-all duration-300 ${notificationsOpen ? 'bg-seal text-white shadow-md scale-105' : 'text-slate hover:text-ink hover:bg-slate/10'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-maroon rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.9, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ transformPerspective: 800 }}
                    className="absolute top-full mt-3 right-0 w-80 bg-white border border-line rounded-xl shadow-2xl z-50 overflow-hidden origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-line flex justify-between items-center bg-[#FAFAFA]">
                      <span className="text-sm font-semibold text-ink">System Alerts</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAllAsRead()} 
                          className="text-xs font-medium text-slate hover:text-ink transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate text-sm">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} className={`p-4 border-b border-line last:border-b-0 hover:bg-[#FAFAFA] transition-colors ${!n.read ? 'bg-seal/5 cursor-pointer' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-xs font-bold ${!n.read ? 'text-ink' : 'text-slate'}`}>{n.title}</span>
                              <span className="text-[10px] text-slate font-medium whitespace-nowrap ml-2">
                                {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-xs text-slate">{n.desc}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-line" />

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-3 p-1.5 pr-3 rounded-md transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-seal/30 ${profileOpen ? 'bg-slate/10 shadow-inner' : 'hover:bg-slate/5'}`}
                aria-expanded={profileOpen}
                aria-label="Account menu"
              >
                <div className="h-8 w-8 rounded-md bg-ink flex items-center justify-center text-white font-medium text-sm shadow-sm">
                  {user?.name?.charAt(0) || <User size={16} />}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-ink leading-none mb-1">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate font-mono">{user?.id || 'ID Unknown'}</p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-3 right-0 w-64 bg-white border border-line rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-line bg-paper-dim/50">
                      <p className="text-sm font-semibold text-ink">{user?.name}</p>
                      <p className="text-xs text-slate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-slate bg-white border border-line px-2 py-1 rounded-md inline-flex">
                        <Key size={10} /> {user?.id}
                      </div>
                    </div>
                    <div className="p-1">
                      <button type="button" onClick={() => toast.info('Account settings are managed via the central identity provider.')} className="w-full text-left px-3 py-2 text-sm text-slate hover:bg-paper-dim hover:text-ink rounded-md flex items-center gap-2 transition-colors">
                        <Settings size={14} /> Account Settings
                      </button>
                      <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-maroon hover:bg-maroon/5 rounded-md flex items-center gap-2 transition-colors mt-1">
                        <LogOut size={14} /> Secure Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-paper-dim p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-w-[1400px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
