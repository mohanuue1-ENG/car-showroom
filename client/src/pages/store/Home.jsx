import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarCheck, Wrench } from 'lucide-react';
import api from '../../lib/api';
import Hero from '../../components/Hero';
import CarCard from '../../components/CarCard';
import Spinner from '../../components/Spinner';
import { ABOUT_IMAGE } from '../../lib/media';

export default function Home() {
  const [categories, setCategories] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [newCars, setNewCars] = useState(null);
  const [recent, setRecent] = useState(null);
  const [popular, setPopular] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/cars', { params: { featured: true, limit: 4 } }),
      api.get('/cars', { params: { condition: 'new', limit: 4 } }),
      api.get('/cars', { params: { sort: 'newest', limit: 4 } }),
      api.get('/cars', { params: { sort: 'popular', limit: 4 } }),
    ])
      .then(([c, f, n, r, p]) => {
        setCategories(c.data);
        setFeatured(f.data.items);
        setNewCars(n.data.items);
        setRecent(r.data.items);
        setPopular(p.data.items);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Hero />

      <Section title="Featured cars" action={<ViewAll to="/cars?featured=true" />}>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!featured ? <Spinner /> : <Grid items={featured} empty="No featured cars right now." />}
      </Section>

      <Section title="Shop by category" action={<ViewAll to="/categories" label="All categories" />}>
        {!categories ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((c) => (
              <Link key={c._id} to={`/cars?category=${c.slug}`} className="group relative flex aspect-[4/3] overflow-hidden rounded-3xl bg-black">
                <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60" />
                <div className="relative mt-auto w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-white/70">{c.carCount} available</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="New arrivals" action={<ViewAll to="/cars?condition=new" />}>
        {!newCars ? <Spinner /> : <Grid items={newCars} empty="No new cars listed yet." />}
      </Section>

      <section className="mb-20 grid gap-4 md:grid-cols-3">
        {[
          { icon: BadgeCheck, title: 'Certified inspection', text: 'Every pre-owned car passes a multi-point inspection before it is listed.' },
          { icon: CalendarCheck, title: 'Test drives', text: 'Book a private test drive at a time that suits you, online.' },
          { icon: Wrench, title: 'Service history', text: 'Full records, VIN checks and transparent pricing on every listing.' },
        ].map((f) => (
          <div key={f.title} className="card p-7">
            <f.icon size={22} />
            <h3 className="mt-5 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.text}</p>
          </div>
        ))}
      </section>

      <Section title="Recently added" action={<ViewAll to="/cars?sort=newest" />}>
        {!recent ? <Spinner /> : <Grid items={recent} empty="Nothing new yet." />}
      </Section>

      <section className="mb-20 overflow-hidden rounded-[2rem] bg-black text-white">
        <div className="grid items-center md:grid-cols-2">
          <div className="p-10 md:p-16">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Sell your car</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">Get a considered offer for your car.</h2>
            <p className="mt-4 max-w-md text-white/70">Tell us about your vehicle and our team will value it and get back to you within one business day.</p>
            <Link to="/sell" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-all hover:gap-3">
              Sell Your Car <ArrowRight size={16} />
            </Link>
          </div>
          <div className="h-72 md:h-full md:min-h-[360px]">
            <img src={ABOUT_IMAGE} alt="Luxury sports car" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <Section title="Most viewed" action={<ViewAll to="/cars?sort=popular" />}>
        {!popular ? <Spinner /> : <Grid items={popular} empty="No listings yet." />}
      </Section>
    </>
  );
}

function Section({ title, action, children }) {
  return (
    <section className="mb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewAll({ to, label = 'View all' }) {
  return <Link to={to} className="text-sm font-medium underline-offset-4 hover:underline">{label}</Link>;
}

function Grid({ items, empty }) {
  if (items.length === 0) return <p className="py-10 text-center text-neutral-500">{empty}</p>;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((car) => <CarCard key={car._id} car={car} />)}
    </div>
  );
}
