import { Link } from 'react-router-dom';
import { ABOUT_IMAGE } from '../../lib/media';

const VALUES = [
  { title: 'Inspected, not just listed', text: 'Every pre-owned car passes a multi-point inspection and comes with its full history.' },
  { title: 'Transparent pricing', text: 'Clear prices, honest condition reports and no hidden fees on the listing.' },
  { title: 'Test before you buy', text: 'Book a private test drive online and speak directly with the seller.' },
];

export default function About() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">About us</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">A showroom built on trust.</h1>
          <p className="mt-6 leading-relaxed text-neutral-600">
            We specialise in luxury, performance and electric vehicles from the marques you know, both new and carefully
            selected pre-owned. Our team handles everything from valuation and inspection to finance and delivery.
          </p>
          <Link to="/cars" className="btn-primary mt-8">Explore cars</Link>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-neutral-200">
          <img src={ABOUT_IMAGE} alt="Luxury car" className="h-full w-full object-cover" />
        </div>
      </section>

      <section>
        <h2 className="section-title mb-8">What we stand for</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="card p-8">
              <h3 className="text-lg font-semibold">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-neutral-600">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
