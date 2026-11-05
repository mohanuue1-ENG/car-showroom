import { NavLink } from 'react-router-dom';
import ProfileForm from '../../components/ProfileForm';
import { useAuth } from '../../context/AuthContext';

export default function AccountProfile() {
  const { user } = useAuth();
  return (
    <div>
      <AccountTabs />
      <h1 className="section-title mb-2">My profile</h1>
      <p className="mb-8 text-neutral-600">Hello {user.name.split(' ')[0]}. Keep your details up to date.</p>
      <ProfileForm />
    </div>
  );
}

// Sub-navigation shared by the customer account pages
export function AccountTabs() {
  const tabs = [
    { to: '/account', label: 'Profile', end: true },
    { to: '/account/inquiries', label: 'My inquiries' },
    { to: '/account/test-drives', label: 'Test drives' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/account/recent', label: 'Recently viewed' },
  ];
  return (
    <nav className="mb-8 flex gap-2 overflow-x-auto border-b border-line pb-px" aria-label="Account">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${
              isActive ? 'border-black font-medium text-ink' : 'border-transparent text-neutral-500 hover:text-ink'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
