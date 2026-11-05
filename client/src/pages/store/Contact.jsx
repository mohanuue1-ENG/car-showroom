import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useSettings, DEFAULT_SETTINGS } from '../../hooks/useSettings';
import { useToast } from '../../context/ToastContext';
import { EMAIL_RE } from '../../lib/validation';

// No server endpoint stores messages, so "Send" opens the visitor's email app with the message filled in.
export default function Contact() {
  const s = useSettings() || DEFAULT_SETTINGS;
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Please enter your name';
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) err.message = 'Please write at least 10 characters';
    setErrors(err);
    if (Object.keys(err).length) return;

    const subject = encodeURIComponent(form.subject.trim() || `Message from ${form.name.trim()}`);
    const body = encodeURIComponent(`${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`);
    window.location.href = `mailto:${s.supportEmail}?subject=${subject}&body=${body}`;
    toast.success('Opening your email app to send the message');
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Contact</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">We are happy to help</h1>
        <p className="mt-4 leading-relaxed text-neutral-600">
          Questions about an order, sizing, or a product? Send us a message and we will reply within one business day.
        </p>
        <ul className="mt-10 space-y-5">
          <li className="flex gap-4"><Mail size={20} className="mt-0.5" /><a href={`mailto:${s.supportEmail}`} className="hover:underline">{s.supportEmail}</a></li>
          {s.supportPhone && <li className="flex gap-4"><Phone size={20} className="mt-0.5" />{s.supportPhone}</li>}
          {s.address && <li className="flex gap-4"><MapPin size={20} className="mt-0.5" />{s.address}</li>}
        </ul>
      </div>

      <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
        <Field label="Name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Subject">
          <input className="input" value={form.subject} onChange={set('subject')} />
        </Field>
        <Field label="Message" error={errors.message}>
          <textarea className="input min-h-36" value={form.message} onChange={set('message')} />
        </Field>
        <button className="btn-primary w-full !py-4">Send message</button>
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
