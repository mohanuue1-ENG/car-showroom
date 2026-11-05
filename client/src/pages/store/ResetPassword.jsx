import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { PASSWORD_HINT, isStrongPassword } from '../../lib/validation';
import AuthShell, { FormField } from './AuthShell';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isStrongPassword(password)) return setError(PASSWORD_HINT);
    if (password !== confirm) return setError('Passwords do not match');
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password updated. Please log in.');
      navigate('/login');
    } catch (ex) {
      setError(ex.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      footer={<Link to="/forgot-password" className="font-medium text-ink underline underline-offset-4">Request a new link</Link>}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <FormField label="New password" hint={PASSWORD_HINT}>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm new password">
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </FormField>
        <button className="btn-primary w-full !py-4" disabled={submitting}>
          {submitting ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  );
}
