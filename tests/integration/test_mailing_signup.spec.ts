import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MailingListForm } from '@/components/MailingListForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Mailing List Signup Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should successfully submit mailing list signup', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        message: 'Successfully subscribed to mailing list',
        subscriber_id: 'test-id'
      })
    });

    render(<MailingListForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/mailing-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User'
        })
      });
    });

    expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
  });

  it('should display error for invalid email', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        errors: [{
          field: 'email',
          message: 'Invalid email format'
        }]
      })
    });

    render(<MailingListForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should handle duplicate email subscription', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        message: 'Email address already subscribed',
        error_code: 'EMAIL_EXISTS'
      })
    });

    render(<MailingListForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Existing User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email address already subscribed/i)).toBeInTheDocument();
    });
  });
});