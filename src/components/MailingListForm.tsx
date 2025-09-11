'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MailingListSignupForm } from '@/types/database';

interface MailingListFormProps {
  className?: string;
}

export function MailingListForm({ className = '' }: MailingListFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MailingListSignupForm>();

  const onSubmit = async (data: MailingListSignupForm) => {
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(result.message || 'Successfully subscribed to mailing list');
        reset();
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          setSubmitError(result.errors.map((err: any) => err.message).join(', '));
        } else {
          setSubmitError(result.message || 'Failed to subscribe');
        }
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-campaign-600 mb-4">
        Stay Updated
      </h3>
      <p className="text-gray-600 mb-6">
        Join our mailing list to receive campaign updates and event announcements.
      </p>

      {submitMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
          {submitMessage}
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campaign-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            {...register('name', {
              required: 'Name is required',
              maxLength: {
                value: 100,
                message: 'Name must be 100 characters or less',
              },
            })}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campaign-500 focus:border-transparent"
            placeholder="Your Full Name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-campaign-600 text-white py-2 px-4 rounded-md hover:bg-campaign-700 focus:outline-none focus:ring-2 focus:ring-campaign-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}