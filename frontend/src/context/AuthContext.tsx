'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  const login = async (username: string, password: string) => {
    const res = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setIsAuthenticated(true);
      setUsername(data.username);
      router.push('/upload'); // Redirect to home or dashboard
    } else {
      alert('Login failed');
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    const res = await fetch('http://127.0.0.1:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setIsAuthenticated(true);
      setUsername(data.username);
      router.push('/login');
    } else {
      alert('Signup failed');
    }
  };

  const logout = async () => {
    await fetch('http://127.0.0.1:5000/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setIsAuthenticated(false);
    setUsername(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
