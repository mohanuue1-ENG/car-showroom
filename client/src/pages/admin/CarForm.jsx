import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Trash2, Upload } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import { ErrorBox, Field, PageHeader, Panel, adminInput } from './ui';
import { BODY_TYPES, CAR_STATUSES_FORM, FUEL_TYPES, TRANSMISSIONS, carTitle, money } from '../../lib/format';

const EMPTY = {
  make: '', model: '', year: new Date().getFullYear(), price: '', mileage: 0,
  fuel: 'Petrol', transmission: 'Automatic', bodyType: 'SUV', condition: 'used',
  category: '', engine: '', exteriorColor: '', interiorColor: '', vin: '', location: '',
  description: '', status: 'available', isFeatured: false,
};

export default function CarForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [carId, setCarId] = useState(isNew ? null : id);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [soldPrice, setSoldPrice] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [car, setCar] = useState(null);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
    if (isNew) return;
    api
      .get(`/admin/cars/${id}`)
      .then((r) => {
        const c = r.data.car;
        setCar(c);
        setForm({
          make: c.make, model: c.model, year: c.year, price: c.price, mileage: c.mileage,
          fuel: c.fuel, transmission: c.transmission, bodyType: c.bodyType, condition: c.condition,
          category: c.category?._id || '', engine: c.engine || '', exteriorColor: c.exteriorColor || '',
          interiorColor: c.interiorColor || '', vin: c.vin || '', location: c.location || '',
          description: c.description || '', status: c.status, isFeatured: c.isFeatured,
        });
        setImages(c.images || []);
        setSoldPrice(c.soldPrice ?? c.price);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.make.trim()) e.make = 'Make is required';
    if (!form.model.trim()) e.model = 'Model is required';
    if (form.year === '' || Number(form.year) < 1950) e.year = 'Enter a valid year';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a price of 0 or more';
    if (form.mileage === '' || Number(form.mileage) < 0) e.mileage = 'Enter mileage of 0 or more';
    if (form.vin && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(form.vin.trim())) e.vin = 'VIN must be 17 letters or numbers (no I, O or Q)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage) };
    // Status "sold" is set through the sale action, not the form
    if (payload.status === 'sold') delete payload.status;
    try {
      if (isNew) {
        const { data } = await api.post('/admin/cars', payload);
        setCarId(data.car._id);
        toast.success('Car added. You can now upload photos.');
        navigate(`/admin/cars/${data.car._id}`, { replace: true });
      } else {
        const { data } = await api.put(`/admin/cars/${id}`, payload);
        setCar(data.car);
        toast.success('Car saved');
      }
    } catch (ex) {
      setError(ex.message);
    } finally {
      setSaving(false);
    }
  };

  const upload = async (files) => {
    if (!carId) return toast.error('Save the car first, then add photos');
    if (!files?.length) return;
    const body = new FormData();
    [...files].forEach((f) => body.append('images', f));
    setUploading(true);
    try {
      const { data } = await api.post(`/admin/cars/${carId}/images`, body);
      setImages(data.car.images);
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url) => {
    try {
      const { data } = await api.delete(`/admin/cars/${carId}/images`, { data: { url } });
      setImages(data.car.images);
      toast.success('Photo removed');
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  const markSold = async () => {
    if (!window.confirm(`Mark ${carTitle(form)} as sold for ${money(soldPrice)}? It will be hidden from the showroom.`)) return;
    try {
      const { data } = await api.put(`/admin/cars/${carId}/sold`, { soldPrice: Number(soldPrice) });
      setCar(data.car);
      setForm((f) => ({ ...f, status: 'sold' }));
      toast.success('Car marked as sold');
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  if (loading) return <Spinner label="Loading car…" />;
  const sold = car?.status === 'sold' || form.status === 'sold';

  return (
    <div className="space-y-6">
      <Link to="/admin/cars" className="btn-ghost !px-0 text-neutral-500"><ArrowLeft size={16} /> All cars</Link>
      <PageHeader
        title={isNew ? 'Add a car' : carTitle(form)}
        subtitle={isNew ? 'Enter the vehicle details, then upload photos.' : 'Update the price, specifications, photos and availability.'}
      />
      {error && <ErrorBox message={error} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form onSubmit={save} noValidate className="space-y-6">
          <Panel className="space-y-5 p-6">
            <h2 className="font-semibold">Vehicle</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Make" error={errors.make}><input className={adminInput} value={form.make} onChange={set('make')} /></Field>
              <Field label="Model" error={errors.model}><input className={adminInput} value={form.model} onChange={set('model')} /></Field>
              <Field label="Year" error={errors.year}><input className={adminInput} type="number" min="1950" value={form.year} onChange={set('year')} /></Field>
              <Field label="Condition">
                <select className={adminInput} value={form.condition} onChange={set('condition')}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </Field>
              <Field label="Body type">
                <select className={adminInput} value={form.bodyType} onChange={set('bodyType')}>
                  {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select className={adminInput} value={form.category} onChange={set('category')}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="font-semibold">Price and specification</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Price (USD)" error={errors.price}><input className={adminInput} type="number" min="0" step="100" value={form.price} onChange={set('price')} /></Field>
              <Field label="Mileage" error={errors.mileage}><input className={adminInput} type="number" min="0" value={form.mileage} onChange={set('mileage')} /></Field>
              <Field label="Location"><input className={adminInput} value={form.location} onChange={set('location')} /></Field>
              <Field label="Fuel type">
                <select className={adminInput} value={form.fuel} onChange={set('fuel')}>{FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}</select>
              </Field>
              <Field label="Transmission">
                <select className={adminInput} value={form.transmission} onChange={set('transmission')}>{TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}</select>
              </Field>
              <Field label="Engine"><input className={adminInput} value={form.engine} onChange={set('engine')} placeholder="e.g. 2.0L turbo" /></Field>
              <Field label="Exterior colour"><input className={adminInput} value={form.exteriorColor} onChange={set('exteriorColor')} /></Field>
              <Field label="Interior colour"><input className={adminInput} value={form.interiorColor} onChange={set('interiorColor')} /></Field>
              <Field label="VIN (optional)" error={errors.vin}><input className={`${adminInput} font-mono uppercase`} maxLength={17} value={form.vin} onChange={set('vin')} /></Field>
            </div>
            <Field label="Description">
              <textarea className={`${adminInput} min-h-32`} value={form.description} onChange={set('description')} />
            </Field>
          </Panel>

          <Panel className="space-y-4 p-6">
            <h2 className="font-semibold">Availability</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Listing status">
                <select className={adminInput} value={sold ? 'sold' : form.status} onChange={set('status')} disabled={sold}>
                  {CAR_STATUSES_FORM.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                  {sold && <option value="sold">Sold</option>}
                </select>
              </Field>
              <label className="flex items-center gap-2 self-end pb-3 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-black" checked={form.isFeatured} onChange={set('isFeatured')} /> Featured on homepage
              </label>
            </div>
          </Panel>

          <div className="flex justify-end">
            <button className="btn-primary" disabled={saving || sold}>{saving ? 'Saving…' : isNew ? 'Add car' : 'Save changes'}</button>
          </div>
        </form>

        <div className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
          <Panel className="space-y-5 p-6">
            <div>
              <h2 className="font-semibold">Photos</h2>
              <p className="mt-1 text-xs text-neutral-500">JPG, PNG, WEBP or GIF, up to 5 MB each. The first photo is the cover.</p>
            </div>
            {carId ? (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center hover:border-neutral-400">
                {uploading ? <Upload size={24} className="animate-pulse" /> : <ImagePlus size={24} />}
                <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Upload photos'}</span>
                <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
              </label>
            ) : (
              <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-500">Add the car first to upload photos.</p>
            )}
            {images.length > 0 && (
              <ul className="grid grid-cols-2 gap-3">
                {images.map((src, i) => (
                  <li key={src} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-black px-2 py-0.5 text-[10px] text-white">Cover</span>}
                    <button type="button" onClick={() => removeImage(src)} aria-label="Remove photo"
                      className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-lg bg-white/95 py-1 text-xs text-red-600 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                      <Trash2 size={12} /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {carId && !sold && (
            <Panel className="space-y-4 p-6">
              <h2 className="font-semibold">Mark as sold</h2>
              <Field label="Final sale price (USD)">
                <input className={adminInput} type="number" min="0" value={soldPrice} onChange={(e) => setSoldPrice(e.target.value)} />
              </Field>
              <button className="btn-secondary w-full" onClick={markSold}>Mark as sold</button>
              <p className="text-xs text-neutral-500">Sold cars are removed from public listings and counted in revenue.</p>
            </Panel>
          )}
          {sold && (
            <Panel className="p-6 text-sm">
              <p className="font-semibold">Sold</p>
              <p className="mt-1 text-neutral-600">Sold for {money(car?.soldPrice)}</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
