import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { mailingListSchema, formatValidationErrors } from '@/lib/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = req.body;
    
    // Validate input
    const validation = mailingListSchema.safeParse(body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(validation.error),
      });
    }

    const { email, name } = validation.data;

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('mailing_list_subscribers')
      .select('id')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (existingSubscriber) {
      return res.status(409).json({
        success: false,
        message: 'Email address already subscribed',
        error_code: 'EMAIL_EXISTS',
      });
    }

    // Insert new subscriber
    const { data, error } = await supabase
      .from('mailing_list_subscribers')
      .insert([{ email, name }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to subscribe to mailing list',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to mailing list',
      subscriber_id: data.id,
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}