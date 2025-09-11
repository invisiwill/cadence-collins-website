import { render, screen, waitFor } from '@testing-library/react';
import { EventsList } from '@/components/EventsList';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Events Display Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should display list of published events', async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Town Hall Meeting',
        description: 'Community discussion about school board priorities',
        date: '2025-10-15T19:00:00Z',
        location: 'Community Center, 123 Main St'
      },
      {
        id: '2',
        title: 'School Visit',
        description: 'Visit to local elementary school',
        date: '2025-10-20T14:00:00Z',
        location: 'Elementary School, 456 Oak St'
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockEvents
    });

    render(<EventsList />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/events');
    });

    expect(screen.getByText('Town Hall Meeting')).toBeInTheDocument();
    expect(screen.getByText(/community discussion/i)).toBeInTheDocument();
    expect(screen.getByText(/community center/i)).toBeInTheDocument();
    expect(screen.getByText('School Visit')).toBeInTheDocument();
  });

  it('should display formatted event dates', async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Test Event',
        description: 'Test description',
        date: '2025-10-15T19:00:00Z',
        location: 'Test location'
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockEvents
    });

    render(<EventsList />);

    await waitFor(() => {
      // Should display formatted date (implementation will determine exact format)
      expect(screen.getByText(/october|oct/i)).toBeInTheDocument();
    });
  });

  it('should handle empty events list', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => []
    });

    render(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading events/i)).toBeInTheDocument();
    });
  });
});