
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import { getSessionUser } from '@/lib/authHelper';
import User from '@/models/User';


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    
    // RBAC Security Check
    if (!user || (user.role !== 'AUTHORITY' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { status } = await req.json();
    const validStatuses = ['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED'];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }

    await connectDB();
    
    const updatedIssue = await Issue.findByIdAndUpdate(
      (await params).id,
      { status: status },
      { new: true }
    );

    if (!updatedIssue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    // Add this logic right after updating the issue to RESOLVED
    if (status === 'RESOLVED') {
    await User.findByIdAndUpdate(
        updatedIssue.user, 
        { $inc: { communityPoints: 50 } } // Give them 50 points!
    );
    }
    return NextResponse.json({ message: `Status updated to ${status}`, issue: updatedIssue });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}