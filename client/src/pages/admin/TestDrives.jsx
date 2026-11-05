import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow } from './ui';
import { carTitle, dateTime, TEST_DRIVE_STATUS_LABELS, TEST_DRIVE_STATUSES } from '../../lib/format';

// Test drive requests with confirm / complete / cancel actions
export default function TestDrives() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setItems(null);
    api
      .get('/admin/test-drives', { params: status ? { status } : {} })
      .then((r) => setItems(r.data.items))
      .catch((e) => setError(e.message));
  }, [status, reload]);

  const setStatus = async (id, next) => {
    try {
      await api.put(`/admin/inquiries/${id}/status`, { status: next });
      toast.success(`Test drive ${TEST_DRIVE_STATUS_LABELS[next].toLowerCase()}`);
      setReload((n) => n + 1);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const setFilter = (s) => {
    const next = new URLSearchParams();
    if (s) next.set('status', s);
    setParams(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Test drive requests" subtitle="Confirm slots, mark drives as completed, or cancel." />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {['', ...TEST_DRIVE_STATUSES].map((s) => (
          <button key={s || 'all'} role="tab" aria-selected={status === s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm ${status === s ? 'bg-black text-white' : 'bg-white ring-1 ring-line'}`}>
            {s ? TEST_DRIVE_STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}
      {!items && !error && <Spinner />}

      {items && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr><Th>Customer</Th><Th>Car</Th><Th>Preferred slot</Th><Th>Requested</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.length === 0 && <EmptyRow colSpan={6}>No test drive requests here.</EmptyRow>}
                {items.map((t) => (
                  <tr key={t._id} className="hover:bg-neutral-50">
                    <Td>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-neutral-500">{t.email}{t.phone ? ` · ${t.phone}` : ''}</p>
                      {t.message && <p className="mt-1 max-w-xs text-xs text-neutral-600">“{t.message}”</p>}
                    </Td>
                    <Td className="text-sm">{t.car ? <Link to={`/cars/${t.car._id}`} className="hover:underline">{carTitle(t.car)}</Link> : 'Removed'}</Td>
                    <Td className="text-sm">{new Date(t.preferredDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}{t.preferredTime ? `, ${t.preferredTime}` : ''}</Td>
                    <Td className="text-sm text-neutral-500">{dateTime(t.createdAt)}</Td>
                    <Td><StatusBadge status={t.status} /></Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'requested' && <button className="btn-secondary !py-1.5 text-xs" onClick={() => setStatus(t._id, 'confirmed')}>Confirm</button>}
                        {t.status === 'confirmed' && <button className="btn-secondary !py-1.5 text-xs" onClick={() => setStatus(t._id, 'completed')}>Completed</button>}
                        {['requested', 'confirmed'].includes(t.status) && <button className="btn-ghost !py-1.5 text-xs text-red-600" onClick={() => setStatus(t._id, 'cancelled')}>Cancel</button>}
                      </div>
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
