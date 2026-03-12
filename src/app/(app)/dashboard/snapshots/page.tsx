"use client";

import { useState, useEffect } from "react";
import { FolderHeart, Clock, Link as LinkIcon, Upload, Trash2, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SnapshotsPage() {
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSavedResumes();
  }, []);

  const fetchSavedResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        setSavedResumes(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoadingResumes(false);
  };

  const onLoadResume = (resume: any) => {
    localStorage.setItem("resumeToLoad", resume.content);
    if(resume.targetJobUrl) {
        localStorage.setItem("resumeJobUrl", resume.targetJobUrl);
    }
    router.push("/dashboard/resumes");
  };

  const onDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved snapshot? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedResumes(savedResumes.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-auto mesh-bg p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8 w-full max-w-4xl relative z-10 pt-4 mx-auto"
      >
        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
             <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-400">
               <FolderHeart className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Saved Snapshots</h1>
          </div>
          <p className="text-muted-foreground text-lg mt-2">Manage and reload your tailored resume snapshots.</p>
        </div>

        <div className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 min-h-[50vh]">
            {isLoadingResumes ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Fetching your snapshots...</span>
                </div>
            ) : savedResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground text-center px-4 h-full">
                <FolderHeart className="w-16 h-16 opacity-20" />
                <h3 className="text-xl font-medium text-foreground">No snapshots found</h3>
                <p className="text-sm max-w-md">You haven't saved any resume snapshots yet. Go to the Resume Studio to tailor and save your first snapshot.</p>
                <button 
                  onClick={() => router.push('/dashboard/resumes')}
                  className="mt-4 px-6 py-2.5 bg-github-green text-white rounded-full text-sm font-semibold hover:bg-github-green-hover transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Go to Studio
                </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                {savedResumes.map((resume) => (
                    <div key={resume.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors group">
                    <div className="flex flex-col gap-1.5">
                        <h4 className="font-semibold text-foreground text-lg">{resume.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(resume.updatedAt).toLocaleDateString()}</span>
                        {resume.targetJobUrl && <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /> Tailored for JD</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                        onClick={() => onLoadResume(resume)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors border border-purple-500/20"
                        >
                        <Upload className="w-4 h-4" /> Load to Studio
                        </button>
                        <button
                        onClick={() => onDeleteResume(resume.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete snapshot"
                        >
                        <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
