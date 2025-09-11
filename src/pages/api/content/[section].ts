import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { sectionKeySchema } from '@/lib/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { section } = req.query;
    
    // Validate section parameter
    const validation = sectionKeySchema.safeParse(section);
    if (!validation.success) {
      return res.status(404).json({
        success: false,
        message: 'Invalid section',
        error_code: 'NOT_FOUND',
      });
    }

    const sectionKey = validation.data;

    // Query content block
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('section_key', sectionKey)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
        error_code: 'NOT_FOUND',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}