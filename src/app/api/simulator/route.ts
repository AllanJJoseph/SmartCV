import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, jobDescription } = body;

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Missing GEMINI_API_KEY", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: `You are a professional, slightly tough but fair technical recruiter named "Gemini Recruiter". 
        You are interviewing a candidate for the following role: ${jobDescription}. 
        
        Your goal is to conduct a realistic interview. 
        - Ask ONE focused question at a time.
        - Start with a brief introduction if this is the first message.
        - Mix technical questions (based on the JD) and behavioral questions.
        - After the candidate answers, briefly acknowledge their point, perhaps offer a tiny bit of feedback or ask for clarification, then move to the NEXT question.
        - Keep your responses concise (2-4 sentences). 
        - Stay in character at all times.`
    });

    // Format previous messages for Gemini's history structure
    const history = (messages || []).slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || "" }],
    }));

    const chat = model.startChat({
      history,
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ message: responseText });
  } catch (error: any) {
    console.error("Simulator API Error:", error);
    return new NextResponse(error.message || "Simulation Failed", { status: 500 });
  }
}
