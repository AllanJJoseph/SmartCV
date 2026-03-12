import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { company, role, status } = body;

    const newApplication = await prisma.application.create({
      data: {
        company,
        role,
        status: status || "applied",
        user: { connect: { email: session.user.email } },
      },
    });

    return NextResponse.json(newApplication);
  } catch (error) {
    console.error("Failed to create application:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
       return new NextResponse("Missing Application ID", { status: 400 });
    }

    // Ensure the application belongs to the user before deleting
    const app = await prisma.application.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!app || app.user.email !== session.user.email) {
        return new NextResponse("Unauthorized or Not Found", { status: 403 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("Failed to delete application:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
