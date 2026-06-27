import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text, images } = await req.json();

    if (!text && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'Need text or images to enhance.' }, { status: 400 });
    }

    const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a professional civic infrastructure inspector. 
      Take the following rough notes and/or images provided by a citizen and write a highly professional, 
      objective, and detailed field report description (around 3-4 sentences). 
      Focus on the physical state, potential hazards, and urgency. 
      Do not include greetings or pleasantries, just the professional description.
      
      Citizen's rough notes: "${text || "No notes provided, rely purely on the images."}"
    `;

    const payload: any[] = [prompt];

    // If the frontend sent base64 images, attach them to the Gemini payload
    if (images && images.length > 0) {
      images.forEach((base64String: string) => {
        // Strip the data:image/jpeg;base64, prefix that FileReader adds
        const base64Data = base64String.split(',')[1];
        const mimeType = base64String.split(';')[0].split(':')[1];
        
        if (base64Data && mimeType) {
          payload.push({
            inlineData: { data: base64Data, mimeType: mimeType }
          });
        }
      });
    }

    const result = await aiModel.generateContent(payload);
    const enhancedText = result.response.text();

    return NextResponse.json({ enhancedText });

  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json({ error: 'Failed to enhance text' }, { status: 500 });
  }
}