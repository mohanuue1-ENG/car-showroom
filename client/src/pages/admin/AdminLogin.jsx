import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EMAIL_RE } from '../../lib/validation';
import AuthShell, { FormField } from '../store/AuthShell';

export default function AdminLogin() {
  const { login, logout, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(location.state?.error || '');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as admin
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

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
      const signedIn = await login(form.email.trim(), form.password);
      if (signedIn.role !== 'admin') {
        logout();
        setServerError('This account does not have admin access.');
        setSubmitting(false);
        return;
      }
      toast.success('Signed in to the admin dashboard');
      navigate('/admin', { replace: true });
    } catch (ex) {
      setServerError(ex.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Admin sign in" subtitle="Restricted area. Store staff only.">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
        <Lock size={20} />
      </div>
      <form onSubmit={submit} noValidate className="space-y-5">
        {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <FormField label="Email" error={errors.email}>
          <input className="input" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </FormField>
        <button className="btn-primary w-full !py-4" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
