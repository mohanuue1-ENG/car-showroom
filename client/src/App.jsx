import { Navigate, Route, Routes } from 'react-router-dom';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './components/RequireAuth';

// Showroom pages
import Home from './pages/store/Home';
import Browse from './pages/store/Browse';
import CarDetail from './pages/store/CarDetail';
import Categories from './pages/store/Categories';
import Sell from './pages/store/Sell';
import Wishlist from './pages/store/Wishlist';
import About from './pages/store/About';
import Contact from './pages/store/Contact';
import Login from './pages/store/Login';
import Register from './pages/store/Register';
import ForgotPassword from './pages/store/ForgotPassword';
import ResetPassword from './pages/store/ResetPassword';
import AccountProfile from './pages/store/AccountProfile';
import { AccountInquiries, AccountTestDrives, AccountRecent } from './pages/store/AccountLists';
import NotFound from './pages/NotFound';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminCars from './pages/admin/Cars';
import CarForm from './pages/admin/CarForm';
import AdminCategories from './pages/admin/Categories';
import Inquiries from './pages/admin/Inquiries';
import TestDrives from './pages/admin/TestDrives';
import AdminCustomers from './pages/admin/Customers';
import CustomerDetail from './pages/admin/CustomerDetail';
import Inventory from './pages/admin/Inventory';
import Reports from './pages/admin/Reports';
import StoreSettings from './pages/admin/StoreSettings';
import AdminProfile from './pages/admin/AdminProfile';

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="cars" element={<Browse />} />
        <Route path="cars/:id" element={<CarDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="sell" element={<Sell />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
        <Route path="account" element={<RequireAuth><AccountProfile /></RequireAuth>} />
        <Route path="account/inquiries" element={<RequireAuth><AccountInquiries /></RequireAuth>} />
        <Route path="account/test-drives" element={<RequireAuth><AccountTestDrives /></RequireAuth>} />
        <Route path="account/recent" element={<RequireAuth><AccountRecent /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="cars" element={<AdminCars />} />
        <Route path="cars/new" element={<CarForm />} />
        <Route path="cars/:id" element={<CarForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="test-drives" element={<TestDrives />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<StoreSettings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
