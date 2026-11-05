import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import { ErrorBox, Field, PageHeader, Panel, adminInput } from './ui';

const FIELDS = [
  { section: 'Showroom', items: [
    { key: 'showroomName', label: 'Showroom name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'supportEmail', label: 'Sales email', type: 'email' },
    { key: 'supportPhone', label: 'Phone' },
    { key: 'address', label: 'Showroom address' },
    { key: 'currency', label: 'Currency code (display only)' },
  ] },
  { section: 'Social links', items: [
    { key: 'instagramUrl', label: 'Instagram URL' },
    { key: 'facebookUrl', label: 'Facebook URL' },
    { key: 'twitterUrl', label: 'X (Twitter) URL' },
  ] },
];

export default function StoreSettings() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((r) => setForm(r.data.settings)).catch((e) => setError(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', form);
      setForm(data.settings);
      toast.success('Settings saved');
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!form) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Showroom settings" subtitle="Shown across the website, footer and contact details." />
      <form onSubmit={save} className="space-y-6">
        {FIELDS.map((group) => (
          <Panel key={group.section} className="space-y-5 p-6">
            <h2 className="font-semibold">{group.section}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.items.map((f) => (
                <Field key={f.key} label={f.label}>
                  <input className={adminInput} type={f.type || 'text'} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </Field>
              ))}
            </div>
          </Panel>
        ))}
        <div className="flex justify-end">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  );
}
