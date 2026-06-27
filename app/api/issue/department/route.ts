import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import { getSessionUser } from '@/lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || (sessionUser.role !== 'AUTHORITY' && sessionUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Allow the frontend to filter by status (e.g., ?status=REPORTED)
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // Build the query: If they are an Admin, show everything. If Authority, show only their department.
    const query: any = {};
    if (sessionUser.role === 'AUTHORITY') {
      query.aiDepartment = sessionUser.department; // e.g., "Public Works"
    }
    if (statusFilter) {
      query.status = statusFilter;
    }

    const assignedIssues = await Issue.find(query)
      .sort({ aiSeverity: -1, createdAt: -1 }) // Sort by critical severity first!
      .populate('user', 'name');

    return NextResponse.json(assignedIssues);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}