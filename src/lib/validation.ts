import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email('Invalid email format');

// Mailing list signup validation
export const mailingListSchema = z.object({
  email: emailSchema,
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
});

// Event form validation
export const eventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string()
    .min(1, 'Description is required'),
  date: z.string()
    .refine((date) => {
      const eventDate = new Date(date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return eventDate >= thirtyDaysAgo;
    }, 'Event date must be within the last 30 days or in the future'),
  location: z.string()
    .min(1, 'Location is required')
    .max(300, 'Location must be 300 characters or less'),
  is_published: z.boolean().optional().default(true),
});

// Content form validation
export const contentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be 10,000 characters or less'),
});

// Section key validation
export const sectionKeySchema = z.enum(['bio', 'policy', 'contact', 'hero_intro', 'social_links']);

// Helper function to format validation errors for API responses
export function formatValidationErrors(error: z.ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}