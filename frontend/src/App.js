import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import AdminRoute from './components/AdminRoute';
import VendorRoute from './components/VendorRoute';

// Screens - Public
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import StoreDetailScreen from './screens/StoreDetailScreen';
import UserProfileScreen from './screens/UserProfileScreen';

// Screens - Admin
import AdminDashboard from './screens/admin/AdminDashboard';
import StoreManageScreen from './screens/admin/StoreManageScreen';

// Screens - Vendor
import VendorDashboard from './screens/vendor/VendorDashboard';
import StoreRequestScreen from './screens/vendor/StoreRequestScreen';
import ProductAddScreen from './screens/vendor/ProductAddScreen';


function App() {
  return (
    <>
      <ToastContainer position="top-center" limit={1} />
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            {/* Public/Customer Routes */}
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/search" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/stores/:id" element={<StoreDetailScreen />} />

            {/* Private Customer Routes */}
            <Route path="/profile" element={<UserProfileScreen />} />

            {/* Private Vendor Routes */}
            <Route path="/vendor" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
            <Route path="/vendor/request-store" element={<VendorRoute><StoreRequestScreen /></VendorRoute>} />
            <Route path="/vendor/store/:id/products" element={<VendorRoute><ProductAddScreen /></VendorRoute>} />

            {/* Private Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/stores/:id" element={<AdminRoute><StoreManageScreen /></AdminRoute>} />

          </Routes>
        </Container>
      </main>

      <footer className="text-center py-3">
        <Container>
          <p>Local Store Hub &copy; 2025</p>
        </Container>
      </footer>
    </>
  );
}

export default App;
