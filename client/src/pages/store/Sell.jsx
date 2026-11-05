import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { useSettings, DEFAULT_SETTINGS } from '../../hooks/useSettings';
import { useToast } from '../../context/ToastContext';
import { EMAIL_RE } from '../../lib/validation';

// Sellers describe their car and the team replies by email. The form opens the visitor's email app.
export default function Sell() {
  const s = useSettings() || DEFAULT_SETTINGS;
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', make: '', model: '', year: '', mileage: '', askingPrice: '', notes: '' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Please enter your name';
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (!form.make.trim() || !form.model.trim()) err.model = 'Enter the make and model';
    if (!form.year || Number(form.year) < 1950 || Number(form.year) > new Date().getFullYear() + 1) err.year = 'Enter a valid year';
    setErrors(err);
    if (Object.keys(err).length) return;

    const subject = encodeURIComponent(`Sell my car: ${form.year} ${form.make} ${form.model}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nMileage: ${form.mileage}\nAsking price: ${form.askingPrice}\n\n${form.notes}\n\n— ${form.name} (${form.email})`
    );
    window.location.href = `mailto:${s.supportEmail}?subject=${subject}&body=${body}`;
    toast.success('Opening your email app to send your details');
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Sell your car</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Tell us about your car</h1>
        <p className="mt-4 leading-relaxed text-neutral-600">
          Share the basics and our team will value your car, explain the options, and arrange a viewing at the showroom.
        </p>
        <ul className="mt-10 space-y-5 text-sm">
          {['Free, no-obligation valuation', 'Fast, transparent offers', 'We handle the paperwork'].map((t) => (
            <li key={t} className="flex items-center gap-3"><CheckCircle2 size={18} /> {t}</li>
          ))}
        </ul>
        <p className="mt-10 flex items-center gap-3 text-sm text-neutral-600"><Mail size={16} /> {s.supportEmail}</p>
      </div>

      <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" error={errors.name}><input className="input" value={form.name} onChange={set('name')} /></Field>
          <Field label="Email" error={errors.email}><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
          <Field label="Phone (optional)"><input className="input" type="tel" value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Year" error={errors.year}><input className="input" type="number" value={form.year} onChange={set('year')} /></Field>
          <Field label="Make" error={errors.model}><input className="input" value={form.make} onChange={set('make')} /></Field>
          <Field label="Model"><input className="input" value={form.model} onChange={set('model')} /></Field>
          <Field label="Mileage"><input className="input" type="number" min="0" value={form.mileage} onChange={set('mileage')} /></Field>
          <Field label="Asking price (USD)"><input className="input" type="number" min="0" value={form.askingPrice} onChange={set('askingPrice')} /></Field>
        </div>
        <Field label="Condition and history">
          <textarea className="input min-h-28" value={form.notes} onChange={set('notes')} placeholder="Service history, accidents, modifications, number of owners…" />
        </Field>
        <button className="btn-primary w-full !py-4">Send my car details</button>
      </form>
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
