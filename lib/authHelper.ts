// lib/authHelper.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const getSessionUser = async () => {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: string; 
      role: string; 
      department?: string 
    };
    return decoded;
  } catch (error) {
    return null;
  }
};