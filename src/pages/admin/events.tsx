'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { CampaignEvent, EventForm } from '@/types/database';

interface AdminEventsPageProps {}

export default function AdminEventsPage({}: AdminEventsPageProps) {
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampaignEvent | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventForm>();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || 'demo-admin-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EventForm) => {
    try {
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || 'demo-admin-token'}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingEvent ? 'Event updated successfully' : 'Event created successfully' 
        });
        setIsModalOpen(false);
        setEditingEvent(null);
        reset();
        fetchEvents();
      } else {
        const result = await response.json();
        setMessage({ type: 'error', text: result.message || 'Failed to save event' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handleEdit = (event: CampaignEvent) => {
    setEditingEvent(event);
    setValue('title', event.title);
    setValue('description', event.description);
    setValue('date', event.date.slice(0, 16)); // Format for datetime-local
    setValue('location', event.location);
    setValue('is_published', event.is_published);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || 'demo-admin-token'}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Event deleted successfully' });
        fetchEvents();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete event' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    reset();
    setIsModalOpen(true);
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
                Events Management
              </h1>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded p-4 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
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
                  Events ({events.length})
                </h2>
              </div>
              
              {events.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No events created yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                            {!event.is_published && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            )}
                            {event.is_published && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Published
                              </span>
                            )}
                          </h3>
                          <p className="text-campaign-600 font-medium mt-1">
                            {formatDate(event.date)}
                          </p>
                          <p className="text-gray-700 mt-2">
                            {event.description}
                          </p>
                          <p className="text-gray-600 mt-2">
                            📍 {event.location}
                          </p>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="text-campaign-600 hover:text-campaign-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    {...register('date', { required: 'Date is required' })}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    {...register('location', { required: 'Location is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register('is_published')}
                    type="checkbox"
                    id="is_published"
                    className="h-4 w-4 text-campaign-600 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-campaign-600 text-white rounded-md hover:bg-campaign-700"
                  >
                    {editingEvent ? 'Save' : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export for compatibility with test imports
export { AdminEventsPage };