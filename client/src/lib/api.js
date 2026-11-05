import axios from 'axios';

export const TOKEN_KEY = 'showroom-token';

const api = axios.create({ baseURL: '/api', timeout: 20000 });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors into a message the UI can show
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.error ||
      (err.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : null) ||
      (!err.response ? 'Cannot reach the server. Check your connection.' : 'Something went wrong.');
    const error = new Error(message);
    error.status = status;
    return Promise.reject(error);
  }
);

// Absolute URLs (e.g. seeded Unsplash photos) pass through; uploads are served by the API
export const imageUrl = (src) => src || '';

export default api;
