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
          const defaultSocialLinks: ContentBlock = {
            id: '',
            section_key: 'social_links',
            title: 'Connect With Us',
            content: JSON.stringify({
              email: 'cadenceforschoolboard@gmail.com',
              facebook: 'https://www.facebook.com/profile.php?id=61578333433751',
              instagram: 'https://instagram.com/cadence.collins.cares',
              tiktok: 'https://tiktok.com/@cadenceoxoxo',
              donation: 'https://secure.actblue.com/donate/cadence-collins-cares'
            }),
            photo_large: null,
            photo_medium: null,
            photo_small: null,
            photo_metadata: null,
            photo_alt: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return res.status(200).json(defaultSocialLinks);
        }
        return res.status(500).json({ message: 'Database error', error: error.message });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}