import { AlertTriangle } from 'lucide-react';

// Small building blocks shared by admin pages
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return <section className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`}>{children}</section>;
}

export function Th({ children, className = '' }) {
  return <th className={`px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }) {
  return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>;
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm text-neutral-500">{children}</td>
    </tr>
  );
}

export const adminInput = 'input !py-2.5';
export const adminLabel = 'label';

export function Field({ label, children, error }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
