import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EMAIL_RE } from '../../lib/validation';
import AuthShell, { FormField } from './AuthShell';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const err = {};
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (!form.password) err.password = 'Enter your password';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (ex) {
      setServerError(ex.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Access your orders, wishlist and saved details."
      footer={
        <>
          New here? <Link to="/register" className="font-medium text-ink underline underline-offset-4">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <FormField label="Email" error={errors.email}>
          <input className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input className="input" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} />
        </FormField>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-neutral-600 hover:text-ink">Forgot password?</Link>
        </div>
        <button className="btn-primary w-full !py-4" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
