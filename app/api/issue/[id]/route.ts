import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import { getSessionUser } from '@/lib/authHelper';
import User from '@/models/User';
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Await params for Next.js 15 compatibility
    const issueId = (await params).id;
    const userId = user.id;
    
    // 1. Fetch the issue to check current state
    const issue = await Issue.findById(issueId);
    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

    // 2. Safely compare Strings to ObjectIds
    const hasUpvoted = issue.upvoters.some((id) => id.toString() === userId.toString());

    let updatedIssue;

    if (hasUpvoted) {
      // 3A. Atomic Remove
      updatedIssue = await Issue.findByIdAndUpdate(
        issueId,
        { $pull: { upvoters: userId }, $inc: { upvotesCount: -1 } },
        { new: true }
      );
      
      // 🚀 NEW: Anti-abuse. Remove points if they remove their upvote
      if (issue.user.toString() !== userId.toString()) {
        await User.findByIdAndUpdate(issue.user, { $inc: { communityPoints: -5 } }); // Take from creator
      }
      await User.findByIdAndUpdate(userId, { $inc: { communityPoints: -2 } }); // Take from clicker

    } else {
      // 3B. Atomic Add
      updatedIssue = await Issue.findByIdAndUpdate(
        issueId,
        { $addToSet: { upvoters: userId }, $inc: { upvotesCount: 1 } },
        { new: true }
      );

      // 🚀 NEW: Award points! (Check prevents self-upvote farming)
      if (issue.user.toString() !== userId.toString()) {
        await User.findByIdAndUpdate(issue.user, { $inc: { communityPoints: 5 } }); // To creator
      }
      await User.findByIdAndUpdate(userId, { $inc: { communityPoints: 2 } }); // To clicker
    }

    // 4. Return the exact state to instantly update the frontend UI
    return NextResponse.json({ 
      success: true, 
      upvotesCount: updatedIssue?.upvotesCount || 0, 
      upvoters: updatedIssue?.upvoters || [] 
    });

  } catch (error) {
    console.error('Upvote error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}