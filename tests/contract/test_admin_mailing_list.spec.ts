import { GET } from '@/pages/api/admin/mailing-list';
import { NextRequest } from 'next/server';

describe('GET /api/admin/mailing-list', () => {
  it('should return mailing list in JSON format', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/mailing-list', {
      headers: {
        'Authorization': 'Bearer valid-admin-token'
      }
    });
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('email');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('created_at');
      expect(data[0]).toHaveProperty('is_active');
    }
  });

  it('should return mailing list in CSV format', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/mailing-list?format=csv', {
      headers: {
        'Authorization': 'Bearer valid-admin-token'
      }
    });
    
    const response = await GET(request);
    const csvData = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/csv');
    expect(csvData).toContain('email,name,created_at');
  });

  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/mailing-list');
    
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/mailing-list', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});