import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '10' } = req.query;
    
    // Parse and validate limit parameter
    let limitNum = 10; // default
    if (typeof limit === 'string') {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 50) {
        limitNum = parsedLimit;
      }
    }

    // Query published events, ordered by date
    const { data, error } = await supabase
      .from('campaign_events')
      .select('id, title, description, date, location')
      .eq('is_published', true)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limitNum);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
      });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}