import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { skills, targetRole } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Missing GEMINI_API_KEY", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Act as a high-end career coach and technical architect. Analyze the user's current skills against the target role: ${targetRole}.
      
      User's Current Skills:
      ${skills}
      
      Return a JSON object with the following structure:
      {
        "skillGaps": [
          { "skill": string, "priority": "high" | "medium" | "low", "reason": string }
        ],
        "roadmap": [
          { "phase": string, "goals": string[], "timeframe": string }
        ],
        "industryInsights": string[]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Analyzer API Error:", error);
    return new NextResponse(error.message || "Roadmap Generation Failed", { status: 500 });
  }
}
