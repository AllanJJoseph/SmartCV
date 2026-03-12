import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { resume, jobDescription } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Missing GEMINI_API_KEY", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Act as an advanced Applicant Tracking System (ATS). Analyze the following resume against the job description.
      
      Resume:
      ${resume}
      
      Job Description:
      ${jobDescription}
      
      Return a JSON object with the following structure:
      {
        "score": number (0-100),
        "foundKeywords": string[],
        "missingKeywords": string[],
        "sectionAnalysis": {
          "experience": { "score": number, "feedback": string },
          "education": { "score": number, "feedback": string },
          "skills": { "score": number, "feedback": string }
        },
        "criticalImprovements": string[]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Heatmap API Error:", error);
    return new NextResponse(error.message || "Analysis Failed", { status: 500 });
  }
}
