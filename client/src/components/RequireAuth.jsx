import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

// Guards routes. role="admin" sends customers to the admin login, role="customer" sends guests to /login.
export default function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session…" />;

  if (!user) {
    const to = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ error: 'Admin access required' }} />;
  }
  return children;
}
