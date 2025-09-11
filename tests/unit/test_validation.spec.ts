import { 
  mailingListSchema, 
  eventSchema, 
  contentSchema, 
  sectionKeySchema,
  formatValidationErrors 
} from '@/lib/validation';
import { z } from 'zod';

describe('Validation Utilities', () => {
  describe('mailingListSchema', () => {
    it('should validate correct mailing list data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'John Doe'
      };

      const result = mailingListSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'John Doe'
      };

      const result = mailingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidData = {
        email: 'test@example.com',
        name: ''
      };

      const result = mailingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name with invalid characters', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'John@Doe#'
      };

      const result = mailingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('eventSchema', () => {
    it('should validate correct event data', () => {
      const validData = {
        title: 'Town Hall Meeting',
        description: 'Community discussion',
        date: '2025-12-15T19:00:00Z',
        location: 'Community Center',
        is_published: true
      };

      const result = eventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        description: 'Community discussion',
        date: '2025-12-15T19:00:00Z',
        location: 'Community Center'
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject very old date', () => {
      const invalidData = {
        title: 'Old Event',
        description: 'Very old event',
        date: '2020-01-01T19:00:00Z',
        location: 'Somewhere'
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('contentSchema', () => {
    it('should validate correct content data', () => {
      const validData = {
        title: 'About Cadence',
        content: 'Cadence Collins is a dedicated community member...'
      };

      const result = contentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        title: 'Test Title',
        content: ''
      };

      const result = contentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('sectionKeySchema', () => {
    it('should validate correct section keys', () => {
      expect(sectionKeySchema.safeParse('bio').success).toBe(true);
      expect(sectionKeySchema.safeParse('policy').success).toBe(true);
      expect(sectionKeySchema.safeParse('contact').success).toBe(true);
    });

    it('should reject invalid section keys', () => {
      expect(sectionKeySchema.safeParse('invalid').success).toBe(false);
      expect(sectionKeySchema.safeParse('').success).toBe(false);
      expect(sectionKeySchema.safeParse('about').success).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format Zod validation errors correctly', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1)
      });

      const result = schema.safeParse({
        email: 'invalid-email',
        name: ''
      });

      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.error);
        
        expect(formattedErrors).toHaveLength(2);
        expect(formattedErrors[0]).toHaveProperty('field');
        expect(formattedErrors[0]).toHaveProperty('message');
        expect(formattedErrors[0].field).toBe('email');
      }
    });
  });
});