import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Check if social_links section exists
    const { data: existingData } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('section_key', 'social_links')
      .single();

    let result;
    if (existingData) {
      // Update existing
      const { data, error } = await supabase
        .from('content_blocks')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('section_key', 'social_links')
        .select()
        .single();

      if (error) {
        return res.status(500).json({ message: 'Database error', error: error.message });
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('content_blocks')
        .insert({
          section_key: 'social_links',
          title,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ message: 'Database error', error: error.message });
      }
      result = data;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Social links update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}