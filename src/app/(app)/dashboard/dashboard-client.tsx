"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Briefcase } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import CountUp from "@/components/ui/count-up";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface DashboardClientProps {
  firstName: string;
  averageScore: number;
  activeApplications: number;
  interviewsScheduled: number;
  recentApplications: any[];
}

export default function DashboardClient({
  firstName,
  averageScore,
  activeApplications,
  interviewsScheduled,
  recentApplications,
}: DashboardClientProps) {
  return (
    <div className="absolute inset-0 z-0 overflow-auto mesh-bg p-6 lg:p-8">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8 w-full max-w-5xl relative z-10 pt-4 mx-auto"
      >
        <motion.div variants={item} className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground text-lg">Here is what&apos;s happening with your job applications today.</p>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border/50 glass p-6 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
            <h3 className="text-sm font-medium text-muted-foreground">Profile Completeness Score</h3>
            <div className="text-4xl justify-center py-2 font-semibold flex items-baseline gap-2">
              <CountUp to={averageScore} duration={2} /> <span className="text-lg font-normal text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium text-center bg-emerald-500/10 py-1.5 rounded-full">+2 points this week</p>
          </div>
          <div className="rounded-2xl border border-border/50 glass p-6 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
            <h3 className="text-sm font-medium text-muted-foreground">Active Applications</h3>
            <div className="text-4xl py-2 font-semibold justify-center flex">
              <CountUp to={activeApplications} duration={1.5} />
            </div>
            <p className="text-xs text-muted-foreground tracking-tight text-center bg-muted/50 py-1.5 rounded-full">{interviewsScheduled} interviews scheduled</p>
          </div>
          <div className="rounded-2xl border-0 bg-primary/95 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-4 items-start justify-between text-primary-foreground relative overflow-hidden transition-all hover:-translate-y-1 duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-1">Ready for your next role?</h3>
              <p className="text-sm opacity-90 leading-relaxed">Let our AI analyze your profile and tailor a resume perfectly suited for your target job.</p>
            </div>
            <Link href="/dashboard/resumes" className="relative z-10 inline-flex items-center gap-2 mt-2 text-sm font-semibold tracking-tight bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all duration-300">
              Create tailored resume <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item} className="flex flex-col gap-5 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              View pipeline
            </Link>
          </div>
          
          <div className="rounded-2xl border border-border/50 glass overflow-hidden shadow-sm">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No recent applications found. Get started by tailoring a resume!
              </div>
            ) : (
              <div className="divide-y divide-border/50 relative">
                {recentApplications.map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl border border-border/50 flex items-center justify-center bg-background/50 group-hover:bg-background group-hover:shadow-sm transition-all duration-300">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">{app.role}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{app.company} • {app.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-background/50 text-muted-foreground shadow-sm">
                        {app.status === "Interviewing" ? <Clock className="w-3.5 h-3.5 mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
