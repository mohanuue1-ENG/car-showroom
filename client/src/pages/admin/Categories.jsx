import { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import { ErrorBox, Field, PageHeader, Panel, Td, Th, EmptyRow, adminInput } from './ui';

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, category = edit
  const [form, setForm] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    api.get('/admin/categories').then((r) => setCategories(r.data.items)).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const open = (cat = {}) => {
    setEditing(cat);
    setForm({ name: cat.name || '', description: cat.description || '' });
    setFile(null);
    setPreview(cat.image || '');
    setFormError('');
  };

  const close = () => setEditing(null);

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Category name is required');

    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('description', form.description.trim());
    if (file) body.append('image', file);

    setSaving(true);
    try {
      if (editing._id) await api.put(`/admin/categories/${editing._id}`, body);
      else {
        if (!file) throw new Error('Please add an image for this category');
        await api.post('/admin/categories', body);
      }
      toast.success(editing._id ? 'Category updated' : 'Category added');
      close();
      load();
    } catch (ex) {
      setFormError(ex.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (cat) => {
    if (!window.confirm(`Delete the "${cat.name}" category?`)) return;
    try {
      await api.delete(`/admin/categories/${cat._id}`);
      toast.success('Category deleted');
      load();
    } catch (ex) {
      toast.error(ex.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Group products into sections shoppers can browse."
        action={<button className="btn-primary !py-2.5" onClick={() => open()}><Plus size={16} /> New category</button>}
      />

      {error && <ErrorBox message={error} />}
      {!categories && !error && <Spinner />}

      {categories && (
        <Panel>
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr><Th>Category</Th><Th>Slug</Th><Th>Description</Th><Th className="text-right">Actions</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.length === 0 && <EmptyRow colSpan={4}>No categories yet.</EmptyRow>}
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-neutral-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-neutral-500">{c.slug}</Td>
                  <Td className="max-w-xs truncate text-neutral-600">{c.description}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="btn-ghost !px-3" onClick={() => open(c)} aria-label={`Edit ${c.name}`}><Pencil size={16} /></button>
                      <button className="btn-ghost !px-3 text-red-600 hover:bg-red-50" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}><Trash2 size={16} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <form onSubmit={save} noValidate className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing._id ? 'Edit category' : 'New category'}</h2>
              <button type="button" onClick={close} aria-label="Close"><X size={20} /></button>
            </div>

            {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <Field label="Name">
              <input className={adminInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className={`${adminInput} min-h-20`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>

            <div>
              <p className="label">Image</p>
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-line p-4 hover:border-neutral-400">
                {preview ? (
                  <img src={preview} alt="" className="h-20 w-28 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-20 w-28 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400"><ImagePlus size={22} /></span>
                )}
                <span className="text-sm text-neutral-600">{file ? file.name : preview ? 'Click to replace' : 'Click to upload an image'}</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files[0])} />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save category'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
