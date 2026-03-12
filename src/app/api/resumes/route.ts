import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all saved resumes for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("[RESUMES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST a new resume snapshot
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();
    const { title, content, targetJobUrl } = body;

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title,
        content: JSON.stringify(content),
        targetJobUrl: targetJobUrl || "",
      }
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("[RESUMES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
