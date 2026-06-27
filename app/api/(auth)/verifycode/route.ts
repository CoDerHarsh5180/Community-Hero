import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const {username, code} = await req.json()

    const user = await User.findOne({username});

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
    console.log(user)
    if(code!==user.verificationToken){
        return NextResponse.json(
            {
                success:false,
                message:"Incorrect otp"
            },
            {status:500}
        )
    }
    // Update user status
    user.isVerified = true;
    user.verificationToken = '';
    await user.save();
    return NextResponse.json(
      {
        success:true,
        message:"User Verified Successfully"
      },
      {status:200}
    )
    // Redirect the user to your frontend login page
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}