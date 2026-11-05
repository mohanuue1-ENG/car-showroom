import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow } from './ui';
import { dateOnly } from '../../lib/format';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/admin/customers').then((r) => setCustomers(r.data.items)).catch((e) => setError(e.message));
  }, []);

  const visible = useMemo(() => {
    if (!customers) return [];
    const term = q.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(term) || c.email.includes(term));
  }, [customers, q]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle={customers ? `${customers.length} registered customer(s)` : 'Registered buyers'} />
      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input className="input !py-2.5 pl-10" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <ErrorBox message={error} />}
      {!customers && !error && <Spinner />}

      {customers && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr><Th>Customer</Th><Th>Joined</Th><Th>Inquiries & test drives</Th><Th>Account</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.length === 0 && <EmptyRow colSpan={4}>No customers found.</EmptyRow>}
                {visible.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50">
                    <Td>
                      <Link to={`/admin/customers/${c._id}`} className="font-medium hover:underline">{c.name}</Link>
                      <p className="text-xs text-neutral-500">{c.email}</p>
                    </Td>
                    <Td className="text-neutral-500">{dateOnly(c.createdAt)}</Td>
                    <Td>{c.requestCount}</Td>
                    <Td>
                      <span className={`rounded-full px-2.5 py-1 text-xs ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
