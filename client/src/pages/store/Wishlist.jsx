import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CarCard from '../../components/CarCard';
import Spinner from '../../components/Spinner';

export default function Wishlist() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const { wishlistIds, refreshWishlist } = useAuth();
  const toast = useToast();

  const load = () => api.get('/me/wishlist').then((r) => setItems(r.data.items)).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistIds.size]);

  const remove = async (car) => {
    try {
      await api.delete(`/me/wishlist/${car._id}`);
      await refreshWishlist();
      toast.success('Removed from your wishlist');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!items) return <Spinner label="Loading your wishlist…" />;

  return (
    <div>
      <h1 className="section-title mb-8">My wishlist <span className="text-neutral-400">({items.length})</span></h1>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white py-20 text-center">
          <p className="font-medium">You have not saved any cars yet.</p>
          <Link to="/cars" className="btn-primary mt-6">Browse cars</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((car) => (
            <div key={car._id} className="flex flex-col gap-3">
              <CarCard car={car} />
              <button className="btn-ghost text-red-600" onClick={() => remove(car)}>Remove from wishlist</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
