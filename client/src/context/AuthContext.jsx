import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    try {
      const { data } = await api.get('/me/wishlist');
      setWishlistIds(new Set(data.items.map((c) => c._id)));
    } catch {
      setWishlistIds(new Set());
    }
  }, []);

  // Restore the session on first load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        return loadWishlist();
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, [loadWishlist]);

  const storeSession = async (token, nextUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    await loadWishlist();
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await storeSession(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    await storeSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setWishlistIds(new Set());
  };

  const updateUser = (next) => setUser(next);

  // Adds or removes a car from the wishlist. Returns true when it was added.
  const toggleWishlist = async (carId) => {
    if (!user) throw new Error('Please log in to use your wishlist');
    const id = String(carId);
    if (wishlistIds.has(id)) {
      await api.delete(`/me/wishlist/${id}`);
      setWishlistIds((prev) => new Set([...prev].filter((x) => x !== id)));
      return false;
    }
    await api.post(`/me/wishlist/${id}`);
    setWishlistIds((prev) => new Set([...prev, id]));
    return true;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
      wishlistIds,
      toggleWishlist,
      refreshWishlist: loadWishlist,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, wishlistIds, loadWishlist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
