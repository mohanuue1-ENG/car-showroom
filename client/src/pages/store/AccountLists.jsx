import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import CarCard from '../../components/CarCard';
import { AccountTabs } from './AccountProfile';
import { carTitle, dateTime } from '../../lib/format';

// Shared loader for the three customer lists
function useList(url, pick) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(url).then((r) => setItems(pick(r.data))).catch((e) => setError(e.message));
  }, [url, pick]);
  return { items, error };
}

const byItems = (d) => d.items;

export function AccountInquiries() {
  const { items, error } = useList('/me/inquiries', byItems);
  return (
    <div>
      <AccountTabs />
      <h1 className="section-title mb-8">My inquiries</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && <Empty text="You have not contacted a seller yet." to="/cars" cta="Browse cars" />}
      {items && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i._id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <Link to={`/cars/${i.car?._id}`} className="font-medium hover:underline">{i.car ? carTitle(i.car) : 'Vehicle removed'}</Link>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{i.message}</p>
                <p className="mt-2 text-xs text-neutral-500">Sent {dateTime(i.createdAt)}</p>
                {i.replies?.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Reply from the showroom</p>
                    <p className="mt-1 whitespace-pre-line">{i.replies[i.replies.length - 1].message}</p>
                  </div>
                )}
              </div>
              <StatusBadge status={i.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AccountTestDrives() {
  const { items, error } = useList('/me/test-drives', byItems);
  return (
    <div>
      <AccountTabs />
      <h1 className="section-title mb-8">Test drive requests</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && <Empty text="No test drives booked yet." to="/cars" cta="Find a car to test drive" />}
      {items && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((t) => (
            <li key={t._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <Link to={`/cars/${t.car?._id}`} className="font-medium hover:underline">{t.car ? carTitle(t.car) : 'Vehicle removed'}</Link>
                <p className="mt-1 text-sm text-neutral-600">
                  Preferred: {new Date(t.preferredDate).toLocaleDateString('en-US', { dateStyle: 'medium' })} at {t.preferredTime || 'any time'}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AccountRecent() {
  const { items, error } = useList('/me/recently-viewed', byItems);
  return (
    <div>
      <AccountTabs />
      <h1 className="section-title mb-8">Recently viewed</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && <Empty text="Cars you open will appear here." to="/cars" cta="Browse cars" />}
      {items && items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((car) => <CarCard key={car._id} car={car} />)}
        </div>
      )}
    </div>
  );
}

function Empty({ text, to, cta }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white py-20 text-center">
      <p className="font-medium">{text}</p>
      <Link to={to} className="btn-primary mt-6">{cta}</Link>
    </div>
  );
}
