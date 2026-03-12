import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || undefined },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the resume belongs to the user
    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume || existingResume.userId !== user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[RESUME_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
