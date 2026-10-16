import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail'; 
import Cart from './pages/Cart'; 
import Checkout from './pages/Checkout';
import Profile from './pages/Profile'; 
import Contact from './pages/Contact'; 
import About from './pages/About'; 
import MainLayout from './components/MainLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory'; 
import AdminCustomers from './pages/admin/AdminCustomers'; 
import AdminPromotions from './pages/admin/AdminPromotions'; 
import AdminWarranty from './pages/admin/AdminWarranty';
import AdminB2B from './pages/admin/AdminB2B';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminStaff from './pages/admin/AdminStaff';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Group các Route của Admin (Yêu cầu đăng nhập) */}
      <Route path="/admin" element={
        localStorage.getItem('adminToken') ? <AdminLayout /> : <Navigate to="/admin/login" replace />
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} /> 
        <Route path="customers" element={<AdminCustomers />} /> 
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="warranty" element={<AdminWarranty />} />
        <Route path="b2b" element={<AdminB2B />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="staff" element={<AdminStaff />} />
      </Route>

      <Route path="/login" element={<Auth />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        
        <Route path="/About" element={<About />} />
        
        {/* Các trang liên hệ */}
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/lien-he-b2b" element={<Contact />} />
        
        {/* Route trỏ đến trang Profile */}
        <Route path="/orders" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;