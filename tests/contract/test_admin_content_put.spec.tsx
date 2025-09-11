import { PUT } from '@/pages/api/admin/content/[section]';
import { NextRequest } from 'next/server';

describe('PUT /api/admin/content/{section}', () => {
  it('should update bio content', async () => {
    const section = 'bio';
    const updateData = {
      title: 'Updated About Cadence',
      content: 'Updated bio content with new information about Cadence Collins.'
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/content/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { section } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('section_key', section);
    expect(data).toHaveProperty('title', updateData.title);
    expect(data).toHaveProperty('content', updateData.content);
    expect(data).toHaveProperty('updated_at');
  });

  it('should update policy content', async () => {
    const section = 'policy';
    const updateData = {
      title: 'Updated Policy Priorities',
      content: 'Updated policy positions and priorities.'
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/content/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { section } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('section_key', section);
    expect(data).toHaveProperty('title', updateData.title);
  });

  it('should return 404 for invalid section', async () => {
    const section = 'invalid';
    const updateData = {
      title: 'Test Title',
      content: 'Test content'
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/content/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-admin-token'
      },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { section } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error_code', 'NOT_FOUND');
  });

  it('should require authentication', async () => {
    const section = 'bio';
    const updateData = {
      title: 'Test Title',
      content: 'Test content'
    };

    const request = new NextRequest(`http://localhost:3000/api/admin/content/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { section } });

    expect(response.status).toBe(401);
  });
});