import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { ContentBlock } from '@/types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section_key', 'social_links')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, return default social links
          return res.status(200).json({
            id: '',
            section_key: 'social_links',
            title: 'Connect With Us',
            content: '',
            email: 'cadenceforschoolboard@gmail.com',
            facebook: 'https://www.facebook.com/profile.php?id=61578333433751',
            instagram: 'https://instagram.com/cadence.collins.cares',
            tiktok: 'https://tiktok.com/@cadenceoxoxo',
            donation_link: 'https://secure.actblue.com/donate/cadence-collins-cares',
            photo_large: undefined,
            photo_medium: undefined,
            photo_small: undefined,
            photo_metadata: undefined,
            photo_alt: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        return res.status(500).json({ message: 'Database error', error: error.message });
      }

      // Parse JSON content and merge with base data
      try {
        const parsedContent = JSON.parse(data.content || '{}');
        res.status(200).json({
          ...data,
          ...parsedContent
        });
      } catch (parseError) {
        // If JSON parsing fails, return default structure
        res.status(200).json({
          ...data,
          email: 'cadenceforschoolboard@gmail.com',
          facebook: 'https://www.facebook.com/profile.php?id=61578333433751',
          instagram: 'https://instagram.com/cadence.collins.cares',
          tiktok: 'https://tiktok.com/@cadenceoxoxo',
          donation_link: 'https://secure.actblue.com/donate/cadence-collins-cares'
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}