import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow, adminInput } from './ui';
import { carTitle, dateTime, INQUIRY_STATUS_LABELS, INQUIRY_STATUSES } from '../../lib/format';

// Customer inquiries: list, read, reply and update status
export default function Inquiries() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const selectedId = params.get('id') || '';
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setItems(null);
    api
      .get('/admin/inquiries', { params: status ? { status } : {} })
      .then((r) => setItems(r.data.items))
      .catch((e) => setError(e.message));
  }, [status, reload]);

  const select = (id) => {
    const next = new URLSearchParams(params);
    if (id) next.set('id', id);
    else next.delete('id');
    setParams(next);
  };

  const setStatusFilter = (s) => {
    const next = new URLSearchParams(params);
    if (s) next.set('status', s);
    else next.delete('status');
    next.delete('id');
    setParams(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inquiries" subtitle="Questions from shoppers about specific cars. Reply here and the customer sees it in their account." />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {['', ...INQUIRY_STATUSES].map((s) => (
          <button key={s || 'all'} role="tab" aria-selected={status === s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-2 text-sm ${status === s ? 'bg-black text-white' : 'bg-white ring-1 ring-line'}`}>
            {s ? INQUIRY_STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}
      {!items && !error && <Spinner />}

      {items && (
        <div className={`grid gap-6 ${selectedId ? 'xl:grid-cols-[1fr_1fr]' : ''}`}>
          <Panel>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50"><tr><Th>From</Th><Th>Car</Th><Th>Received</Th><Th>Status</Th></tr></thead>
                <tbody className="divide-y divide-line">
                  {items.length === 0 && <EmptyRow colSpan={4}>No inquiries here.</EmptyRow>}
                  {items.map((i) => (
                    <tr key={i._id} onClick={() => select(i._id)} className={`cursor-pointer hover:bg-neutral-50 ${selectedId === i._id ? 'bg-neutral-100' : ''}`}>
                      <Td><p className="font-medium">{i.name}</p><p className="text-xs text-neutral-500">{i.email}</p></Td>
                      <Td className="text-sm">{i.car ? carTitle(i.car) : 'Removed'}</Td>
                      <Td className="text-sm text-neutral-500">{dateTime(i.createdAt)}</Td>
                      <Td><StatusBadge status={i.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {selectedId && (
            <InquiryDetail id={selectedId} onClose={() => select('')} onChanged={() => setReload((n) => n + 1)} />
          )}
        </div>
      )}
    </div>
  );
}

function InquiryDetail({ id, onClose, onChanged }) {
  const toast = useToast();
  const [req, setReq] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setReq(null);
    api.get(`/admin/inquiries/${id}`).then((r) => setReq(r.data.request)).catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!req) return <Spinner />;

  const sendReply = async (e) => {
    e.preventDefault();
    if (reply.trim().length < 2) return toast.error('Write a reply first');
    setSending(true);
    try {
      const { data } = await api.post(`/admin/inquiries/${id}/reply`, { message: reply.trim() });
      setReq(data.request);
      setReply('');
      toast.success('Reply sent to the customer');
      onChanged();
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    try {
      const { data } = await api.put(`/admin/inquiries/${id}/status`, { status });
      setReq(data.request);
      onChanged();
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  return (
    <Panel className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={onClose} className="btn-ghost !px-0 text-xs text-neutral-500"><ArrowLeft size={14} /> Close</button>
          <h2 className="mt-2 text-lg font-semibold">{req.name}</h2>
          <p className="text-sm text-neutral-500">{req.email}{req.phone ? ` · ${req.phone}` : ''}</p>
          {req.car && (
            <Link to={`/cars/${req.car._id}`} className="mt-1 inline-block text-sm font-medium hover:underline">{carTitle(req.car)}</Link>
          )}
        </div>
        <select className={`${adminInput} !w-auto`} value={req.status} onChange={(e) => changeStatus(e.target.value)} aria-label="Inquiry status">
          {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{INQUIRY_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-neutral-50 p-4 text-sm">
        <p className="text-xs text-neutral-500">{dateTime(req.createdAt)}</p>
        <p className="mt-2 whitespace-pre-line">{req.message}</p>
      </div>

      {req.replies?.map((r) => (
        <div key={r._id || r.at} className="rounded-2xl border border-line p-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Showroom reply · {dateTime(r.at)}</p>
          <p className="mt-2 whitespace-pre-line">{r.message}</p>
        </div>
      ))}

      <form onSubmit={sendReply} className="space-y-3">
        <label className="label" htmlFor="reply">Reply to customer</label>
        <textarea id="reply" className={`${adminInput} min-h-28`} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Thanks for your interest…" />
        <button className="btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send reply'}</button>
      </form>
    </Panel>
  );
}
