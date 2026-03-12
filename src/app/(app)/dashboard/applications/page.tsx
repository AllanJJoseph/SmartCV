"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, GripVertical, CheckCircle2, Clock, XCircle, FileText, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
  date: string;
  logo: string;
  color: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const columnVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const cardVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

const statuses = [
  { id: "applied", label: "Applied", count: 12 },
  { id: "interviewing", label: "Interviewing", count: 3 },
  { id: "offer", label: "Offers", count: 1 },
  { id: "rejected", label: "Rejected", count: 5 },
];

const initialApplications: Application[] = [
  { id: 1, company: "Linear", role: "Frontend Engineer", status: "interviewing", date: "2 days ago", logo: "L", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: 2, company: "Stripe", role: "Fullstack Developer", status: "applied", date: "5 days ago", logo: "S", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: 3, company: "Vercel", role: "Design Engineer", status: "offer", date: "1 week ago", logo: "V", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  { id: 4, company: "Notion", role: "Software Engineer", status: "applied", date: "2 weeks ago", logo: "N", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAppForm, setNewAppForm] = useState({ company: "", role: "", status: "applied" });

  // Fetch applications on mount
  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAddModal = () => {
    setNewAppForm({ company: "", role: "", status: "applied" });
    setIsAddModalOpen(true);
  };

  const submitNewApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.company || !newAppForm.role) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppForm)
      });
      if (res.ok) {
         fetchApplications(); // Reload data
         setIsAddModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Remove this application?")) return;
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setApplications(applications.filter(app => app.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-auto mesh-bg p-6 lg:p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between relative z-10 pt-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Applications Tracker</h1>
          <p className="text-muted-foreground text-lg">Manage your job search pipeline.</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-full bg-github-green hover:bg-github-green-hover px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex gap-6 overflow-x-auto pb-6 pt-2 flex-1 relative z-10 snap-x"
      >
        {statuses.map((status) => (
          <motion.div variants={columnVariant} key={status.id} className="flex min-w-[320px] max-w-[320px] flex-col gap-4 snap-center">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold tracking-tight flex items-center gap-2 text-foreground/90">
                {status.label}
                <span className="flex h-5 items-center justify-center rounded-full bg-muted/80 px-2 text-xs font-bold text-muted-foreground">
                  {applications.filter(app => app.status === status.id).length}
                </span>
              </h3>
            </div>
            
            <div className="flex flex-col gap-3 min-h-[300px] rounded-2xl border border-border/50 glass p-3">
              {applications
                .filter((app) => app.status === status.id)
                .map((app) => (
                  <motion.div variants={cardVariant} key={app.id} className="group relative flex cursor-grab flex-col gap-3 rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 active:cursor-grabbing backdrop-blur-md">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteApplication(app.id)} className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold shadow-sm ${app.color || "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                          {app.company ? app.company.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm leading-tight text-foreground/90">{app.role}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{app.company}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                      <button className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors" title="View associated resume">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              {applications.filter((app) => app.status === status.id).length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border/50 text-sm font-medium text-muted-foreground/60 bg-background/30">
                  No applications
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Application Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden glass mix-blend-normal"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold tracking-tight">Add New Application</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={submitNewApplication} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Company Name</label>
                  <input 
                    type="text" 
                    value={newAppForm.company}
                    onChange={(e) => setNewAppForm({...newAppForm, company: e.target.value})}
                    placeholder="e.g. Stripe, OpenAI, Vercel" 
                    required
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Job Role / Title</label>
                  <input 
                    type="text" 
                    value={newAppForm.role}
                    onChange={(e) => setNewAppForm({...newAppForm, role: e.target.value})}
                    placeholder="e.g. Senior Frontend Engineer" 
                    required
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Current Status</label>
                  <select 
                    value={newAppForm.status}
                    onChange={(e) => setNewAppForm({...newAppForm, status: e.target.value})}
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary appearance-none"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer Received</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-github-green hover:bg-github-green-hover px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Pipeline Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
