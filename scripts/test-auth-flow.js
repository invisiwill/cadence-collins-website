#!/usr/bin/env node

const jwt = require('jsonwebtoken');

async function testAuthFlow() {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  
  console.log('Testing JWT token generation and verification...');
  console.log('JWT_SECRET:', JWT_SECRET);
  
  // Create a test payload similar to what the login API creates
  const testUser = {
    userId: 'test-user-id',
    username: 'admin',
    email: 'admin@cadencecollins.com'
  };

  try {
    // Generate token
    console.log('\n1. Generating token...');
    const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
    console.log('Token generated successfully:', token.substring(0, 50) + '...');

    // Verify token
    console.log('\n2. Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded);

    // Test with Bearer format (like API expects)
    console.log('\n3. Testing Bearer format extraction...');
    const authHeader = `Bearer ${token}`;
    const extractedToken = authHeader.replace('Bearer ', '');
    const verifiedExtracted = jwt.verify(extractedToken, JWT_SECRET);
    console.log('Bearer format works:', verifiedExtracted.username);

    console.log('\n✅ JWT authentication flow is working correctly');
    
    // Now test a real login API call
    console.log('\n4. Testing real login API call...');
    const response = await fetch('http://localhost:3008/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    const result = await response.json();
    console.log('Login API response:', response.status, result);

    if (result.success && result.data.token) {
      console.log('\n5. Testing admin API with token...');
      const eventsResponse = await fetch('http://localhost:3008/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${result.data.token}`
        }
      });
      
      console.log('Events API response:', eventsResponse.status);
      if (!eventsResponse.ok) {
        const errorResult = await eventsResponse.json();
        console.log('Events API error:', errorResult);
      } else {
        console.log('✅ Admin API calls working with token');
      }
    }

  } catch (error) {
    console.error('❌ Error in auth flow:', error);
  }
}

testAuthFlow();