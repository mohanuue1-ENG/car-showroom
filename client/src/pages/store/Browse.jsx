import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../../lib/api';
import CarCard from '../../components/CarCard';
import Spinner from '../../components/Spinner';
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../../lib/format';

// Browse tabs map to query presets on the same endpoint
const VIEWS = [
  { value: 'all', label: 'All cars', preset: {} },
  { value: 'new', label: 'New cars', preset: { condition: 'new' } },
  { value: 'used', label: 'Used cars', preset: { condition: 'used' } },
  { value: 'featured', label: 'Featured', preset: { featured: 'true' } },
  { value: 'recent', label: 'Recently added', preset: { sort: 'newest' } },
  { value: 'popular', label: 'Popular', preset: { sort: 'popular' } },
];

const SORTS = [
  { value: 'newest', label: 'Newest listed' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'year-desc', label: 'Year: newest' },
  { value: 'mileage-asc', label: 'Mileage: lowest' },
  { value: 'popular', label: 'Most viewed' },
];

const FILTER_KEYS = ['q', 'make', 'model', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'maxMileage', 'transmission', 'fuel', 'bodyType', 'condition', 'category'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState(params.get('q') || '');

  const view = params.get('view') || 'all';
  const sort = params.get('sort') || (view === 'recent' ? 'newest' : view === 'popular' ? 'popular' : 'newest');
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => setQ(params.get('q') || ''), [params]);

  // Fetch whenever the URL changes
  useEffect(() => {
    setData(null);
    setError('');
    const query = { sort, page, limit: 12 };
    const preset = VIEWS.find((v) => v.value === view)?.preset || {};
    Object.assign(query, preset);
    FILTER_KEYS.forEach((k) => params.get(k) && (query[k] = params.get(k)));
    if (params.get('sort')) query.sort = params.get('sort');
    api
      .get('/cars', { params: query })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [params, view, sort, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (view !== 'all') next.set('view', view);
    setParams(next);
  };

  const activeFilters = FILTER_KEYS.some((k) => params.get(k));
  const title = params.get('q') ? `Results for “${params.get('q')}”` : VIEWS.find((v) => v.value === view)?.label || 'Browse cars';

  const filters = (
    <div className="space-y-7">
      <form onSubmit={(e) => { e.preventDefault(); update({ q: q.trim() }); }}>
        <label className="label" htmlFor="car-search">Search</label>
        <input id="car-search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Make, model, keyword" />
      </form>

      <Select label="Brand" value={params.get('make') || ''} onChange={(v) => update({ make: v })}>
        <option value="">Any brand</option>
        {['Audi', 'BMW', 'Ferrari', 'Ford', 'Jeep', 'Land Rover', 'Mercedes-Benz', 'Mercedes-AMG', 'McLaren', 'Porsche', 'Toyota', 'Chevrolet', 'Demo EV'].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </Select>

      <div>
        <label className="label" htmlFor="car-model">Model</label>
        <input id="car-model" className="input" key={`m-${params.get('model')}`} defaultValue={params.get('model') || ''} onBlur={(e) => e.target.value !== (params.get('model') || '') && update({ model: e.target.value.trim() })} placeholder="e.g. Q7" />
      </div>

      <RangeInputs label="Price (USD)" minKey="minPrice" maxKey="maxPrice" params={params} update={update} step={1000} />
      <RangeInputs label="Model year" minKey="minYear" maxKey="maxYear" params={params} update={update} step={1} />

      <div>
        <label className="label" htmlFor="max-mileage">Maximum mileage</label>
        <input id="max-mileage" type="number" min="0" step="1000" className="input" key={`mi-${params.get('maxMileage')}`} defaultValue={params.get('maxMileage') || ''} onBlur={(e) => e.target.value !== (params.get('maxMileage') || '') && update({ maxMileage: e.target.value })} placeholder="Any" />
      </div>

      <Select label="Vehicle condition" value={params.get('condition') || ''} onChange={(v) => update({ condition: v })}>
        <option value="">New and used</option>
        <option value="new">New</option>
        <option value="used">Used</option>
      </Select>
      <Select label="Body type" value={params.get('bodyType') || ''} onChange={(v) => update({ bodyType: v })}>
        <option value="">Any body</option>
        {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
      </Select>
      <Select label="Fuel type" value={params.get('fuel') || ''} onChange={(v) => update({ fuel: v })}>
        <option value="">Any fuel</option>
        {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
      </Select>
      <Select label="Transmission" value={params.get('transmission') || ''} onChange={(v) => update({ transmission: v })}>
        <option value="">Any transmission</option>
        {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
      </Select>
      <Select label="Category" value={params.get('category') || ''} onChange={(v) => update({ category: v })}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
      </Select>

      {activeFilters && <button className="btn-ghost !px-0 text-neutral-500" onClick={clearFilters}>Clear all filters</button>}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">{filters}</aside>

      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Browse views">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              role="tab"
              aria-selected={view === v.value}
              onClick={() => { const next = new URLSearchParams(); if (v.value !== 'all') next.set('view', v.value); setParams(next); }}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${view === v.value ? 'bg-black text-white' : 'bg-white ring-1 ring-line hover:text-ink'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">{title}</h1>
            {data && <p className="mt-1 text-sm text-neutral-500">{data.total} vehicle{data.total === 1 ? '' : 's'}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary !py-2 lg:hidden" onClick={() => setDrawer(true)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value })} className="input !w-auto !rounded-full !py-2.5">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {!data && !error && <Spinner label="Loading vehicles…" />}
        {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        {data && data.items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-line bg-white py-20 text-center">
            <p className="font-medium">No cars match these filters.</p>
            <p className="mt-1 text-sm text-neutral-500">Try widening the price range or clearing filters.</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((car) => <CarCard key={car._id} car={car} />)}
            </div>
            {data.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button className="btn-secondary !py-2" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>Previous</button>
                <span className="text-sm text-neutral-500">Page {data.page} of {data.pages}</span>
                <button className="btn-secondary !py-2" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setDrawer(false)} aria-label="Close filters"><X size={20} /></button>
            </div>
            {filters}
            <button className="btn-primary mt-8 w-full" onClick={() => setDrawer(false)}>Show results</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  );
}

function RangeInputs({ label, minKey, maxKey, params, update, step }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min="0" step={step} className="input" placeholder="Min" aria-label={`${label} minimum`}
          key={`${minKey}-${params.get(minKey)}`} defaultValue={params.get(minKey) || ''}
          onBlur={(e) => e.target.value !== (params.get(minKey) || '') && update({ [minKey]: e.target.value })} />
        <input type="number" min="0" step={step} className="input" placeholder="Max" aria-label={`${label} maximum`}
          key={`${maxKey}-${params.get(maxKey)}`} defaultValue={params.get(maxKey) || ''}
          onBlur={(e) => e.target.value !== (params.get(maxKey) || '') && update({ [maxKey]: e.target.value })} />
      </div>
    </div>
  );
}
