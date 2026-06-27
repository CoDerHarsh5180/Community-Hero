import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSessionUser();
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const officials = await User.aggregate([
      { 
        $match: { role: 'AUTHORITY' } 
      },
      {
        $lookup: {
          from: 'authorityaccesses',
          localField: '_id',
          foreignField: 'userId',
          as: 'accessData'
        }
      },
      {
        $unwind: {
          path: '$accessData',
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        // 🚀 CHANGED TO $addFields: This keeps name, email, department etc., intact!
        $addFields: {
          approvalStatus: { $ifNull: ['$accessData.approvalStatus', 'NOT_APPLICABLE'] },
          assignedCategories: { $ifNull: ['$accessData.assignedCategories', []] }
        }
      },
      {
        // Now we can safely use $project just to hide the password hash
        $project: {
          password: 0,
          accessData: 0 // We can hide the raw joined array since we flattened it
        }
      }
    ]);
    
    return NextResponse.json(officials);
  } catch (error) {
    console.error("Aggregation Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}