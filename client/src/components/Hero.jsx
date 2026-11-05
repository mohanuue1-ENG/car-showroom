import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HERO_FALLBACK_IMAGE, HERO_VIDEO_URL } from '../lib/media';

// Full-width cinematic background. Shows the fallback photo when no video is configured or it fails.
export default function Hero() {
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = HERO_VIDEO_URL && !videoFailed;

  return (
    <section className="relative isolate -mx-4 -mt-8 mb-20 flex min-h-[80vh] items-center overflow-hidden bg-black sm:-mx-6 md:min-h-[90vh]">
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_URL}
          poster={HERO_FALLBACK_IMAGE}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <img src={HERO_FALLBACK_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10">
        <p className="mb-4 animate-[fadeUp_0.8s_ease-out_both] text-xs font-medium uppercase tracking-[0.3em] text-white/70">
          Luxury showroom
        </p>
        <h1 className="max-w-3xl animate-[fadeUp_0.9s_ease-out_0.1s_both] text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Find Your Perfect Car.
        </h1>
        <p className="mt-6 max-w-xl animate-[fadeUp_1s_ease-out_0.2s_both] text-base leading-relaxed text-white/80 sm:text-lg">
          Certified new and pre-owned vehicles from the world’s finest marques, each inspected, documented and ready for
          a test drive.
        </p>
        <div className="mt-10 flex animate-[fadeUp_1s_ease-out_0.3s_both] flex-col gap-3 sm:flex-row">
          <Link
            to="/cars"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-all duration-300 hover:gap-3 hover:bg-neutral-200"
          >
            Explore Cars <ArrowRight size={18} />
          </Link>
          <Link
            to="/sell"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-black"
          >
            Sell Your Car
          </Link>
        </div>
      </div>
    </section>
  );
}
