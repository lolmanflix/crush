import React, { useEffect, useState } from 'react';
import { MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon, XIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../context/ProductContext';
import { useProducts } from '../context/ProductContext';

const ANNOUNCEMENTS = [
  'صنع في مصر 🇪🇬',
  'توصيل مجاني للطلبات فوق ٣٠٠ جنيه 🚚',
  'تشكيلة الشتاء متاحة الآن ❄️',
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { products } = useProducts();
  const [showCompact, setShowCompact] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowCompact(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setProfileForm({
        name: data.user?.user_metadata?.name || '',
        phone: data.user?.user_metadata?.phone || '',
        address: data.user?.user_metadata?.address || ''
      });
    };
    getUser();
  }, [profileOpen]);

  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setSearchDropdownOpen(searchOpen && !!searchQuery);
  }, [searchOpen, searchQuery]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    const { error } = await supabase.auth.updateUser({
      data: {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address
      }
    });
    if (error) {
      setProfileMsg('Error updating profile: ' + error.message);
    } else {
      setProfileMsg('Profile updated successfully!');
      // Optionally refresh user info
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return <>
    <style>{`
      .marquee {
        display: flex;
        align-items: center;
        width: 100vw;
        overflow: hidden;
        white-space: nowrap;
        position: relative;
        height: 40px;
      }
      .marquee__inner {
        display: inline-block;
        padding-left: 100vw;
        animation: marquee-scroll 18s linear infinite;
      }
      @keyframes marquee-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
      .header-fixed-stack {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        width: 100vw;
      }
      @media (max-width: 1024px) {
        .desktop-nav { display: none !important; }
        .mobile-nav { display: flex !important; }
      }
      @media (min-width: 1025px) {
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
      }
      .mobile-nav-drawer {
        transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s cubic-bezier(.4,0,.2,1);
        transform: translateY(-30px);
        opacity: 0;
        pointer-events: none;
        z-index: 9999;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
      }
      .mobile-nav-drawer.open {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
        z-index: 9999;
      }
      .mobile-nav-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        transition: opacity 0.35s cubic-bezier(.4,0,.2,1);
        z-index: 0;
        opacity: 1;
      }
      .mobile-nav-drawer:not(.open) .mobile-nav-backdrop {
        opacity: 0;
        pointer-events: none;
      }
      .mobile-nav-content {
        background: white;
        border-top: 1px solid #e5e7eb;
        box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        padding: 1rem;
        width: 100%;
        position: relative;
        z-index: 1;
        min-height: 100px;
      }
      .mobile-nav-close {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        font-size: 2rem;
        color: #333;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 2;
        transition: color 0.2s;
      }
      .mobile-nav-close:hover {
        color: #e53e3e;
      }
      .header-search-bar {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background: white;
        display: flex;
        align-items: center;
        z-index: 60;
        transform: translateX(-100%);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s cubic-bezier(.4,0,.2,1);
      }
      .header-search-bar.open {
        transform: translateX(0);
        opacity: 1;
      }
      .header-logo {
        transition: opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1);
      }
      .header-logo.hide {
        opacity: 0;
        transform: translateY(-20px);
        pointer-events: none;
      }
    `}</style>
    {/* Only show compact header after scroll */}
    {/* Remove showCompact and always render the header */}
    <div className="header-fixed-stack pointer-events-none">
      <header className="w-full bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2 shadow pointer-events-auto" style={{overflow: 'hidden'}}>
        <div className="container mx-auto px-4 flex items-center justify-between relative">
          {/* Left: Navigation (Desktop) */}
          <nav className="desktop-nav flex items-center space-x-6 text-base font-medium">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <Link to="/men" className="hover:text-blue-600 transition">Men</Link>
            <Link to="/kids" className="hover:text-blue-600 transition">Kids</Link>
            <Link to="/collections" className="hover:text-blue-600 transition">Collections</Link>
            <Link to="/stories" className="hover:text-blue-600 transition">Stories</Link>
            {user && (
              <button onClick={handleLogout} className="ml-2 text-sm text-red-600 hover:text-red-800 transition font-medium">Logout</button>
            )}
          </nav>
          {/* Left: Hamburger (Mobile) */}
          <button className="mobile-nav flex items-center mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
          {/* Center: Brand */}
          <div className={`flex-1 flex justify-center header-logo${searchOpen ? ' hide' : ''}`}>
            <h1 className="text-2xl font-serif font-bold tracking-widest uppercase select-none">Ra3</h1>
          </div>
          {/* Animated Search Bar */}
          <div className={`header-search-bar${searchOpen ? ' open' : ''}`}
            onClick={() => setSearchOpen(false)}>
            <div className="flex-1 flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <input
                ref={searchInputRef}
                type="text"
                className="w-full max-w-lg px-4 py-2 rounded border border-gray-300 bg-gray-50 text-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="ml-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={e => { e.stopPropagation(); setSearchOpen(false); }}>&times;</button>
            </div>
          </div>
          {/* Live Search Results Dropdown (below header) */}
          {searchDropdownOpen && (
            <div className="fixed left-0 right-0 top-[64px] z-50 flex justify-center" onClick={() => setSearchDropdownOpen(false)}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto w-full max-w-2xl mt-2" onClick={e => e.stopPropagation()}>
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No products found.</div>
                ) : (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => { setSearchOpen(false); setSearchDropdownOpen(false); navigate(`/product/${product.id}`); }}
                    >
                      <img src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded border" />
                      <div>
                        <div className="font-semibold text-black">{product.name}</div>
                        <div className="text-gray-500 text-sm line-clamp-1">{product.description}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {/* Right: Icons */}
          <div className="flex items-center space-x-4">
            <button aria-label="Search" onClick={() => setSearchOpen(true)}>
              <SearchIcon size={20} />
            </button>
            <button aria-label="Account" onClick={() => {
              if (!user) {
                navigate('/login');
              } else {
                setProfileOpen(true);
              }
            }}>
              <UserIcon size={20} />
            </button>
            <Link to="/admin" aria-label="Admin" className="hidden lg:block">
              <span className="text-sm font-medium">Admin</span>
            </Link>
            <button aria-label="Shopping Bag" onClick={() => navigate('/cart')}>
              <ShoppingBagIcon size={20} />
            </button>
          </div>
        </div>
        {/* Mobile Nav Drawer (always rendered, animated) */}
        <div className={`mobile-nav mobile-nav-drawer${mobileMenuOpen && !searchOpen ? ' open' : ''}`}>
          <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-nav-content">
            <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)}>&times;</button>
            <Link to="/" className="py-2 text-lg font-medium hover:text-blue-600 transition block" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/men" className="py-2 text-lg font-medium hover:text-blue-600 transition block" onClick={() => setMobileMenuOpen(false)}>Men</Link>
            <Link to="/kids" className="py-2 text-lg font-medium hover:text-blue-600 transition block" onClick={() => setMobileMenuOpen(false)}>Kids</Link>
            <Link to="/collections" className="py-2 text-lg font-medium hover:text-blue-600 transition block" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
            <Link to="/stories" className="py-2 text-lg font-medium hover:text-blue-600 transition block" onClick={() => setMobileMenuOpen(false)}>Stories</Link>
            {user && (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="py-2 text-lg text-left font-medium text-red-600 hover:text-red-800 transition block w-full">Logout</button>
            )}
          </div>
        </div>
      </header>
      {/* Profile Modal/Dropdown */}
      {profileOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setProfileOpen(false)} style={{ pointerEvents: 'auto' }}></div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 min-w-[320px] relative z-10" onClick={e => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white" onClick={e => { e.stopPropagation(); setProfileOpen(false); }}>
              <XIcon size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center gap-2">
              {profileForm.name || user.email}
              {(user.email === 'badr75161@gmail.com' || user.email === 'kareemdiyaaa2007@gmail.com' || user.is_super_admin || user.user_metadata?.is_admin) && (
                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">Admin</span>
              )}
            </h2>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">Name</label>
                <input type="text" name="name" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" value={profileForm.name} onChange={handleProfileChange} />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">Phone Number</label>
                <input type="text" name="phone" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" value={profileForm.phone} onChange={handleProfileChange} />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">Address</label>
                <input type="text" name="address" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" value={profileForm.address} onChange={handleProfileChange} />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white opacity-60" value={user.email} disabled />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">Save Changes</button>
              {profileMsg && <div className="text-center mt-2 text-green-600 dark:text-green-400">{profileMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  </>;
};