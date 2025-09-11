import { DELETE } from '@/pages/api/admin/events/[id]';
import { NextRequest } from 'next/server';

describe('DELETE /api/admin/events/{id}', () => {
  it('should delete existing event', async () => {
    const eventId = 'existing-event-id';

    const request = new NextRequest(`http://localhost:3000/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-admin-token'
      }
    });
    
    const response = await DELETE(request, { params: { id: eventId } });

    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existent event', async () => {
    const eventId = 'non-existent-event-id';

    const request = new NextRequest(`http://localhost:3000/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-admin-token'
      }
    });
    
    const response = await DELETE(request, { params: { id: eventId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error_code', 'NOT_FOUND');
  });

  it('should require authentication', async () => {
    const eventId = 'test-event-id';

    const request = new NextRequest(`http://localhost:3000/api/admin/events/${eventId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, { params: { id: eventId } });

    expect(response.status).toBe(401);
  });
});