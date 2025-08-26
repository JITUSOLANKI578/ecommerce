import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, Heart, MapPin, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import AuthModal from '../Auth/AuthModal';

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const { totalItems } = useAppSelector(state => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const categories = [
    'Lehengas', 'Chaniya Choli', 'Gowns', 'Sarees', 'Kurta Sets'
  ];

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50 font-sans">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white py-2 text-center text-sm">
          <p className="animate-pulse">🎉 Navratri Special: FREE Shipping on Orders Above ₹1999! Use Code: NAVRATRI25</p>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 pl-4 pr-4 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-2xl font-bold tracking-wider">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-800 tracking-tight">Ambika</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for Lehengas, Sarees, Gowns..."
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-6">
              {/* Location */}
              <div className="hidden lg:flex items-center text-gray-600 hover:text-purple-600 cursor-pointer transition-colors duration-200">
                <MapPin className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Deliver to 400001</span>
              </div>

              {/* Search Icon - Mobile */}
              <button
                className="md:hidden text-gray-600 hover:text-purple-600 transition-colors duration-200"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
              </button>

              {/* User Account */}
              <div className="relative group">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-purple-50 transition-colors duration-200">
                      <User className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="hidden lg:block text-sm text-gray-700 font-medium">Hi, {user?.name}</span>
                    <div className="absolute top-full right-0 w-48 bg-white shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 mt-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">Wishlist</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                  >
                    <div className="p-1.5 rounded-full bg-gray-100 hover:bg-purple-50">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium">Login</span>
                  </button>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-gray-100 hover:bg-purple-50">
                  <Heart className="w-5 h-5" />
                </div>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-600 hover:text-purple-600 transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-gray-100 hover:bg-purple-50">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              <button
                className="md:hidden text-gray-600 hover:text-purple-600 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="md:hidden mt-4 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Categories Navigation */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <nav className="hidden md:flex space-x-8 py-3">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-inner animate-slideIn">
            <div className="py-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase().replace(' ', '-')}`}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Add these styles to your CSS file or use Tailwind CSS custom animation classes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;