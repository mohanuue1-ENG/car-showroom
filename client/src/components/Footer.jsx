import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useSettings, DEFAULT_SETTINGS } from '../hooks/useSettings';

export default function Footer() {
  const s = useSettings() || DEFAULT_SETTINGS;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="text-xl font-semibold text-white">{s.showroomName}</p>
          <p className="text-sm leading-relaxed text-neutral-400">{s.tagline}</p>
          <div className="flex gap-4 text-sm">
            <a href={s.socials?.instagram} className="hover:text-white">Instagram</a>
            <a href={s.socials?.facebook} className="hover:text-white">Facebook</a>
            <a href={s.socials?.twitter} className="hover:text-white">X</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Browse</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/cars" className="hover:text-white">All cars</Link></li>
            <li><Link to="/cars?condition=new" className="hover:text-white">New cars</Link></li>
            <li><Link to="/cars?condition=used" className="hover:text-white">Used cars</Link></li>
            <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Customer care</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sell" className="hover:text-white">Sell your car</Link></li>
            <li><Link to="/account/test-drives" className="hover:text-white">Test drive requests</Link></li>
            <li><Link to="/account/inquiries" className="hover:text-white">My inquiries</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Visit</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0" />{s.supportEmail}</li>
            {s.supportPhone && <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0" />{s.supportPhone}</li>}
            {s.address && <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0" />{s.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-neutral-500 sm:px-6">
          © {year} {s.showroomName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
