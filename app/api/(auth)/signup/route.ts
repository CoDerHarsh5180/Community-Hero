import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import  sendVerificationEmail  from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, username, email, password, role } = await req.json();

    // 1. Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 400 });
    }

    // 2. Hash password & create token
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = otpGenerator();

    // 3. Save User
    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || 'CITIZEN',
      verificationToken,
      isVerified:false
    });

    // 4. Send Email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: 'Account created! Please check your email to verify.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
const otpGenerator=()=>{
    const otp = Math.ceil(Math.random()*1000000)
    const otpStr = String(otp)
    let temp =""
    for(let i=0;i<6-otpStr.length;i++){
        temp+="0"
    }
    temp+=otpStr
    return temp
}