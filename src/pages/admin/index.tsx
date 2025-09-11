'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminStats {
  totalSubscribers: number;
  totalEvents: number;
  publishedEvents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({ 
    totalSubscribers: 0, 
    totalEvents: 0, 
    publishedEvents: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Try multiple sources for token to survive Fast Refresh
        const token = localStorage.getItem('admin_token') || 
                     sessionStorage.getItem('admin_token') || 
                     null;
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [subscribersRes, eventsRes] = await Promise.all([
          fetch('/api/admin/mailing-list', { headers }),
          fetch('/api/admin/events', { headers })
        ]);

        if (subscribersRes.ok && eventsRes.ok) {
          const [subscribers, events] = await Promise.all([
            subscribersRes.json(),
            eventsRes.json()
          ]);

          setStats({
            totalSubscribers: subscribers.length || 0,
            totalEvents: events.length || 0,
            publishedEvents: events.filter((e: any) => e.is_published).length || 0
          });
        } else {
          // If unauthorized, clear token and redirect to login
          if (subscribersRes.status === 401 || eventsRes.status === 401) {
            localStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
          }
        }
      } catch (error) {
        // Error fetching stats - silently fail in development
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-[#87ceeb] to-[#87ceeb]/80 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Total Subscribers</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.totalSubscribers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#ff7f50] to-[#ff7f50]/80 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Total Events</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.totalEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Published Events</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.publishedEvents}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/subscribers"
              className="bg-campaign-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-campaign-600 transition-colors text-center"
            >
              Manage Subscribers
            </Link>
            <Link
              href="/admin/events"
              className="bg-accent-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors text-center"
            >
              Manage Events
            </Link>
            <Link
              href="/admin/content"
              className="bg-campaign-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-campaign-600 transition-colors text-center"
            >
              Edit Content
            </Link>
            <Link
              href="/"
              target="_blank"
              className="border-2 border-campaign-500 text-campaign-500 px-8 py-3 rounded-lg font-semibold hover:bg-campaign-500 hover:text-white transition-colors text-center"
            >
              View Website
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-500 text-center">
              Activity tracking will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}