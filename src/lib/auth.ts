import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';
import { AdminUser } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(user: AdminUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyAdminAuth(request: NextRequest): JWTPayload | false {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  return decoded || false;
}

export async function authenticateUser(username: string, password: string): Promise<AdminUser | null> {
  try {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Remove password hash from returned user object
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as AdminUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export function createAuthResponse(message: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      error_code: 'UNAUTHORIZED'
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}