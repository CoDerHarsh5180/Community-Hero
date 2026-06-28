import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import { getSessionUser } from '@/lib/authHelper';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await connectDB();
    const issueId = (await params).id;

    const issue = await Issue.findById(issueId);
    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

    const hasUpvoted = issue.upvoters.includes(user.id as any);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvoters = issue.upvoters.filter(id => id.toString() !== user.id);
      issue.upvotesCount -= 1;
    } else {
      // Add upvote
      issue.upvoters.push(user.id as any);
      issue.upvotesCount += 1;
    }

    await issue.save();

    return NextResponse.json({ message: 'Success', upvotesCount: issue.upvotesCount });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}