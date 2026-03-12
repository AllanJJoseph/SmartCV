"use client";

import { useState, useEffect } from "react";
import { Compass, GraduationCap, Trophy, ChevronRight, Loader2, Sparkles, BrainCircuit, Target, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalyzerData {
  skillGaps: Array<{ skill: string; priority: "high" | "medium" | "low"; reason: string }>;
  roadmap: Array<{ phase: string; goals: string[]; timeframe: string }>;
  industryInsights: string[];
}

export default function AnalyzerPage() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [data, setData] = useState<AnalyzerData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const profile = await res.json();
        setCurrentSkills(profile.skills || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const generateRoadmap = async () => {
    if (!targetRole.trim() || isGenerating) return;
    setIsGenerating(true);
    setData(null);

    try {
      const response = await fetch("/api/analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: currentSkills, targetRole }),
      });

      if (response.ok) {
        setData(await response.json());
      } else {
        const errText = await response.text();
        alert(`Generation failed: ${errText}`);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
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
             <div className="bg-orange-500/20 p-2.5 rounded-xl text-orange-400">
               <Compass className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Skill Analyzer</h1>
          </div>
          <p className="text-muted-foreground text-lg mt-2">Discover the skills you need to reach your dream role.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Area */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-2 text-orange-500 font-semibold text-sm">
                <Target className="w-4 h-4" /> Define Your Goal
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground px-1">Target Job Title</label>
                  <input 
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  />
                </div>
                <button 
                  onClick={generateRoadmap}
                  disabled={isGenerating || !targetRole.trim() || isFetchingProfile}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 hover:bg-orange-500 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  Generate My Roadmap
                </button>
              </div>
            </div>

            {data && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 bg-orange-500/[0.03]"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Industry Insights
                </h3>
                <div className="flex flex-col gap-4">
                  {data.industryInsights.map((insight, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0 mt-2" />
                      {insight}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!data ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[500px]"
                >
                  <Compass className="w-16 h-16 text-muted-foreground/20" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-foreground">Waiting for your goal</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">Enter the job title you&apos;re aiming for and we&apos;ll build a personalized path to get you there.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-8"
                >
                  {/* Skill Gaps */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-orange-500" /> Key Skill Gaps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.skillGaps.map((gap, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card/10 glass flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">{gap.skill}</span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                              gap.priority === "high" ? "bg-rose-500/10 text-rose-500" :
                              gap.priority === "medium" ? "bg-orange-500/10 text-orange-500" :
                              "bg-blue-500/10 text-blue-500"
                            )}>
                              {gap.priority}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{gap.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Roadmap */}
                  <div className="flex flex-col gap-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-orange-500" /> Your Learning Roadmap
                    </h3>
                    <div className="flex flex-col gap-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                      {data.roadmap.map((phase, i) => (
                        <div key={i} className="flex gap-6 relative group">
                          <div className="h-10 w-10 rounded-full border border-border/50 bg-background flex items-center justify-center shrink-0 z-10 group-hover:border-orange-500/50 transition-colors">
                            <div className="h-3 w-3 rounded-full bg-orange-500/20 group-hover:bg-orange-500 transition-colors" />
                          </div>
                          <div className="flex flex-col gap-3 pb-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold uppercase tracking-widest text-orange-500">{phase.timeframe}</span>
                              <h4 className="text-lg font-bold">{phase.phase}</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {phase.goals.map((goal, j) => (
                                <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                                  <Trophy className="w-3.5 h-3.5 text-orange-500" /> {goal}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
