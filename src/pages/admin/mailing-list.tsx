'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MailingListSubscriber } from '@/types/database';

export default function AdminMailingListPage() {
  const [subscribers, setSubscribers] = useState<MailingListSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const response = await fetch('/api/admin/mailing-list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'demo-admin-token'}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscribers(data);
        } else {
          setError('Failed to fetch subscribers');
        }
      } catch (err) {
        setError('Failed to fetch subscribers');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscribers();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/mailing-list?format=csv', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'demo-admin-token'}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mailing-list-subscribers.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export CSV');
      }
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <Link
                href="/admin"
                className="text-campaign-600 hover:text-campaign-600 mb-2 inline-flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Mailing List Management
              </h1>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-300 rounded flex-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-600">{error}</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Subscribers ({subscribers.length})
                </h2>
              </div>
              
              {subscribers.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No subscribers yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscribed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subscriber.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a href={`mailto:${subscriber.email}`} className="text-campaign-600 hover:text-campaign-600">
                              {subscriber.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(subscriber.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {subscriber.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}