import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductShowcase } from './components/ProductShowcase';
import { Footer } from './components/Footer';
import { AdminPage } from './pages/AdminPage';
import { ProductProvider, supabase, CartProvider, CartProviderProps } from './context/ProductContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { LoadingScreen } from './components/LoadingScreen';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MenPage from './pages/MenPage';
import KidsPage from './pages/KidsPage';
import CollectionsPage from './pages/CollectionsPage';
import GiftsPage from './pages/GiftsPage';
import StoriesPage from './pages/StoriesPage';
import CartPage from './pages/CartPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
// Route change detector component
const RouteChangeListener = () => {
  const location = useLocation();
  const {
    startLoading,
    stopLoading
  } = useLoading();
  useEffect(() => {
    startLoading();
    // Stop loading after a delay or when content is ready
    const timer = setTimeout(() => {
      stopLoading();
    }, 2000); // Show loading for 2 seconds
    return () => clearTimeout(timer);
  }, [location.pathname, startLoading, stopLoading]);
  return null;
};
// Private route for admin
const PrivateAdminRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, []);
  if (loading) return null;
  // You can add more robust admin check here (e.g., check user role/metadata)
  if (
    !user ||
    !(
      user.email === 'badr75161@gmail.com' ||
      user.email === 'kareemdiyaaa2007@gmail.com' ||
      (user as any).is_super_admin ||
      user.user_metadata?.is_admin
    )
  ) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
const AppContent = () => {
  const {
    isLoading
  } = useLoading();
  return <>
      {/* <LoadingScreen isLoading={isLoading} /> */}
      <Router>
        <ScrollToTop />
        <RouteChangeListener />
        <div className="w-full min-h-screen bg-white text-black">
          <Routes>
            <Route path="/admin" element={<PrivateAdminRoute><AdminPage /></PrivateAdminRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/men" element={<MenPage />} />
            <Route path="/kids" element={<KidsPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/gifts" element={<GiftsPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/" element={<>
                  <Header />
                  <div className="pt-24">
                    <main>
                      <HeroSection />
                      <ProductShowcase title="Men's New Arrivals" category="men" />
                      <ProductShowcase title="Kids Collection" category="kids" reverse={true} />
                    </main>
                  </div>
                  <Footer />
                </>} />
          </Routes>
        </div>
      </Router>
    </>;
};
export function App() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return <ProductProvider>
      <LoadingProvider>
        <CartProvider user={user as CartProviderProps['user']}>
          <AppContent />
        </CartProvider>
      </LoadingProvider>
    </ProductProvider>;
}