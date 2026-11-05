// Hero video: set VITE_HERO_VIDEO_URL in client/.env to a cinematic MP4 you have the rights to use.
// When it is empty, or the video fails to load, the fallback photo is shown instead.
export const HERO_VIDEO_URL = import.meta.env.VITE_HERO_VIDEO_URL || '';

export const HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=80';
export const PLACEHOLDER_CAR_IMAGE =
  'https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=1200&q=80';
export const ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1400&q=80';
