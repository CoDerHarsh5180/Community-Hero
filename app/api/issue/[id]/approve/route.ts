import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/authHelper';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await getSessionUser();
    
    // Strict Admin-only check
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    await connectDB();
    const targetUserId = params.id;

    // Find the user and update their approval status
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { approvalStatus: 'APPROVED' },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: `${updatedUser.name} has been approved for authority access.`,
      user: updatedUser 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}