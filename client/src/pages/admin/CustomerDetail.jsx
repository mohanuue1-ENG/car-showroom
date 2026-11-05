import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow } from './ui';
import { carTitle, dateOnly, dateTime } from '../../lib/format';

export default function CustomerDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`/admin/customers/${id}`).then((r) => setData(r.data)).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleActive = async () => {
    const next = !data.customer.isActive;
    if (!window.confirm(next ? 'Re-enable this account?' : 'Disable this account? The customer will not be able to log in.')) return;
    setSaving(true);
    try {
      await api.put(`/admin/customers/${id}`, { isActive: next });
      toast.success(next ? 'Account enabled' : 'Account disabled');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner />;

  const { customer, inquiries, testDrives } = data;

  return (
    <div className="space-y-6">
      <Link to="/admin/customers" className="btn-ghost !px-0 text-neutral-500"><ArrowLeft size={16} /> All customers</Link>
      <PageHeader
        title={customer.name}
        subtitle={`Customer since ${dateOnly(customer.createdAt)}`}
        action={
          <button onClick={toggleActive} disabled={saving} className={customer.isActive ? 'btn-secondary' : 'btn-primary'}>
            {customer.isActive ? 'Disable account' : 'Enable account'}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="space-y-3 p-6 text-sm">
          <h2 className="font-semibold">Contact</h2>
          <p>{customer.email}</p>
          <p className="text-neutral-600">{customer.phone || 'No phone number'}</p>
          <p className="pt-2">Status: <span className={customer.isActive ? 'text-emerald-700' : 'text-red-600'}>{customer.isActive ? 'Active' : 'Disabled'}</span></p>
        </Panel>
        <Panel className="p-6">
          <p className="text-sm text-neutral-500">Inquiries</p>
          <p className="mt-2 text-3xl font-semibold">{inquiries.length}</p>
        </Panel>
        <Panel className="p-6">
          <p className="text-sm text-neutral-500">Test drive requests</p>
          <p className="mt-2 text-3xl font-semibold">{testDrives.length}</p>
        </Panel>
      </div>

      <Panel>
        <div className="border-b border-line px-6 py-4 font-semibold">Inquiries</div>
        <table className="w-full">
          <thead className="bg-neutral-50"><tr><Th>Car</Th><Th>Message</Th><Th>Sent</Th><Th>Status</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {inquiries.length === 0 && <EmptyRow colSpan={4}>No inquiries.</EmptyRow>}
            {inquiries.map((i) => (
              <tr key={i._id}>
                <Td className="text-sm">{i.car ? carTitle(i.car) : 'Removed'}</Td>
                <Td className="max-w-md text-sm text-neutral-600">{i.message}</Td>
                <Td className="text-sm text-neutral-500">{dateTime(i.createdAt)}</Td>
                <Td><StatusBadge status={i.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel>
        <div className="border-b border-line px-6 py-4 font-semibold">Test drive requests</div>
        <table className="w-full">
          <thead className="bg-neutral-50"><tr><Th>Car</Th><Th>Preferred</Th><Th>Status</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {testDrives.length === 0 && <EmptyRow colSpan={3}>No test drives.</EmptyRow>}
            {testDrives.map((t) => (
              <tr key={t._id}>
                <Td className="text-sm">{t.car ? carTitle(t.car) : 'Removed'}</Td>
                <Td className="text-sm">{dateOnly(t.preferredDate)}{t.preferredTime ? `, ${t.preferredTime}` : ''}</Td>
                <Td><StatusBadge status={t.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
