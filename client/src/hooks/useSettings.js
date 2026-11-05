import { useEffect, useState } from 'react';
import api from '../lib/api';

// Showroom settings are fetched once and shared across the app
let cached = null;
let pending = null;

export function useSettings() {
  const [settings, setSettings] = useState(cached);

  useEffect(() => {
    if (cached) return;
    pending = pending || api.get('/settings').then((r) => (cached = r.data));
    pending.then(setSettings).catch(() => {});
  }, []);

  return settings;
}

export const DEFAULT_SETTINGS = {
  showroomName: 'Prestige Motors',
  tagline: 'Certified luxury and performance cars.',
  supportEmail: 'sales@example.com',
  supportPhone: '',
  address: '',
  socials: { instagram: '#', facebook: '#', twitter: '#' },
};
