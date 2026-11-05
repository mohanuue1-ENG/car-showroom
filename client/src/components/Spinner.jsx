import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 py-16 text-sm text-neutral-500 ${className}`}>
      <Loader2 size={20} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}
