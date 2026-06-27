// app/api/issues/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import User from '@/models/User';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper: Convert File object to Cloudinary upload stream
const uploadToCloudinary = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'community_hero' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url as string);
      }
    ).end(buffer);
  });
};

// Helper: Convert File object to Gemini's expected multimodal structure
const fileToGenerativePart = async (file: File) => {
  const bytes = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(bytes).toString("base64"),
      mimeType: file.type
    },
  };
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    // Use getAll but filter out any empty entries or empty text definitions
    const files = formData.getAll('files') as File[]; 
    const category = formData.get('category') as string;
    const detail = formData.get('detail') as string;
    const addressText = formData.get('addressText') as string;
    const lat = formData.get('lat') as string;
    const lng = formData.get('lng') as string;
    const userId = formData.get('userId') as string; 

    // Validation: If there is no image, there MUST be a detailed description
    if ((!files || files.length === 0 || files[0].size === 0) && !detail?.trim()) {
      return NextResponse.json(
        { error: 'Please provide either an image or a detailed description of the issue.' }, 
        { status: 400 }
      );
    }

    // Check if a valid image file was actually uploaded
    const hasImages = files && files.length > 0 && files[0].size > 0;

    let secureMediaUrls: string[] = [];
    let geminiContentPayload: any[] = [];

    // 1. Build strict structural configuration for Gemini JSON output
    const jsonSchema = {
      type: SchemaType.OBJECT as const,
      properties: {
        aiCategory: { 
          type: SchemaType.STRING as const, 
          description: "Cleaned architectural name of the issue (e.g., Pothole, Broken Streetlight, Noise Pollution, Illegal Dumping)." 
        },
        aiSeverity: { 
          type: SchemaType.INTEGER as const, 
          description: "Priority score from 1 (Low priority) to 5 (Critical safety hazard/imminent danger)." 
        },
        aiDepartment: { 
          type: SchemaType.STRING as const, 
          description: "The municipal department best suited to handle this (e.g., Public Works, Sanitation, Electricity, Water & Sewage, Law Enforcement)." 
        }
      },
      required: ["aiCategory", "aiSeverity", "aiDepartment"],
    };

    const aiModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
      }
    });

    const aiPrompt = `
      You are an automated civic triage assistant for the 'Community Hero' municipal system.
      Analyze the provided citizen data to extract triage parameters.
      
      User-Submitted Category: ${category}
      User-Submitted Description: ${detail || "No description text provided."}
      
      Instructions:
      - If an image is provided, rely heavily on visual cues alongside the text.
      - If NO image is provided, perform your assessment strictly based on the text description context.
      - Determine the definitive civic category, calculate an objective severity score (1-5), and assign the correct target department.
    `;

    geminiContentPayload.push(aiPrompt);

    // 2. Conditional Execution Stream
    if (hasImages) {
      // Run Cloudinary uploads concurrently
      const cloudinaryPromise = Promise.all(files.map(uploadToCloudinary));
      
      // Convert first image for visual data track
      const geminiImagePart = await fileToGenerativePart(files[0]);
      geminiContentPayload.push(geminiImagePart);

      // Execute both Cloudinary and Gemini concurrently
      const [urls, geminiResult] = await Promise.all([
        cloudinaryPromise,
        aiModel.generateContent(geminiContentPayload)
      ]);

      secureMediaUrls = urls;
      var aiResponseText = geminiResult.response.text();
    } else {
      // Pure text evaluation stream (skips Cloudinary entirely)
      const geminiResult = await aiModel.generateContent(geminiContentPayload);
      var aiResponseText = geminiResult.response.text();
    }

    // 3. Parse triage results safely
    const triageData = JSON.parse(aiResponseText);

    // 4. Write document back to MongoDB Atlas
    const newIssue = await Issue.create({
      category,
      user: userId,
      detail,
      mediaUrl: secureMediaUrls, // Will correctly save as an empty array [] if no images exist
      addressText,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)], 
      },
      aiCategory: triageData.aiCategory, 
      aiSeverity: triageData.aiSeverity,
      aiDepartment: triageData.aiDepartment
    });
    await User.findByIdAndUpdate(userId, { 
      $inc: { communityPoints: 10 } 
    });
    return NextResponse.json({ 
      message: 'Issue reported and triaged successfully!', 
      issue: newIssue 
    }, { status: 201 });

  } catch (error) {
    console.error('Issue creation and triage error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radiusInMeters = parseInt(searchParams.get('radius') || '5000'); // Default 5km

    // If no coordinates are passed, just return the 50 most recent global issues
    if (!lat || !lng) {
      const recentIssues = await Issue.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name username profilePic');
      return NextResponse.json(recentIssues);
    }

    // Geospatial Query: Find issues near the user's GPS coordinates
    const nearbyIssues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat], // MongoDB expects [Longitude, Latitude]
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).populate('user', 'name username profilePic');

    return NextResponse.json(nearbyIssues);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}