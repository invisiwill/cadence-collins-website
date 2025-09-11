import { POST } from '@/pages/api/mailing-list';
import { NextRequest } from 'next/server';

describe('POST /api/mailing-list', () => {
  it('should accept valid mailing list signup', async () => {
    const request = new NextRequest('http://localhost:3000/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'voter@example.com',
        name: 'Jane Voter'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Successfully subscribed to mailing list');
    expect(data).toHaveProperty('subscriber_id');
  });

  it('should reject invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        name: 'Jane Voter'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('errors');
  });

  it('should reject duplicate email subscription', async () => {
    const requestData = {
      email: 'duplicate@example.com',
      name: 'Jane Voter'
    };

    // First signup
    const request1 = new NextRequest('http://localhost:3000/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    await POST(request1);

    // Duplicate signup
    const request2 = new NextRequest('http://localhost:3000/api/mailing-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const response = await POST(request2);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error_code', 'EMAIL_EXISTS');
  });
});