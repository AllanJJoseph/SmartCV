"use client";

import { useState, useEffect } from "react";
import { Activity, Search, AlertCircle, CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatmapData {
  score: number;
  foundKeywords: string[];
  missingKeywords: string[];
  sectionAnalysis: {
    experience: { score: number; feedback: string };
    education: { score: number; feedback: string };
    skills: { score: number; feedback: string };
  };
  criticalImprovements: string[];
}

export default function HeatmapPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [data, setData] = useState<HeatmapData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const profile = await res.json();
        // Construct a simple string representation for analysis
        const content = `
          Name: ${profile.firstName} ${profile.lastName}
          Experience: ${profile.experience}
          Education: ${profile.education}
          Skills: ${profile.skills}
        `;
        setResumeContent(content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const analyzeResume = async () => {
    if (!jobDescription.trim() || !resumeContent.trim()) return;
    setIsAnalyzing(true);
    setData(null);

    try {
      const response = await fetch("/api/heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeContent, jobDescription }),
      });

      if (response.ok) {
        setData(await response.json());
      } else {
        const errText = await response.text();
        alert(`Analysis failed: ${errText}`);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-auto mesh-bg p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8 w-full max-w-6xl relative z-10 pt-4 mx-auto pb-20"
      >
        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400">
               <Activity className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Resume Heatmap</h1>
          </div>
          <p className="text-muted-foreground text-lg mt-2">See exactly how ATS systems score your resume against a job description.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl border border-border/50 glass p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> Step 1: Target Position
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-foreground px-1">Job Description</label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[300px] w-full rounded-xl border border-border/50 bg-background/50 p-4 text-sm transition-all focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none"
                />
              </div>
              <button 
                onClick={analyzeResume}
                disabled={isAnalyzing || !jobDescription.trim() || isFetchingProfile}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Run Heatmap Analysis
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!data ? (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[500px]"
                >
                  <Activity className="w-16 h-16 text-muted-foreground/20" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-foreground">Waiting for input</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">Paste a job description and click analyze to see your resume&apos;s ATS performance.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-6"
                >
                  {/* Score & Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border/50 glass p-8 flex flex-col items-center justify-center text-center gap-4">
                      <div className="relative h-40 w-40 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90">
                          <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-border/30" />
                          <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * data.score) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold">{data.score}</span>
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Match Score</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-semibold text-lg">
                          {data.score > 80 ? "Strong Match!" : data.score > 60 ? "Good Potential" : "Significant Gaps"}
                        </h4>
                        <p className="text-xs text-muted-foreground">Based on ATS keyword and structure analysis.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 glass p-8 flex flex-col gap-6">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-emerald-500" /> Section Strength
                      </h4>
                      <div className="flex flex-col gap-4">
                        {Object.entries(data.sectionAnalysis).map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="capitalize text-muted-foreground">{key}</span>
                              <span className="font-semibold">{value.score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${value.score}%` }}
                                className="h-full bg-emerald-500/80"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="rounded-2xl border border-border/50 glass p-8 flex flex-col gap-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Keyword Analysis</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.foundKeywords.map((kw, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> {kw}
                        </span>
                      ))}
                      {data.missingKeywords.map((kw, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="rounded-2xl border border-border/50 glass p-8 flex flex-col gap-6 bg-emerald-500/[0.02]">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> Critical Improvements
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.criticalImprovements.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed p-4 rounded-xl border border-border/50 bg-background/50">
                          <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
