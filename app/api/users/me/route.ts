import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Issue from '@/models/Issue';
import { getSessionUser } from '@/lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // 1. Get the full user profile
    const user = await User.findById(sessionUser.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Get all issues reported by this specific user
    const myIssues = await Issue.find({ user: sessionUser.id })
      .sort({ createdAt: -1 });

    // FIX: Use safe TypeScript destructuring instead of the 'delete' keyword
    const userObj = user.toObject();
    const { password: _, verificationToken: __, ...safeUser } = userObj;

    return NextResponse.json({
      profile: safeUser,
      reports: myIssues
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}