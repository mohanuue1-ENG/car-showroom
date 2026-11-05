import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings, DEFAULT_SETTINGS } from '../hooks/useSettings';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/cars', label: 'Browse Cars' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, wishlistIds } = useAuth();
  const settings = useSettings() || DEFAULT_SETTINGS;
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/cars?q=${encodeURIComponent(q)}` : '/cars');
    setQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const iconBtn = 'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/5';

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            className={`${iconBtn} lg:hidden`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="text-xl font-semibold tracking-tight">
            {settings.showroomName}
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                  isActive ? 'bg-black text-white' : 'text-neutral-600 hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-1">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Make, model…"
                aria-label="Search cars"
                className="input w-36 py-2 sm:w-56"
              />
              <button type="button" className={iconBtn} onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} />
              </button>
            </form>
          ) : (
            <button className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={19} />
            </button>
          )}

          <Link to="/wishlist" className={iconBtn} aria-label={`Wishlist, ${user ? wishlistIds.size : 0} saved`}>
            <Heart size={19} />
            {user && wishlistIds.size > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold text-white">
                {wishlistIds.size}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative ml-1" ref={accountRef}>
              <button className={iconBtn} onClick={() => setAccountOpen((o) => !o)} aria-label="Account menu" aria-expanded={accountOpen}>
                <User size={19} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-xl">
                  <p className="px-4 pb-1 text-xs text-neutral-500">Signed in as</p>
                  <p className="truncate px-4 pb-2 text-sm font-medium">{user.name}</p>
                  <hr className="border-line" />
                  <Link to="/account" className="block px-4 py-2 text-sm hover:bg-black/5">My profile</Link>
                  <Link to="/account/inquiries" className="block px-4 py-2 text-sm hover:bg-black/5">My inquiries</Link>
                  <Link to="/account/test-drives" className="block px-4 py-2 text-sm hover:bg-black/5">Test drive requests</Link>
                  <Link to="/account/recent" className="block px-4 py-2 text-sm hover:bg-black/5">Recently viewed</Link>
                  {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-black/5">Admin dashboard</Link>}
                  <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5">Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-secondary ml-1 hidden !px-4 !py-2 sm:inline-flex">Login / Register</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `block rounded-xl px-4 py-3 text-sm ${isActive ? 'bg-black text-white' : 'hover:bg-black/5'}`}
            >
              {l.label}
            </NavLink>
          ))}
          {!user && (
            <Link to="/login" className="mt-2 block rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5">Login / Register</Link>
          )}
        </nav>
      )}
    </header>
  );
}
