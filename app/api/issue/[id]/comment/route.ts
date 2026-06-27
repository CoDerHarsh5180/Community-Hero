import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import { getSessionUser } from '@/lib/authHelper';
import User from '@/models/User';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });

    await connectDB();
    
    // Use $push to add the comment directly to the array
    const updatedIssue = await Issue.findByIdAndUpdate(
      (await params).id,
      {
        $push: {
          comments: {
            user: user.id,
            text: text,
            createdAt: new Date()
          }
        }
      },
      { new: true } // Returns the updated document
    ).populate('comments.user', 'name username');

    if (!updatedIssue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

    await User.findByIdAndUpdate(user.id, { $inc: { communityPoints: 3 } });

    // 2. Reward the creator of the issue (+5) ONLY if it is not a self-comment
    if (updatedIssue.user.toString() !== user.id.toString()) {
      await User.findByIdAndUpdate(updatedIssue.user, { $inc: { communityPoints: 5 } });
    }

    return NextResponse.json({ message: 'Comment added', issue: updatedIssue });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}