import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContentPage } from '@/pages/admin/content';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/admin/content',
      pathname: '/admin/content',
      query: {},
      asPath: '/admin/content',
      push: jest.fn(),
      replace: jest.fn()
    };
  },
}));

describe('Admin Content Management Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should display all content sections for editing', async () => {
    const mockContentBlocks = {
      bio: {
        id: '1',
        section_key: 'bio',
        title: 'About Cadence Collins',
        content: 'Cadence Collins is a dedicated community member...',
        updated_at: '2025-09-10T10:00:00Z'
      },
      policy: {
        id: '2',
        section_key: 'policy',
        title: 'Policy Priorities',
        content: '• Increase teacher support\n• Improve school safety',
        updated_at: '2025-09-10T10:00:00Z'
      },
      contact: {
        id: '3',
        section_key: 'contact',
        title: 'Get in Touch',
        content: 'Ready to support our campaign?',
        updated_at: '2025-09-10T10:00:00Z'
      }
    };

    // Mock GET requests for each content section
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockContentBlocks.bio
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockContentBlocks.policy
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockContentBlocks.contact
      });

    render(<AdminContentPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/content/bio');
      expect(fetch).toHaveBeenCalledWith('/api/content/policy');
      expect(fetch).toHaveBeenCalledWith('/api/content/contact');
    });

    expect(screen.getByText('About Cadence Collins')).toBeInTheDocument();
    expect(screen.getByText('Policy Priorities')).toBeInTheDocument();
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });

  it('should update bio content successfully', async () => {
    const originalBio = {
      id: '1',
      section_key: 'bio',
      title: 'About Cadence Collins',
      content: 'Original bio content',
      updated_at: '2025-09-10T10:00:00Z'
    };

    const updatedBio = {
      ...originalBio,
      title: 'Updated About Cadence',
      content: 'Updated bio content with new information',
      updated_at: '2025-09-10T14:00:00Z'
    };

    // Mock GET for initial load
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => originalBio
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) }) // policy
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) }) // contact
      // Mock PUT for updating content
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedBio
      });

    render(<AdminContentPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('About Cadence Collins')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('About Cadence Collins');
    const contentTextarea = screen.getByDisplayValue('Original bio content');
    const saveButton = screen.getAllByRole('button', { name: /save/i })[0]; // First save button (bio section)

    fireEvent.change(titleInput, { target: { value: 'Updated About Cadence' } });
    fireEvent.change(contentTextarea, { target: { value: 'Updated bio content with new information' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/content/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        },
        body: JSON.stringify({
          title: 'Updated About Cadence',
          content: 'Updated bio content with new information'
        })
      });
    });

    expect(screen.getByText(/content updated successfully/i)).toBeInTheDocument();
  });

  it('should update policy content with markdown formatting', async () => {
    const originalPolicy = {
      id: '2',
      section_key: 'policy',
      title: 'Policy Priorities',
      content: '• Basic policy point',
      updated_at: '2025-09-10T10:00:00Z'
    };

    const updatedPolicy = {
      ...originalPolicy,
      content: '• Increase teacher support and resources\n• Improve school safety and infrastructure\n• Expand access to arts and STEM programs',
      updated_at: '2025-09-10T14:00:00Z'
    };

    // Mock GET for initial load
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) }) // bio
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => originalPolicy
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) }) // contact
      // Mock PUT for updating content
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedPolicy
      });

    render(<AdminContentPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('• Basic policy point')).toBeInTheDocument();
    });

    const contentTextarea = screen.getByDisplayValue('• Basic policy point');
    const saveButton = screen.getAllByRole('button', { name: /save/i })[1]; // Second save button (policy section)

    fireEvent.change(contentTextarea, { 
      target: { 
        value: '• Increase teacher support and resources\n• Improve school safety and infrastructure\n• Expand access to arts and STEM programs' 
      } 
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/content/policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer ')
        },
        body: expect.stringContaining('Increase teacher support')
      });
    });

    expect(screen.getByText(/content updated successfully/i)).toBeInTheDocument();
  });

  it('should handle validation errors', async () => {
    const originalContent = {
      id: '1',
      section_key: 'bio',
      title: 'About Cadence Collins',
      content: 'Original content',
      updated_at: '2025-09-10T10:00:00Z'
    };

    // Mock GET for initial load
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => originalContent
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })
      // Mock PUT with validation error
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          errors: [{
            field: 'title',
            message: 'Title cannot be empty'
          }]
        })
      });

    render(<AdminContentPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('About Cadence Collins')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('About Cadence Collins');
    const saveButton = screen.getAllByRole('button', { name: /save/i })[0];

    // Clear the title to trigger validation error
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/title cannot be empty/i)).toBeInTheDocument();
    });
  });
});