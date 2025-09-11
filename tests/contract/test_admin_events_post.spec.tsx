import { POST } from '@/pages/api/admin/events';
import { NextRequest } from 'next/server';

describe('POST /api/admin/events', () => {
  it('should create new event with valid data', async () => {
    const eventData = {
      title: 'Town Hall Meeting',
      description: 'Community discussion about school board priorities',
      date: '2025-10-15T19:00:00Z',
      location: 'Community Center, 123 Main St',
      is_published: true
    };

    const request = new NextRequest('http://localhost:3000/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(eventData)
    });
    
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title', eventData.title);
    expect(data).toHaveProperty('description', eventData.description);
    expect(data).toHaveProperty('date', eventData.date);
    expect(data).toHaveProperty('location', eventData.location);
    expect(data).toHaveProperty('is_published', eventData.is_published);
    expect(data).toHaveProperty('created_at');
    expect(data).toHaveProperty('updated_at');
  });

  it('should reject invalid event data', async () => {
    const invalidData = {
      title: '', // Empty title should fail
      description: 'Valid description',
      date: '2025-10-15T19:00:00Z',
      location: 'Community Center'
    };

    const request = new NextRequest('http://localhost:3000/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(invalidData)
    });
    
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('errors');
  });

  it('should require authentication', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'Test description',
      date: '2025-10-15T19:00:00Z',
      location: 'Test location'
    };

    const request = new NextRequest('http://localhost:3000/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    
    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});