import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

export default function Categories() {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="mb-10">
        <h1 className="section-title">Categories</h1>
        <p className="mt-2 max-w-xl text-neutral-600">Find the right kind of car, whether you need space, speed, electric range or a workhorse.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!categories && !error && <Spinner />}

      {categories && (
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((c) => (
            <Link key={c._id} to={`/cars?category=${c.slug}`} className="group relative flex min-h-72 overflow-hidden rounded-3xl bg-black">
              <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60" />
              <div className="relative mt-auto w-full bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
                <p className="text-sm text-white/70">{c.carCount} available</p>
                <h2 className="mt-1 text-3xl font-semibold">{c.name}</h2>
                <p className="mt-2 max-w-sm text-sm text-white/80">{c.description}</p>
                <span className="mt-5 inline-block text-sm font-medium underline-offset-4 group-hover:underline">Browse {c.name} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
