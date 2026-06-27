import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/authHelper';

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    
    // Strict Admin-only check
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    await connectDB();
    
    // Unwrap params for Next.js 15 compatibility
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    
    // Get action from body (APPROVE or REJECT)
    const { action } = await req.json();

    let updateData = {};
    let message = "";

    if (action === 'APPROVE') {
      updateData = { role: 'AUTHORITY', approvalStatus: 'APPROVED' };
      message = "Authority access granted.";
    } else if (action === 'REJECT') {
      updateData = { role: 'CITIZEN', approvalStatus: 'REJECTED' };
      message = "Access rejected. User status set to Citizen.";
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: message,
      user: updatedUser 
    });
  } catch (error) {
    console.error("Authority Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}