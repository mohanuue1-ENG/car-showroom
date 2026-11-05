import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow, adminInput } from './ui';
import { carTitle, mileage } from '../../lib/format';
import { PLACEHOLDER_CAR_IMAGE } from '../../lib/media';

// Inventory: availability and price overview with quick edits
export default function Inventory() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = () =>
    api
      .get('/admin/inventory')
      .then((r) => {
        setItems(r.data.items);
        setSummary(r.data.summary);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const count = (status) => summary.filter((s) => s._id.status === status).reduce((n, s) => n + s.count, 0);

  const save = async (car, field) => {
    const raw = drafts[`${car._id}:${field}`];
    const value = field === 'price' ? Number(raw) : raw;
    if (field === 'price' && (!Number.isFinite(value) || value < 0)) return toast.error('Enter a valid price');
    setSavingId(car._id);
    try {
      await api.put(`/admin/cars/${car._id}`, { [field]: value });
      toast.success(`${carTitle(car)} updated`);
      setDrafts((d) => {
        const next = { ...d };
        delete next[`${car._id}:${field}`];
        return next;
      });
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" subtitle="Availability and pricing across every listing." />

      <div className="grid grid-cols-3 gap-4">
        {[['Available', count('available')], ['Reserved', count('reserved')], ['Sold', count('sold')]].map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>

      {error && <ErrorBox message={error} />}
      {!items && !error && <Spinner />}

      {items && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr><Th>Car</Th><Th>Mileage</Th><Th>Status</Th><Th>Price (USD)</Th><Th>Views</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.length === 0 && <EmptyRow colSpan={5}>No cars in inventory.</EmptyRow>}
                {items.map((c) => {
                  const priceKey = `${c._id}:price`;
                  const statusKey = `${c._id}:status`;
                  return (
                    <tr key={c._id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <img src={c.images?.[0] || PLACEHOLDER_CAR_IMAGE} alt="" className="h-10 w-14 rounded-lg object-cover" />
                          <span className="font-medium">{carTitle(c)}</span>
                        </div>
                      </Td>
                      <Td className="text-sm text-neutral-600">{mileage(c.mileage)}</Td>
                      <Td>
                        {c.status === 'sold' ? (
                          <StatusBadge status="sold" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <select className={`${adminInput} !w-auto !py-1.5 text-sm`} aria-label={`Status for ${carTitle(c)}`}
                              value={drafts[statusKey] ?? c.status}
                              onChange={(e) => setDrafts((d) => ({ ...d, [statusKey]: e.target.value }))}>
                              <option value="available">Available</option>
                              <option value="reserved">Reserved</option>
                            </select>
                            {drafts[statusKey] && drafts[statusKey] !== c.status && (
                              <button className="btn-secondary !py-1 text-xs" disabled={savingId === c._id} onClick={() => save(c, 'status')}>Save</button>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td>
                        {c.status === 'sold' ? (
                          <span className="text-sm text-neutral-500">Sold</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" step="100" aria-label={`Price for ${carTitle(c)}`} className={`${adminInput} !w-32 !py-1.5`}
                              value={drafts[priceKey] ?? c.price}
                              onChange={(e) => setDrafts((d) => ({ ...d, [priceKey]: e.target.value }))} />
                            {drafts[priceKey] !== undefined && Number(drafts[priceKey]) !== c.price && (
                              <button className="btn-secondary !py-1 text-xs" disabled={savingId === c._id} onClick={() => save(c, 'price')}>Save</button>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td className="text-sm text-neutral-600">{c.views}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {items && <p className="text-xs text-neutral-500">Sold cars keep their final sale price in the reports. Use the car page to mark a car as sold.</p>}
    </div>
  );
}
