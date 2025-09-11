import Papa from 'papaparse';
import { MailingListSubscriber } from '@/types/database';

export function exportSubscribersToCSV(subscribers: MailingListSubscriber[]): string {
  const csvData = subscribers.map((subscriber) => ({
    email: subscriber.email,
    name: subscriber.name,
    created_at: subscriber.created_at,
    is_active: subscriber.is_active,
  }));

  return Papa.unparse(csvData, {
    header: true,
    columns: ['email', 'name', 'created_at', 'is_active'],
  });
}

export function getCSVHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename=mailing-list-subscribers.csv',
  };
}