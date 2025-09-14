import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin authentication for all methods
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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Valid event ID is required'
    });
  }

  if (req.method === 'GET') {
    return handleGetEvent(req, res, id);
  } else if (req.method === 'PUT') {
    return handleUpdateEvent(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDeleteEvent(req, res, id);
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

async function handleGetEvent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('campaign_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleUpdateEvent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, description, date, location, is_published } = req.body;

    console.log('Update request body:', req.body);
    console.log('Date received:', date);

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) {
      // Convert the datetime-local string to a proper ISO date with timezone
      // datetime-local gives us "2025-10-19T14:00" which needs to be converted to ISO format
      const properDate = new Date(date).toISOString();
      updateData.date = properDate;
    }
    if (location !== undefined) updateData.location = location;
    if (is_published !== undefined) updateData.is_published = is_published;

    console.log('Update data being sent to database:', updateData);

    const { data, error } = await supabase
      .from('campaign_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update event'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleDeleteEvent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { error } = await supabase
      .from('campaign_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete event'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}