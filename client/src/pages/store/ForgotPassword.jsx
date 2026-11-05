import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { EMAIL_RE } from '../../lib/validation';
import AuthShell, { FormField } from './AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      setMessage(data.message);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we will send you a link to reset your password."
      footer={<Link to="/login" className="font-medium text-ink underline underline-offset-4">Back to log in</Link>}
    >
      {message ? (
        <div className="space-y-4">
          <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>
          <p className="text-xs text-neutral-500">The link expires after one hour.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <FormField label="Email" error={error}>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </FormField>
          <button className="btn-primary w-full !py-4" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
