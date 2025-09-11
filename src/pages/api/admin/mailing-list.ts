import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

function exportSubscribersToCSV(subscribers: any[]) {
  const headers = ['Name', 'Email', 'Subscribed Date', 'Status'];
  const rows = subscribers.map(sub => [
    sub.name,
    sub.email,
    new Date(sub.created_at).toLocaleDateString(),
    sub.is_active ? 'Active' : 'Inactive'
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header required',
        error_code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error_code: 'UNAUTHORIZED'
      });
    }

    const { format = 'json' } = req.query;

    // Query all subscribers
    const { data, error } = await supabase
      .from('mailing_list_subscribers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mailing list'
      });
    }

    const subscribers = data || [];

    // Return CSV format if requested
    if (format === 'csv') {
      const csvData = exportSubscribersToCSV(subscribers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=mailing-list-subscribers.csv');
      return res.status(200).send(csvData);
    }

    // Default: return JSON format
    return res.status(200).json(subscribers);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}