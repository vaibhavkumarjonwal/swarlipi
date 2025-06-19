'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrebleClefIcon, SitarIcon, NotesIcon, TranslateIcon } from '@/components/icons/MusicalIcons';

const BACKEND_URL = process.env.BACKEND_URL || 'http://164.52.205.176:5000';

const Home: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
      } else {
        login(username, password);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background with musical elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-500"></div>
        <div className="absolute inset-0 bg-staff-lines opacity-20"></div>
        
        {/* Floating musical elements */}
        <div className="absolute top-20 left-20 animate-float">
          <SitarIcon className="text-white/80" size={60} />
        </div>
        <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <TrebleClefIcon className="text-white/60" size={48} />
        </div>
        <div className="absolute bottom-32 left-32 animate-float" style={{ animationDelay: '2s' }}>
          <NotesIcon className="text-white/70" size={52} />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse-gentle">
          <TranslateIcon className="text-white/80" size={56} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
              SwarLipi
            </h1>
            <div className="text-xl font-musical mb-8 space-y-2">
              <p className="opacity-90">स्वरलिपि</p>
              <p className="text-base opacity-75">Bridge Two Musical Worlds</p>
            </div>
            <p className="text-lg opacity-90 leading-relaxed mb-8">
              Transform Indian classical music notation into Western staff notation with the power of AI and deep musical understanding.
            </p>
            
            {/* Features List */}
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-90">PDF Upload & Processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-90">AI-Powered Recognition</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-90">Kern Format Export</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-90">Interactive Editing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <SitarIcon className="text-orange-500" size={32} />
                <TrebleClefIcon className="text-blue-600 absolute -top-1 -right-1" size={18} />
              </div>
              <div>
                <h1 className="text-3xl font-display font-semibold bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 bg-clip-text text-transparent">
                  SwarLipi
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                  संगीत • MUSIC
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-indian p-8 border border-orange-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600">
                Sign in to continue your musical journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <a
                    href="/signup"
                    className="font-medium text-orange-600 hover:text-orange-500 hover:underline transition-colors"
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer message */}
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500">
              Bridging Indian Classical and Western Musical Traditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
