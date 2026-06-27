import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AuthorityAccess from '@/models/AuthorityAccess';
import { getSessionUser } from '@/lib/authHelper';

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    const { action, assignedCategories } = await req.json();

    let updateData = {};
    if (action === 'UPDATE_ACCESS') {
      updateData = { approvalStatus: 'APPROVED', assignedCategories: assignedCategories || [] };
    } else if (action === 'REVOKE') {
      updateData = { approvalStatus: 'REJECTED', assignedCategories: [] };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 🚀 UPSERT: If it exists, update it. If it doesn't, create it!
    const accessRecord = await AuthorityAccess.findOneAndUpdate(
      { userId: targetUserId },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Access updated", access: accessRecord });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}