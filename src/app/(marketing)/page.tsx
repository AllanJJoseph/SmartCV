import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Target, Zap, Shield } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function LandingPage() {
  return (
    <AuroraBackground className="flex-col items-center justify-start overflow-auto z-0">
      <div className="relative min-h-screen w-full flex flex-col items-center selection:bg-primary/30 z-10">
        
        {/* Navigation */}
        <nav className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="SmartCV Logo" width={240} height={56} className="h-14 w-auto object-contain" priority />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center justify-center text-center relative z-10 py-20 lg:py-32">
          <div className="inline-flex items-center justify-center rounded-full border border-border/50 bg-background/50 glass px-4 py-1.5 mb-8">
            <span className="flex items-center text-sm font-medium text-foreground drop-shadow-sm">
              <Sparkles className="w-4 h-4 mr-2 text-primary" /> Powered by Gemini API
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground max-w-4xl mb-6 drop-shadow-sm">
            The ultimate <span className="gradient-text">AI resume</span> & job tracking assistant.
          </h1>
          
          <p className="text-xl text-foreground font-medium max-w-2xl mb-12 leading-relaxed drop-shadow-md">
            Tailor your resume for every application, simulate recruiter interviews, and manage your entire job pipeline in one beautiful workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/register" className="flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
              Start formatting for free
            </Link>
            <a href="#features" className="flex items-center justify-center rounded-full border border-border/50 glass px-8 py-4 text-base font-bold text-foreground hover:bg-muted/50 transition-all w-full sm:w-auto drop-shadow-sm">
              Explore features
            </a>
          </div>
        </main>

        {/* Features Grid */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-3 lg:col-span-1 border border-border/50 glass rounded-3xl p-8 flex flex-col items-start gap-4 transition-all hover:-translate-y-1 hover:border-primary/30 shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Smart Tailoring</h3>
              <p className="text-foreground font-medium leading-relaxed">Instantly adapt your master profile to match any job description&apos;s ATS requirements.</p>
            </div>
            
            <div className="col-span-1 md:col-span-3 lg:col-span-1 border border-border/50 glass rounded-3xl p-8 flex flex-col items-start gap-4 transition-all hover:-translate-y-1 hover:border-primary/30 shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI Interviewer</h3>
              <p className="text-foreground font-medium leading-relaxed">Simulate a real technical or behavioral interview configured precisely for your target role.</p>
            </div>
            
            <div className="col-span-1 md:col-span-3 lg:col-span-1 border border-border/50 glass rounded-3xl p-8 flex flex-col items-start gap-4 transition-all hover:-translate-y-1 hover:border-primary/30 shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Pipeline Tracker</h3>
              <p className="text-foreground font-medium leading-relaxed">Never lose track. A Kanban board to manage applications, interviews, and offers effortlessly.</p>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="w-full border-t border-border/30 bg-background/80 glass relative z-10 mt-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col items-center justify-center gap-2 text-center">
            <Link href="/">
              <Image src="/logo.svg" alt="SmartCV Logo" width={160} height={38} className="h-10 w-auto object-contain mb-2 opacity-80 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-sm font-semibold text-foreground">Developed by SpyderByte</p>
            <div className="flex flex-col gap-1 mt-1 text-sm text-foreground font-medium">
              <span>Allan Joe Joseph</span>
              <span>Saurav Venu</span>
              <span>Amrita Shajikumar</span>
            </div>
          </div>
        </footer>
      </div>
    </AuroraBackground>
  );
}
