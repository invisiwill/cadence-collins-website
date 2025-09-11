import { exportSubscribersToCSV, getCSVHeaders } from '@/lib/csv-export';
import { MailingListSubscriber } from '@/types/database';

describe('CSV Export Utilities', () => {
  const mockSubscribers: MailingListSubscriber[] = [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      created_at: '2025-09-10T10:00:00Z',
      is_active: true
    },
    {
      id: '2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      created_at: '2025-09-10T11:00:00Z',
      is_active: true
    },
    {
      id: '3',
      email: 'inactive@example.com',
      name: 'Inactive User',
      created_at: '2025-09-10T09:00:00Z',
      is_active: false
    }
  ];

  describe('exportSubscribersToCSV', () => {
    it('should export subscribers to CSV format', () => {
      const csvOutput = exportSubscribersToCSV(mockSubscribers);
      
      expect(csvOutput).toContain('email,name,created_at,is_active');
      expect(csvOutput).toContain('john@example.com');
      expect(csvOutput).toContain('Jane Smith');
      expect(csvOutput).toContain('2025-09-10T10:00:00Z');
      expect(csvOutput).toContain('true');
      expect(csvOutput).toContain('false');
    });

    it('should handle empty subscriber list', () => {
      const csvOutput = exportSubscribersToCSV([]);
      
      // Papa Parse returns empty string for empty arrays
      expect(csvOutput).toBe('');
    });

    it('should properly escape special characters', () => {
      const subscribersWithSpecialChars: MailingListSubscriber[] = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'John \"Special\" Doe',
          created_at: '2025-09-10T10:00:00Z',
          is_active: true
        }
      ];

      const csvOutput = exportSubscribersToCSV(subscribersWithSpecialChars);
      
      expect(csvOutput).toContain('test@example.com');
      // CSV should properly handle quotes in names with double quotes
      expect(csvOutput).toContain('"John ""Special"" Doe"');
    });

    it('should include all required columns', () => {
      const csvOutput = exportSubscribersToCSV(mockSubscribers);
      const lines = csvOutput.split(/\r?\n/);
      const headers = lines[0].split(',');
      
      expect(headers).toContain('email');
      expect(headers).toContain('name');
      expect(headers).toContain('created_at');
      expect(headers).toContain('is_active');
    });

    it('should maintain correct order of subscribers', () => {
      const csvOutput = exportSubscribersToCSV(mockSubscribers);
      const lines = csvOutput.split(/\r?\n/);
      
      // Skip header, check data lines
      expect(lines[1]).toContain('john@example.com');
      expect(lines[2]).toContain('jane@example.com');
      expect(lines[3]).toContain('inactive@example.com');
    });
  });

  describe('getCSVHeaders', () => {
    it('should return correct CSV headers', () => {
      const headers = getCSVHeaders();
      
      expect(headers).toHaveProperty('Content-Type', 'text/csv');
      expect(headers).toHaveProperty('Content-Disposition');
      expect(headers['Content-Disposition']).toContain('attachment');
      expect(headers['Content-Disposition']).toContain('mailing-list-subscribers.csv');
    });

    it('should return headers as object', () => {
      const headers = getCSVHeaders();
      
      expect(typeof headers).toBe('object');
      expect(headers).not.toBeNull();
      expect(Object.keys(headers).length).toBeGreaterThan(0);
    });
  });
});