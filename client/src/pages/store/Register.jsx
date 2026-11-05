import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EMAIL_RE, PASSWORD_HINT, isStrongPassword } from '../../lib/validation';
import AuthShell, { FormField } from './AuthShell';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const err = {};
    if (!form.name.trim()) err.name = 'Please enter your name';
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (!isStrongPassword(form.password)) err.password = PASSWORD_HINT;
    if (form.confirm !== form.password) err.confirm = 'Passwords do not match';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      toast.success('Your account is ready');
      navigate('/account', { replace: true });
    } catch (ex) {
      setServerError(ex.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Save cars to your wishlist, follow your enquiries and book test drives."
      footer={<>Already registered? <Link to="/login" className="font-medium text-ink underline underline-offset-4">Log in</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <FormField label="Full name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} autoComplete="name" />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </FormField>
        <FormField label="Phone (optional)">
          <input className="input" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </FormField>
        <FormField label="Password" error={errors.password} hint={PASSWORD_HINT}>
          <input className="input" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm password" error={errors.confirm}>
          <input className="input" type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </FormField>
        <button className="btn-primary w-full !py-4" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
