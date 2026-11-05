import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Heart, Mail, MapPin, MessageSquare, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CarCard from '../../components/CarCard';
import Spinner from '../../components/Spinner';
import { EMAIL_RE } from '../../lib/validation';
import { carTitle, money, mileage } from '../../lib/format';
import { PLACEHOLDER_CAR_IMAGE } from '../../lib/media';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const [car, setCar] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState(null); // 'seller' | 'info' | 'test-drive' | null

  useEffect(() => {
    setCar(null);
    setError('');
    setActive(0);
    api
      .get(`/cars/${id}`)
      .then((r) => {
        setCar(r.data.car);
        setSimilar(r.data.similar);
      })
      .catch((e) => setError(e.status === 404 ? 'This vehicle is no longer available.' : e.message));
  }, [id]);

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium">{error}</p>
        <Link to="/cars" className="btn-primary mt-6">Back to all cars</Link>
      </div>
    );
  }
  if (!car) return <Spinner label="Loading vehicle…" />;

  const saved = wishlistIds.has(car._id);
  const gallery = car.images?.length ? car.images : [PLACEHOLDER_CAR_IMAGE];

  const onWishlist = async () => {
    if (!user) return navigate('/login', { state: { from: `/cars/${car._id}` } });
    try {
      const added = await toggleWishlist(car._id);
      toast.success(added ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const specs = [
    ['Year', car.year],
    ['Mileage', mileage(car.mileage)],
    ['Engine', car.engine || '—'],
    ['Transmission', car.transmission],
    ['Fuel type', car.fuel],
    ['Body type', car.bodyType],
    ['Exterior colour', car.exteriorColor || '—'],
    ['Interior colour', car.interiorColor || '—'],
    ['VIN', car.vin || 'Available on request'],
    ['Condition', car.condition === 'new' ? 'New' : 'Used'],
    ['Location', car.location || '—'],
    ['Category', car.category?.name || '—'],
  ];

  return (
    <div>
      <Link to="/cars" className="btn-ghost mb-6 !px-0 text-neutral-500"><ArrowLeft size={16} /> Back to results</Link>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-neutral-200">
            <img src={gallery[active]} alt={carTitle(car)} className="h-full w-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((src, i) => (
                <button key={src + i} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}
                  className={`aspect-[4/3] overflow-hidden rounded-2xl border-2 ${i === active ? 'border-black' : 'border-transparent'}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <section className="card mt-8 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-600">{car.description || 'No description provided.'}</p>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-3 text-sm">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{car.condition === 'new' ? 'New' : 'Pre-owned'} · {car.make}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{car.model}</h1>
            <p className="mt-1 text-neutral-600">{car.year} · {mileage(car.mileage)} · {car.transmission}</p>
            <p className="mt-6 text-3xl font-semibold">{money(car.price)}</p>
            {car.location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600"><MapPin size={16} /> {car.location}</p>
            )}

            <div className="mt-8 grid gap-3">
              <button className="btn-primary !py-3.5" onClick={() => setModal('seller')}><Mail size={18} /> Contact seller</button>
              <button className="btn-secondary !py-3.5" onClick={() => setModal('info')}><MessageSquare size={18} /> Request information</button>
              <button className="btn-secondary !py-3.5" onClick={() => setModal('test-drive')}><CalendarCheck size={18} /> Schedule a test drive</button>
              <button className={`btn-ghost !py-3 ${saved ? 'bg-black/5' : ''}`} onClick={onWishlist} aria-pressed={saved}>
                <Heart size={18} className={saved ? 'fill-black' : ''} /> {saved ? 'In your wishlist' : 'Add to wishlist'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {modal && <CarModal mode={modal} car={car} user={user} onClose={() => setModal(null)} toast={toast} />}

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-6">Similar vehicles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((c) => <CarCard key={c._id} car={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// Contact seller / request information (inquiry) and schedule a test drive
function CarModal({ mode, car, user, onClose, toast }) {
  const isTestDrive = mode === 'test-drive';
  const defaultMessage =
    mode === 'seller'
      ? `Hi, I'm interested in the ${carTitle(car)}. Could we talk about it?`
      : isTestDrive
        ? 'I would like to book a test drive.'
        : `Could you share more information about the ${carTitle(car)}?`;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    preferredDate: '',
    preferredTime: '10:00',
    message: isTestDrive ? '' : defaultMessage,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Please enter your name';
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (isTestDrive && !form.preferredDate) err.preferredDate = 'Choose a preferred date';
    if (!isTestDrive && form.message.trim().length < 10) err.message = 'Please write at least 10 characters';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    setServerError('');
    try {
      const path = isTestDrive ? `/cars/${car._id}/test-drives` : `/cars/${car._id}/inquiries`;
      const body = isTestDrive
        ? { name: form.name, email: form.email, phone: form.phone, preferredDate: form.preferredDate, preferredTime: form.preferredTime, message: form.message }
        : { name: form.name, email: form.email, phone: form.phone, message: form.message };
      await api.post(path, body);
      setDone(true);
      toast.success(isTestDrive ? 'Test drive request sent' : 'Your message has been sent to the seller');
    } catch (ex) {
      setServerError(ex.message);
    } finally {
      setSaving(false);
    }
  };

  const title = isTestDrive ? 'Schedule a test drive' : mode === 'seller' ? 'Contact seller' : 'Request information';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{carTitle(car)}</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {done ? (
          <div className="mt-8 space-y-6 text-center">
            <p className="text-neutral-700">
              {isTestDrive
                ? 'Thank you. The showroom will confirm your test drive by email.'
                : 'Thank you. The seller will reply to the email address you provided.'}
            </p>
            <div className="flex justify-center gap-3">
              <Link to={isTestDrive ? '/account/test-drives' : '/account/inquiries'} className="btn-secondary" onClick={onClose}>
                {user ? 'View my requests' : 'Done'}
              </Link>
              <button className="btn-primary" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input className="input" value={form.name} onChange={set('name')} autoComplete="name" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
            </div>
            <Field label="Phone (optional)">
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </Field>

            {isTestDrive && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Preferred date" error={errors.preferredDate}>
                  <input className="input" type="date" min={today} value={form.preferredDate} onChange={set('preferredDate')} />
                </Field>
                <Field label="Preferred time">
                  <select className="input" value={form.preferredTime} onChange={set('preferredTime')}>
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            )}

            <Field label={isTestDrive ? 'Notes (optional)' : 'Message'} error={errors.message}>
              <textarea className="input min-h-28" value={form.message} onChange={set('message')} />
            </Field>

            <button className="btn-primary w-full !py-4" disabled={saving}>
              {saving ? 'Sending…' : isTestDrive ? 'Request test drive' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
