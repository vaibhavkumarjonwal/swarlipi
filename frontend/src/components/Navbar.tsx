'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Adjust the import path as needed
import { AuthProvider } from '@/context/AuthContext';
const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, username, logout } = useAuth();

  const handleHelp = () => {
    router.push('/help');
  };

  const handleSignOut = async () => {
    try {
      await logout();
      // The logout function already handles the redirect, so no need to do it here
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthProvider>
      <nav className="bg-gray-50 text-gray-900 px-3 py-3 flex justify-between items-center border-b border-gray-200 sticky top-0 z-[1000]">
      <h1 className="text-xl font-medium text-gray-800">SwarLipi</h1>
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-gray-700 font-medium">Hello, {username}</span>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleHelp}
              className="bg-blue-50 border border-blue-100 px-4 py-1 rounded-md text-blue-700 font-medium cursor-pointer transition-colors hover:bg-blue-100 hover:text-blue-800"
            >
              Help
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-50 border border-red-100 px-4 py-1 rounded-md text-red-700 font-medium cursor-pointer transition-colors hover:bg-red-100 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
    </AuthProvider>
  );
};

export default Navbar;