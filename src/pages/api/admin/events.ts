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

  if (req.method === 'GET') {
    return handleGetEvents(req, res);
  } else if (req.method === 'POST') {
    return handleCreateEvent(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateEvent(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteEvent(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

async function handleGetEvents(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Query all events (published and unpublished)
    const { data, error } = await supabase
      .from('campaign_events')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events'
      });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleCreateEvent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, description, date, location, is_published = true } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, date, location'
      });
    }

    const { data, error } = await supabase
      .from('campaign_events')
      .insert({
        title,
        description,
        date: new Date(date).toISOString(), // Convert to proper ISO format
        location,
        is_published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create event'
      });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleUpdateEvent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, title, description, date, location, is_published } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date).toISOString(); // Convert to proper ISO format
    if (location !== undefined) updateData.location = location;
    if (is_published !== undefined) updateData.is_published = is_published;

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

async function handleDeleteEvent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

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