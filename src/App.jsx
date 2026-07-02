import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyOrdersPage from './pages/user/MyOrdersPage';
import TrackOrderPage from './pages/user/TrackOrderPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddProductPage from './pages/owner/AddProductPage';
import InventoryPage from './pages/owner/InventoryPage';
import Spinner from './components/common/Spinner';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullscreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const RequireOwner = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'owner') return <Navigate to="/" replace />;
  return children;
};

const RequireGuest = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/shop"         element={<ShopPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login"        element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/register"     element={<RequireGuest><RegisterPage /></RequireGuest>} />
        <Route path="/orders"       element={<RequireAuth><MyOrdersPage /></RequireAuth>} />
        <Route path="/orders/track/:id" element={<RequireAuth><TrackOrderPage /></RequireAuth>} />
        <Route path="/owner/dashboard"   element={<RequireOwner><OwnerDashboard /></RequireOwner>} />
        <Route path="/owner/add-product" element={<RequireOwner><AddProductPage /></RequireOwner>} />
        <Route path="/owner/inventory"   element={<RequireOwner><InventoryPage /></RequireOwner>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}