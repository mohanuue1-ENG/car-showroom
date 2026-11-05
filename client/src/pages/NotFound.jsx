import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page could not be found</h1>
      <p className="mt-3 text-neutral-600">The link may be broken or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
