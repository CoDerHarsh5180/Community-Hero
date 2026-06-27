import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Fetch the top 10 citizens, sorted by points descending
    const topCitizens = await User.find({ role: 'CITIZEN' })
      .select('name username communityPoints profilePic') // Only send safe data
      .sort({ communityPoints: -1 })
      .limit(10);

    return NextResponse.json(topCitizens);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}