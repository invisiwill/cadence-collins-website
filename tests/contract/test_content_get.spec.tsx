import { GET } from '@/pages/api/content/[section]';
import { NextRequest } from 'next/server';

describe('GET /api/content/{section}', () => {
  it('should return bio content', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/bio');
    
    const response = await GET(request, { params: { section: 'bio' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('section_key', 'bio');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('updated_at');
  });

  it('should return policy content', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/policy');
    
    const response = await GET(request, { params: { section: 'policy' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('section_key', 'policy');
  });

  it('should return contact content', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/contact');
    
    const response = await GET(request, { params: { section: 'contact' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('section_key', 'contact');
  });

  it('should return 404 for invalid section', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/invalid');
    
    const response = await GET(request, { params: { section: 'invalid' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error_code', 'NOT_FOUND');
  });
});