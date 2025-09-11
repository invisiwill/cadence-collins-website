import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminEventsPage } from '@/pages/admin/events';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/admin/events',
      pathname: '/admin/events',
      query: {},
      asPath: '/admin/events',
      push: jest.fn(),
      replace: jest.fn()
    };
  },
}));

describe('Admin Events Management Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should display list of all events for admin', async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Published Event',
        description: 'This event is published',
        date: '2025-10-15T19:00:00Z',
        location: 'Community Center',
        is_published: true,
        created_at: '2025-09-10T10:00:00Z',
        updated_at: '2025-09-10T10:00:00Z'
      },
      {
        id: '2',
        title: 'Draft Event',
        description: 'This event is a draft',
        date: '2025-10-20T14:00:00Z',
        location: 'School Auditorium',
        is_published: false,
        created_at: '2025-09-10T11:00:00Z',
        updated_at: '2025-09-10T11:00:00Z'
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockEvents
    });

    render(<AdminEventsPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/events', {
        headers: {
          'Authorization': expect.stringContaining('Bearer ')
        }
      });
    });

    expect(screen.getByText('Published Event')).toBeInTheDocument();
    expect(screen.getByText('Draft Event')).toBeInTheDocument();
    expect(screen.getByText(/published/i)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('should create new event successfully', async () => {
    const newEvent = {
      id: '3',
      title: 'New Event',
      description: 'New event description',
      date: '2025-11-01T18:00:00Z',
      location: 'New Location',
      is_published: true,
      created_at: '2025-09-10T12:00:00Z',
      updated_at: '2025-09-10T12:00:00Z'
    };

    // Mock GET for initial load
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => []
      })
      // Mock POST for creating event
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newEvent
      });

    render(<AdminEventsPage />);

    const createButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(createButton);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const dateInput = screen.getByLabelText(/date/i);
    const locationInput = screen.getByLabelText(/location/i);
    const submitButton = screen.getByRole('button', { name: /save event/i });

    fireEvent.change(titleInput, { target: { value: 'New Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'New event description' } });
    fireEvent.change(dateInput, { target: { value: '2025-11-01T18:00' } });
    fireEvent.change(locationInput, { target: { value: 'New Location' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        },
        body: JSON.stringify({
          title: 'New Event',
          description: 'New event description',
          date: '2025-11-01T18:00:00Z',
          location: 'New Location',
          is_published: true
        })
      });
    });

    expect(screen.getByText(/event created successfully/i)).toBeInTheDocument();
  });

  it('should update existing event', async () => {
    const existingEvent = {
      id: '1',
      title: 'Existing Event',
      description: 'Existing description',
      date: '2025-10-15T19:00:00Z',
      location: 'Existing Location',
      is_published: true,
      created_at: '2025-09-10T10:00:00Z',
      updated_at: '2025-09-10T10:00:00Z'
    };

    const updatedEvent = {
      ...existingEvent,
      title: 'Updated Event',
      updated_at: '2025-09-10T13:00:00Z'
    };

    // Mock GET for initial load
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [existingEvent]
      })
      // Mock PUT for updating event
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedEvent
      });

    render(<AdminEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Existing Event')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const titleInput = screen.getByDisplayValue('Existing Event');
    fireEvent.change(titleInput, { target: { value: 'Updated Event' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/events/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        },
        body: expect.stringContaining('Updated Event')
      });
    });

    expect(screen.getByText(/event updated successfully/i)).toBeInTheDocument();
  });

  it('should delete event', async () => {
    const eventToDelete = {
      id: '1',
      title: 'Event to Delete',
      description: 'This will be deleted',
      date: '2025-10-15T19:00:00Z',
      location: 'Delete Location',
      is_published: false,
      created_at: '2025-09-10T10:00:00Z',
      updated_at: '2025-09-10T10:00:00Z'
    };

    // Mock GET for initial load
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [eventToDelete]
      })
      // Mock DELETE for deleting event
      .mockResolvedValueOnce({
        ok: true,
        status: 204
      });

    render(<AdminEventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Event to Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/events/1', {
        method: 'DELETE',
        headers: {
          'Authorization': expect.stringContaining('Bearer ')
        }
      });
    });

    expect(screen.getByText(/event deleted successfully/i)).toBeInTheDocument();
  });
});