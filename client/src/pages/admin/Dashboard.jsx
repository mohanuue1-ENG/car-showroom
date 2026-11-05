import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import { ErrorBox, PageHeader } from './ui';
import { dateTime, money } from '../../lib/format';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner label="Loading dashboard…" />;

  const stats = [
    { label: 'Total cars', value: data.totalCars },
    { label: 'Available', value: data.availableCars },
    { label: 'Sold', value: data.soldCars },
    { label: 'Customers', value: data.totalCustomers },
    { label: 'Inquiries', value: data.totalInquiries },
    { label: 'Revenue (sold)', value: money(data.totalRevenue) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="Showroom activity at a glance." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/inquiries?status=new" className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 hover:bg-neutral-50">
          <span className="font-medium">New inquiries to answer</span>
          <span className="text-2xl font-semibold">{data.newInquiries}</span>
        </Link>
        <Link to="/admin/test-drives?status=requested" className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 hover:bg-neutral-50">
          <span className="font-medium">Test drives awaiting confirmation</span>
          <span className="text-2xl font-semibold">{data.pendingTestDrives}</span>
        </Link>
      </div>

      <section className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-4 font-semibold">Recent activities</div>
        {data.recentActivities.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.recentActivities.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 text-sm">
                <span>{a.message}</span>
                <span className="text-xs text-neutral-500">{dateTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
