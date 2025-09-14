import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const contentSchema = z.object({
  title: z.string().optional(), // Made optional for footer_signature
  subtitle: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  photo_large: z.string().nullable().optional(),
  photo_medium: z.string().nullable().optional(),
  photo_small: z.string().nullable().optional(),
  photo_alt: z.string().nullable().optional(),
  photo_metadata: z.object({
    originalName: z.string(),
    originalSize: z.number(),
    processedSizes: z.object({
      large: z.object({ width: z.number(), height: z.number(), size: z.number() }),
      medium: z.object({ width: z.number(), height: z.number(), size: z.number() }),
      small: z.object({ width: z.number(), height: z.number(), size: z.number() })
    }),
    processedAt: z.string()
  }).nullable().optional()
});

const validSections = ['hero_intro', 'bio', 'policy', 'contact', 'footer_left', 'footer_signature'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    // Validate section parameter
    const { section } = req.query;
    if (!section || typeof section !== 'string' || !validSections.includes(section)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid section',
        error_code: 'NOT_FOUND'
      });
    }

    // Validate input
    const validation = contentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const updateData = validation.data;

    // Check if content block exists
    const { data: existingContent } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('section_key', section)
      .single();

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
        error_code: 'NOT_FOUND'
      });
    }

    // Update content block
    const { data, error } = await supabase
      .from('content_blocks')
      .update({
        title: updateData.title,
        subtitle: updateData.subtitle,
        content: updateData.content,
        photo_large: updateData.photo_large,
        photo_medium: updateData.photo_medium,
        photo_small: updateData.photo_small,
        photo_alt: updateData.photo_alt,
        photo_metadata: updateData.photo_metadata,
        updated_at: new Date().toISOString()
      })
      .eq('section_key', section)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update content'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      ...data
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}