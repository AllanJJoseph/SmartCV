import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: true,
        masterProfile: true,
      },
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if they have a linked GitHub account with an access token
    const githubAccount = dbUser.accounts.find(a => a.provider === "github");
    
    let reposRes;
    
    if (githubAccount && githubAccount.access_token) {
        // Fetch private and public repos for the authenticated user
        reposRes = await fetch("https://api.github.com/user/repos?sort=updated&per_page=5", {
            headers: {
                Authorization: `Bearer ${githubAccount.access_token}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "SmartCV-App",
            }
        });
    } else if (dbUser.masterProfile?.github) {
        // Fallback: Fetch public repos for the username from the provided profile URL
        // Expected format: https://github.com/username
        const urlParts = dbUser.masterProfile.github.split("/");
        const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        
        reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "SmartCV-App",
            }
        });
    } else {
        return NextResponse.json({ error: "No GitHub account linked or URL provided." }, { status: 400 });
    }

    if (!reposRes || !reposRes.ok) {
        return NextResponse.json({ error: "Failed to fetch from GitHub." }, { status: reposRes?.status || 500 });
    }

    const reposData = await reposRes.json();
    
    // Format the repos into SmartCV Project structure
    const formattedProjects = reposData.map((repo: any) => ({
       name: repo.name,
       description: [
           repo.description || "A software engineering project.",
           `Primary Language: ${repo.language || "Multiple"}`,
           `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`
       ].join("\n- ")
    }));

    return NextResponse.json(formattedProjects);

  } catch (error) {
    console.error("[GITHUB_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
