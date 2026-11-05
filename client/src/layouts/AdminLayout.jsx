import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, Boxes, CalendarCheck, Car, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, Tag, User, Users, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import { useSettings, DEFAULT_SETTINGS } from '../hooks/useSettings';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/cars', label: 'Cars', icon: Car },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/admin/test-drives', label: 'Test drives', icon: CalendarCheck },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/reports', label: 'Sales reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Showroom settings', icon: Settings },
  { to: '/admin/profile', label: 'My profile', icon: User },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const settings = useSettings() || DEFAULT_SETTINGS;
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState({ items: [], count: 0 });
  const notifRef = useRef(null);
  const toast = useToast();

  useEffect(() => setOpen(false), [location.pathname]);

  // Refresh the notification bell when the page changes
  useEffect(() => {
    api
      .get('/admin/notifications')
      .then((r) => setNotifications(r.data))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => notifRef.current && !notifRef.current.contains(e.target) && setNotifOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out');
    navigate('/admin/login');
  };

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Admin">
      <div className="mb-6 px-3 pt-2">
        <p className="text-lg font-semibold text-white">{settings.storeName}</p>
        <p className="text-xs uppercase tracking-wide text-neutral-500">Admin</p>
      </div>
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
              isActive ? 'bg-white text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} /> Log out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-black lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-black shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-full p-2 hover:bg-black/5 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <p className="text-sm text-neutral-500">
              Signed in as <span className="font-medium text-ink">{user?.name}</span>
            </p>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative rounded-full p-2 hover:bg-black/5"
              aria-label={`Notifications, ${notifications.count} new`}
            >
              <Bell size={20} />
              {notifications.count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                  {notifications.count}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
                <p className="border-b border-line px-4 py-3 text-sm font-semibold">Notifications</p>
                {notifications.items.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-neutral-500">You are all caught up.</p>
                ) : (
                  notifications.items.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(n.link);
                      }}
                      className="block w-full border-b border-line px-4 py-3 text-left text-sm last:border-0 hover:bg-black/5"
                    >
                      {n.message}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
