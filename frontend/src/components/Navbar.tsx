'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TrebleClefIcon, SitarIcon } from './icons/MusicalIcons';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, username, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHelp = () => {
    router.push('/help');
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md text-slate-800 px-6 py-4 flex justify-between items-center border-b border-orange-200/50 sticky top-0 z-50 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center space-x-3 group">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <SitarIcon 
              className="text-orange-500 group-hover:text-orange-600 transition-colors duration-300" 
              size={28} 
            />
            <TrebleClefIcon 
              className="text-blue-600 absolute -top-1 -right-1 group-hover:text-blue-700 transition-colors duration-300" 
              size={16} 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-display font-semibold bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 bg-clip-text text-transparent">
              SwarLipi
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              संगीत • MUSIC
            </p>
          </div>
        </div>
      </div>

      {/* User Section */}
      {isAuthenticated && (
        <div className="flex items-center space-x-4">
          {/* Welcome Message */}
          {username && (
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-blue-50 rounded-full border border-orange-200/50">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-slate-700 font-medium text-sm">
                Welcome, {username}
              </span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="w-5 h-5 text-slate-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={handleHelp}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 md:hidden">
              <div className="py-2">
                <button
                  onClick={() => {
                    handleHelp();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Help</span>
                </button>
                <hr className="my-1 border-slate-200" />
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;