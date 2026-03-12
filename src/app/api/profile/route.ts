import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email || undefined } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const profile = await prisma.masterProfile.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email || undefined } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json();
    
    const profile = await prisma.masterProfile.upsert({
      where: { userId: user.id },
      update: {
        field: body.field || "",
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        email: body.email || "",
        phone: body.phone || "",
        linkedin: body.linkedin || "",
        skills: body.skills || "",
        experience: body.experience || "",
        education: body.education || "",
        projects: body.projects || "",
        certifications: body.certifications || "",
        extraCurriculars: body.extraCurriculars || "",
        references: body.references || "",
        tenthGradeMarks: body.tenthGradeMarks || "",
        twelfthGradeMarks: body.twelfthGradeMarks || "",
        cgpa: body.cgpa || ""
      },
      create: {
        userId: user.id,
        field: body.field || "",
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        email: body.email || "",
        phone: body.phone || "",
        linkedin: body.linkedin || "",
        skills: body.skills || "",
        experience: body.experience || "",
        education: body.education || "",
        projects: body.projects || "",
        certifications: body.certifications || "",
        extraCurriculars: body.extraCurriculars || "",
        references: body.references || "",
        tenthGradeMarks: body.tenthGradeMarks || "",
        twelfthGradeMarks: body.twelfthGradeMarks || "",
        cgpa: body.cgpa || ""
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
