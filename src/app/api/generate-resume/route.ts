import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, jobContext } = body;

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Missing GEMINI_API_KEY", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert ATS resume writer.
      Here is a user's master profile: ${JSON.stringify(profile)}
      Here is the target job context/description: ${jobContext}
      
      Please rewrite and tailor the experience descriptions, project descriptions, and skills to closely match the keywords and requirements of the target job context. 
      Make it sound extremely professional, impact-driven, and concise. Do NOT hallucinate experiences they don't have, just reframe existing ones.
      
      Return ONLY a JSON object containing the exact same schema as the input profile, but with the rewritten 'experience', 'projects', and 'skills' fields.
      Do NOT wrap in markdown ticks.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from the response
    let cleanedText = responseText.trim();
    const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedText = jsonMatch[1].trim();
    }
    
    console.log("Raw AI Output:", cleanedText); // Debugging
    const tailoredProfile = JSON.parse(cleanedText);

    return NextResponse.json(tailoredProfile);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new NextResponse("AI Generation Failed", { status: 500 });
  }
}
