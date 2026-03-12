import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email || undefined },
    include: {
      masterProfile: true,
      applications: {
        orderBy: { updatedAt: 'desc' },
        take: 3
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const activeApplications = await prisma.application.count({
    where: {
      userId: user.id,
      status: { not: "rejected" }
    }
  });

  const interviewsScheduled = await prisma.application.count({
    where: {
      userId: user.id,
      status: "interviewing"
    }
  });

  // Calculate a "Completeness Score" based on the Master Profile
  let profileScore = 20; // Base score
  if (user.masterProfile) {
    if (user.masterProfile.firstName && user.masterProfile.lastName) profileScore += 10;
    if (user.masterProfile.linkedin || user.masterProfile.github) profileScore += 10;
    
    // Parse JSON arrays to see if they have data
    if (user.masterProfile.experience && user.masterProfile.experience !== "[]") profileScore += 25;
    if (user.masterProfile.education && user.masterProfile.education !== "[]") profileScore += 20;
    if (user.masterProfile.skills && user.masterProfile.skills !== "[]") profileScore += 15;
  } else {
    profileScore = 0; // Needs to create profile
  }

  const firstName = user.name?.split(" ")[0] || "User";

  // Format real applications
  const recentApplications = user.applications.map((app: any) => {
    const daysAgo = Math.floor((new Date().getTime() - new Date(app.appliedDate).getTime()) / (1000 * 3600 * 24));
    return {
      company: app.company,
      role: app.role,
      status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
      date: daysAgo === 0 ? "Today" : `${daysAgo} days ago`,
    };
  });

  return (
    <DashboardClient 
      firstName={firstName}
      averageScore={profileScore}
      activeApplications={activeApplications}
      interviewsScheduled={interviewsScheduled}
      recentApplications={recentApplications}
    />
  );
}
