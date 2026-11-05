import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import { ErrorBox, PageHeader, Panel, Td, Th, EmptyRow } from './ui';
import { money } from '../../lib/format';

const RANGES = [3, 6, 12, 24];

export default function Reports() {
  const [months, setMonths] = useState(12);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api.get('/admin/reports/sales', { params: { months } }).then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, [months]);

  const maxRevenue = Math.max(...(data?.monthly.map((m) => m.revenue) || [0]), 1);
  const label = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales reports"
        subtitle="Revenue from cars marked as sold, by month and by brand."
        action={
          <select className="input !w-auto !py-2.5" value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-label="Time range">
            {RANGES.map((r) => <option key={r} value={r}>Last {r} months</option>)}
          </select>
        }
      />

      {error && <ErrorBox message={error} />}
      {!data && !error && <Spinner label="Crunching numbers…" />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {[
              ['Revenue', money(data.totalRevenue)],
              ['Cars sold', data.totalCars],
              ['Average sale', money(data.averageSale)],
              ['In stock', data.inventoryCount],
              ['Stock value', money(data.inventoryValue)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-sm text-neutral-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Panel className="p-6">
              <h2 className="mb-6 font-semibold">Revenue by month</h2>
              {data.monthly.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-500">No sales in this period.</p>
              ) : (
                <ul className="space-y-4">
                  {data.monthly.map((m) => (
                    <li key={m._id}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span>{label(m._id)}</span>
                        <span className="text-neutral-500">{m.cars} sold · <span className="font-medium text-ink">{money(m.revenue)}</span></span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${(m.revenue / maxRevenue) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel>
              <div className="border-b border-line px-6 py-4 font-semibold">By brand</div>
              <table className="w-full">
                <thead className="bg-neutral-50"><tr><Th>Brand</Th><Th>Sold</Th><Th className="text-right">Revenue</Th></tr></thead>
                <tbody className="divide-y divide-line">
                  {data.byMake.length === 0 && <EmptyRow colSpan={3}>No sales yet.</EmptyRow>}
                  {data.byMake.map((b) => (
                    <tr key={b._id}>
                      <Td>{b._id}</Td>
                      <Td>{b.cars}</Td>
                      <Td className="text-right font-medium">{money(b.revenue)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
