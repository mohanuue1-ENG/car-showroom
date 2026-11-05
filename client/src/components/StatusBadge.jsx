import { CAR_STATUSES, INQUIRY_STATUS_LABELS, TEST_DRIVE_STATUS_LABELS } from '../lib/format';

const TONES = {
  new: 'bg-sky-100 text-sky-800',
  in_progress: 'bg-amber-100 text-amber-800',
  responded: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-neutral-200 text-neutral-700',
  requested: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  available: 'bg-emerald-100 text-emerald-800',
  reserved: 'bg-amber-100 text-amber-800',
  sold: 'bg-neutral-900 text-white',
};

const LABELS = { ...INQUIRY_STATUS_LABELS, ...TEST_DRIVE_STATUS_LABELS, available: 'Available', reserved: 'Reserved', sold: 'Sold' };

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${TONES[status] || 'bg-neutral-100'}`}>
      {LABELS[status] || status}
    </span>
  );
}

export const isCarStatus = (s) => CAR_STATUSES.includes(s);
