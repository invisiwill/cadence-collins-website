'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Campaign Admin' }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Try multiple sources for token to survive Fast Refresh
    let token = localStorage.getItem('admin_token') || 
                sessionStorage.getItem('admin_token') || 
                null;
    
    // Check URL parameter as backup for development Fast Refresh issues
    if (!token && router.query.token) {
      token = decodeURIComponent(router.query.token as string);
      // Store it back in localStorage for future use
      localStorage.setItem('admin_token', token);
      sessionStorage.setItem('admin_token', token);
      // Clean up the URL
      router.replace('/admin', undefined, { shallow: true });
    }
    
    if (!token) {
      setIsAuthenticated(false);
      router.push('/admin/login');
      return;
    }

    // For client-side, just check if token exists and has basic JWT structure
    // Server-side API calls will handle actual JWT validation
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // Basic JWT structure check - has header.payload.signature
        const payload = JSON.parse(atob(parts[1]));
        if (payload.userId && payload.username && payload.email) {
          setIsAuthenticated(true);
          setUser({
            userId: payload.userId,
            username: payload.username,
            email: payload.email
          });
          return;
        }
      }
    } catch (error) {
      // Token is malformed
    }
    
    // If we get here, token is invalid
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    router.push('/admin/login');
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campaign-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-2xl font-bold text-campaign-600">
                Cadence Collins
              </Link>
              <span className="ml-4 text-sm text-gray-500">Admin Portal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link 
              href="/admin" 
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                router.pathname === '/admin'
                  ? 'border-campaign-500 text-campaign-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/content" 
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                router.pathname === '/admin/content'
                  ? 'border-campaign-500 text-campaign-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </Link>
            <Link 
              href="/admin/events" 
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                router.pathname === '/admin/events'
                  ? 'border-campaign-500 text-campaign-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Events
            </Link>
            <Link 
              href="/admin/subscribers" 
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                router.pathname === '/admin/subscribers'
                  ? 'border-campaign-500 text-campaign-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscribers
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-campaign-600">{title}</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}