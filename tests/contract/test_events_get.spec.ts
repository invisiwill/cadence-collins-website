import { GET } from '@/pages/api/events';
import { NextRequest } from 'next/server';

describe('GET /api/events', () => {
  it('should return published events list', async () => {
    const request = new NextRequest('http://localhost:3000/api/events');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('title');
      expect(data[0]).toHaveProperty('description');
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('location');
      expect(data[0]).not.toHaveProperty('is_published'); // Should only return published
    }
  });

  it('should respect limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/events?limit=2');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(2);
  });

  it('should handle invalid limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/events?limit=invalid');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});