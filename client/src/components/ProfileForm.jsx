import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PASSWORD_HINT, isStrongPassword } from '../lib/validation';
import { FormField } from '../pages/store/AuthShell';

// Used by customers and admins. Address fields are shown for customers only.
export default function ProfileForm({ showAddress = true }) {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    name: user.name || '',
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    postalCode: user.address?.postalCode || '',
    country: user.address?.country || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const setP = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPasswords((p) => ({ ...p, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return setErrors({ name: 'Name is required' });
    setErrors({});
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        ...(showAddress && {
          address: {
            street: profile.street,
            city: profile.city,
            postalCode: profile.postalCode,
            country: profile.country,
          },
        }),
      });
      updateUser(data.user);
      toast.success('Profile saved');
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const err = {};
    if (!passwords.currentPassword) err.currentPassword = 'Enter your current password';
    if (!isStrongPassword(passwords.newPassword)) err.newPassword = PASSWORD_HINT;
    if (passwords.newPassword !== passwords.confirm) err.confirm = 'Passwords do not match';
    setErrors(err);
    if (Object.keys(err).length) return;

    setPwSaving(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password updated');
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={saveProfile} noValidate className="card space-y-5 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Personal details</h2>
        <FormField label="Full name" error={errors.name}>
          <input className="input" value={profile.name} onChange={setP('name')} />
        </FormField>
        <FormField label="Email">
          <input className="input bg-neutral-50 text-neutral-500" value={user.email} disabled />
        </FormField>
        <FormField label="Phone">
          <input className="input" type="tel" value={profile.phone} onChange={setP('phone')} />
        </FormField>

        {showAddress && (
          <>
            <h3 className="pt-2 text-sm font-semibold">Default shipping address</h3>
            <FormField label="Street">
              <input className="input" value={profile.street} onChange={setP('street')} />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField label="City"><input className="input" value={profile.city} onChange={setP('city')} /></FormField>
              <FormField label="Postal code"><input className="input" value={profile.postalCode} onChange={setP('postalCode')} /></FormField>
              <FormField label="Country"><input className="input" value={profile.country} onChange={setP('country')} /></FormField>
            </div>
          </>
        )}
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>

      <div className="space-y-8">
        <form onSubmit={changePassword} noValidate className="card space-y-5 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Change password</h2>
          <FormField label="Current password" error={errors.currentPassword}>
            <input className="input" type="password" value={passwords.currentPassword} onChange={setPw('currentPassword')} autoComplete="current-password" />
          </FormField>
          <FormField label="New password" error={errors.newPassword} hint={PASSWORD_HINT}>
            <input className="input" type="password" value={passwords.newPassword} onChange={setPw('newPassword')} autoComplete="new-password" />
          </FormField>
          <FormField label="Confirm new password" error={errors.confirm}>
            <input className="input" type="password" value={passwords.confirm} onChange={setPw('confirm')} autoComplete="new-password" />
          </FormField>
          <button className="btn-secondary" disabled={pwSaving}>{pwSaving ? 'Updating…' : 'Update password'}</button>
        </form>

        <div className="card flex items-center justify-between gap-4 p-6">
          <div>
            <p className="font-medium">Sign out</p>
            <p className="text-sm text-neutral-500">End your session on this device.</p>
          </div>
          <button className="btn-ghost" onClick={logout}>Log out</button>
        </div>
      </div>
    </div>
  );
}
