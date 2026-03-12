"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Github, Linkedin } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isLinkedinLoading, setIsLinkedinLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Create user
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Registration failed");
      }

      // Auto login after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Could not log in after registration");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const loginWithGithub = async () => {
    setIsGithubLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  const loginWithLinkedin = async () => {
    setIsLinkedinLoading(true);
    await signIn("linkedin", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4 relative overflow-hidden py-12">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>
      
      <div className="w-full max-w-md p-8 rounded-3xl border border-border/50 glass shadow-2xl relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight gradient-text inline-block">Create an account</h1>
          <p className="text-muted-foreground text-sm">Join SmartCV to start optimizing your job applications.</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80 pl-1" htmlFor="name">Full Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              className="bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80 pl-1" htmlFor="email">Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80 pl-1" htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              minLength={6}
              className="bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || isGoogleLoading}
            className="mt-2 w-full flex items-center justify-center bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0c0c0d] px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={loginWithGoogle}
            disabled={isLoading || isGoogleLoading || isGithubLoading}
            className="w-full flex items-center justify-center gap-2 bg-background border border-border/50 hover:bg-muted/50 py-2.5 rounded-xl font-medium transition-colors text-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google
          </button>

          <button 
            type="button"
            onClick={loginWithGithub}
            disabled={isLoading || isGoogleLoading || isGithubLoading || isLinkedinLoading}
            className="w-full flex items-center justify-center gap-2 bg-background border border-border/50 hover:bg-muted/50 py-2.5 rounded-xl font-medium transition-colors text-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGithubLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
            GitHub
          </button>

          <button 
            type="button"
            onClick={loginWithLinkedin}
            disabled={isLoading || isGoogleLoading || isGithubLoading || isLinkedinLoading}
            className="w-full flex items-center justify-center gap-2 bg-background border border-border/50 hover:bg-muted/50 py-2.5 rounded-xl font-medium transition-colors text-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLinkedinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Linkedin className="w-5 h-5 text-[#0A66C2]" />}
            LinkedIn
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
