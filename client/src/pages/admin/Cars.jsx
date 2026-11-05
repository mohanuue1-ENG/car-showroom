import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow } from './ui';
import { money, mileage, carTitle } from '../../lib/format';
import { PLACEHOLDER_CAR_IMAGE } from '../../lib/media';

export default function AdminCars() {
  const toast = useToast();
  const [cars, setCars] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    setError('');
    return api
      .get('/admin/cars', { params: status ? { status } : {} })
      .then((r) => setCars(r.data.items))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    setCars(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const visible = useMemo(() => {
    if (!cars) return [];
    const term = q.trim().toLowerCase();
    return term ? cars.filter((c) => carTitle(c).toLowerCase().includes(term)) : cars;
  }, [cars, q]);

  const remove = async (car) => {
    if (!window.confirm(`Delete ${carTitle(car)} from the showroom? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/cars/${car._id}`);
      toast.success('Car deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cars"
        subtitle="Add vehicles, update prices and specifications, and mark cars as sold."
        action={<Link to="/admin/cars/new" className="btn-primary !py-2.5"><Plus size={16} /> Add car</Link>}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input className="input !py-2.5 pl-10" placeholder="Search make or model" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input !w-auto !py-2.5" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by availability">
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {error && <ErrorBox message={error} />}
      {!cars && !error && <Spinner />}

      {cars && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr><Th>Car</Th><Th>Specs</Th><Th>Price</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.length === 0 && <EmptyRow colSpan={5}>No cars match these filters.</EmptyRow>}
                {visible.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img src={c.images?.[0] || PLACEHOLDER_CAR_IMAGE} alt="" className="h-12 w-16 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium">{carTitle(c)}</p>
                          <p className="text-xs text-neutral-500">{c.category?.name || 'Uncategorised'} · {c.condition === 'new' ? 'New' : 'Used'}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-sm text-neutral-600">{mileage(c.mileage)} · {c.fuel} · {c.transmission}</Td>
                    <Td className="font-medium">{money(c.price)}</Td>
                    <Td>
                      <StatusBadge status={c.status} />
                      {c.isFeatured && <span className="ml-2 text-xs text-neutral-500">Featured</span>}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/cars/${c._id}`} className="btn-ghost !px-3" aria-label={`Edit ${carTitle(c)}`}><Pencil size={16} /></Link>
                        <button onClick={() => remove(c)} className="btn-ghost !px-3 text-red-600 hover:bg-red-50" aria-label={`Delete ${carTitle(c)}`}>
                          <Trash2 size={16} />
                        </button>
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
