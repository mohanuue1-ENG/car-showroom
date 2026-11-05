import { Heart, Fuel, Gauge, MapPin, Settings2, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { carTitle, money, mileage } from '../lib/format';
import { PLACEHOLDER_CAR_IMAGE } from '../lib/media';

// Listing card: photo, name, year, price, mileage, transmission, fuel, location, wishlist
export default function CarCard({ car }) {
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const saved = wishlistIds.has(car._id);

  const onWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login', { state: { from: `/cars/${car._id}` } });
    try {
      const added = await toggleWishlist(car._id);
      toast.success(added ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/cars/${car._id}`} className="relative block aspect-[16/10] overflow-hidden bg-neutral-200">
        <img
          src={car.images?.[0] || PLACEHOLDER_CAR_IMAGE}
          alt={carTitle(car)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-black px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
            {car.condition === 'new' ? 'New' : 'Used'}
          </span>
          {car.isFeatured && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink">Featured</span>
          )}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{car.make}</p>
            <Link to={`/cars/${car._id}`} className="block truncate text-lg font-semibold hover:underline">
              {car.model}
            </Link>
          </div>
          <button
            onClick={onWishlist}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors hover:bg-black/5"
          >
            <Heart size={18} className={saved ? 'fill-black' : ''} />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-600">
          <Spec icon={Calendar} label={car.year} />
          <Spec icon={Gauge} label={mileage(car.mileage)} />
          <Spec icon={Settings2} label={car.transmission} />
          <Spec icon={Fuel} label={car.fuel} />
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-xl font-semibold">{money(car.price)}</p>
            {car.location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                <MapPin size={12} /> {car.location}
              </p>
            )}
          </div>
          <Link to={`/cars/${car._id}`} className="btn-secondary !px-4 !py-2 text-sm">View details</Link>
        </div>
      </div>
    </article>
  );
}

function Spec({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 truncate">
      <Icon size={15} className="shrink-0 text-neutral-400" />
      <span className="truncate">{label}</span>
    </div>
  );
}
