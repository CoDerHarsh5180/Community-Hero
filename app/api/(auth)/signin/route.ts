import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const {identifier, password } = await req.json();
    
    // 1. Find user with password
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });
    console.log(user)
    if (!user || !(await bcrypt.compare(password, user.password as string))) {
      return NextResponse.json({success:false ,message: 'Invalid Identifier or Password' }, { status: 401 });
    }

    // 2. Check verification
    if (!user.isVerified) {
      return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // FIX #1: The TypeScript-safe way to remove hidden fields
    const userObj = user.toObject();
    const { password: _, verificationToken: __, ...safeUser } = userObj;

    // FIX #2: Create the response object first
    const response = NextResponse.json(
      { message: 'Login successful', user: safeUser }, 
      { status: 200 }
    );

    // FIX #2 (Continued): Attach the cookie directly to the response
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}