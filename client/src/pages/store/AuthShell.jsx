import { Link } from 'react-router-dom';

// Centered card layout for login, registration and password pages
export default function AuthShell({ title, subtitle, footer, children }) {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="card p-8 sm:p-10">
        <Link to="/" className="text-lg font-semibold tracking-tight">Prestige Motors</Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-neutral-600">{footer}</p>}
    </div>
  );
}

export function FormField({ label, error, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
