import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1. Run parallel aggregations for massive performance boosts
    const [statusStats, departmentStats] = await Promise.all([
      // Count total issues grouped by their current status
      Issue.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      // Count issues grouped by their AI-assigned department
      Issue.aggregate([
        { $group: { _id: "$aiDepartment", count: { $sum: 1 } } }
      ])
    ]);

    // 2. Format data cleanly for frontend charts (like Recharts or Chart.js)
    const statusSummary = statusStats.reduce((acc: any, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { REPORTED: 0, VERIFIED: 0, IN_PROGRESS: 0, RESOLVED: 0 });

    const departmentSummary = departmentStats.map(item => ({
      department: item._id || "Unassigned",
      count: item.count
    }));

    return NextResponse.json({
      totalReports: statusStats.reduce((sum, item) => sum + item.count, 0),
      byStatus: statusSummary,
      byDepartment: departmentSummary
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}