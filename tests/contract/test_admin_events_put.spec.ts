import { PUT } from '@/pages/api/admin/events/[id]';
import { NextRequest } from 'next/server';

describe('PUT /api/admin/events/{id}', () => {
  it('should update existing event with valid data', async () => {
    const eventId = 'existing-event-id';
    const updateData = {
      title: 'Updated Town Hall Meeting',
      description: 'Updated community discussion',
      date: '2025-10-16T19:00:00Z',
      location: 'Updated Community Center, 456 Oak St',
      is_published: false
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { id: eventId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id', eventId);
    expect(data).toHaveProperty('title', updateData.title);
    expect(data).toHaveProperty('description', updateData.description);
    expect(data).toHaveProperty('date', updateData.date);
    expect(data).toHaveProperty('location', updateData.location);
    expect(data).toHaveProperty('is_published', updateData.is_published);
    expect(data).toHaveProperty('updated_at');
  });

  it('should return 404 for non-existent event', async () => {
    const eventId = 'non-existent-event-id';
    const updateData = {
      title: 'Updated Event',
      description: 'Updated description',
      date: '2025-10-15T19:00:00Z',
      location: 'Updated location'
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { id: eventId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error_code', 'NOT_FOUND');
  });

  it('should require authentication', async () => {
    const eventId = 'test-event-id';
    const updateData = {
      title: 'Test Update',
      description: 'Test description',
      date: '2025-10-15T19:00:00Z',
      location: 'Test location'
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { id: eventId } });

    expect(response.status).toBe(401);
  });
});