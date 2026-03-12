"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Save, Link as LinkIcon, FileDown, FileText, Settings2, Loader2, Check, Github, Linkedin, X, FolderHeart, BookmarkPlus, Clock, Upload } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import { ResumePreview } from "@/components/resume-preview";
import { TagInput } from "@/components/tag-input";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ResumesPage() {
  const [pagesToggle, setPagesToggle] = useState<"1" | "auto">("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [linkedInInputUrl, setLinkedInInputUrl] = useState("");

  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [isSaveNewModalOpen, setIsSaveNewModalOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  
  const componentRef = useRef<HTMLDivElement>(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    skills: "",
    certifications: "",
    extraCurriculars: "",
    references: "",
    tenthGradeMarks: "",
    twelfthGradeMarks: "",
    cgpa: "",
    experience: [{ title: "", company: "", description: "" }],
    projects: [{ name: "", description: "" }],
    education: [{ degree: "" }]
  });

  useEffect(() => {
    async function loadProfile() {
      // Check for a loaded snapshot from the Snapshots page first
      const savedSnapshot = localStorage.getItem("resumeToLoad");
      if (savedSnapshot) {
        try {
          const parsedContent = JSON.parse(savedSnapshot);
          setProfile(parsedContent);
          const jobUrlLocal = localStorage.getItem("resumeJobUrl");
          if (jobUrlLocal) setJobUrl(jobUrlLocal);
          
          localStorage.removeItem("resumeToLoad");
          localStorage.removeItem("resumeJobUrl");
          setIsLoadingProfile(false);
          return; // Skip default DB load
        } catch (e) {
          console.error("Failed to load local snapshot", e);
        }
      }

      // Default load from Master Profile DB
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            linkedin: data.linkedin || "",
            skills: data.skills || "",
            certifications: data.certifications || "",
            extraCurriculars: data.extraCurriculars || "",
            references: data.references || "",
            tenthGradeMarks: data.tenthGradeMarks || "",
            twelfthGradeMarks: data.twelfthGradeMarks || "",
            cgpa: data.cgpa || "",
            experience: data.experience ? JSON.parse(data.experience) : [{ title: "", company: "", description: "" }],
            projects: data.projects ? JSON.parse(data.projects) : [{ name: "", description: "" }],
            education: data.education ? JSON.parse(data.education) : [{ degree: "" }]
          });
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${profile.firstName}_${profile.lastName}_Resume`,
  });

  const onGeneratePDF = async () => {
    // If no Target context is provided, we just print the master profile directly.
    if (!jobUrl) {
      if (confirm("You haven't provided a Target Job Context. Generate a generic PDF using your Master Profile data instead?")) {
        handlePrint();
      }
      return;
    }
    
    setIsGenerating(true);
    try {
        const res = await fetch("/api/generate-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile, jobContext: jobUrl })
        });
        if (res.ok) {
            const tailoredProfile = await res.json();
            setProfile(tailoredProfile);
            // Wait slightly for DOM to sync bound states to hidden PDF template
            setTimeout(() => handlePrint(), 500);
        } else {
            alert("AI Formatting failed. Ensure GEMINI_API_KEY is configured in the .env file and restart server.");
        }
    } catch (e) {
        console.error(e);
    }
    setIsGenerating(false);
  };

  const onScrapeLinkedIn = async () => {
    if (!profile.linkedin) {
        setIsLinkedInModalOpen(true);
        return;
    }
    await executeLinkedInScrape(profile.linkedin);
  };

  const handleLinkedInModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedInInputUrl) return;
    setIsLinkedInModalOpen(false);
    setProfile(prev => ({ ...prev, linkedin: linkedInInputUrl }));
    await executeLinkedInScrape(linkedInInputUrl);
    setLinkedInInputUrl(""); // reset
  };

  const executeLinkedInScrape = async (urlToScrape: string) => {
    setIsScraping(true);
    try {
        const res = await fetch("/api/scrape-linkedin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlToScrape })
        });
        if (res.ok) {
            const data = await res.json();
            setProfile(prev => ({ ...prev, ...data, linkedin: urlToScrape }));
        } else {
            alert("Scraping failed. Ensure GEMINI_API_KEY is configured in the .env file and restart server.");
        }
    } catch(e) {
        console.error(e);
    }
    setIsScraping(false);
  };

  const onSaveAsNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeTitle) return;
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newResumeTitle, 
          content: profile,
          targetJobUrl: jobUrl 
        })
      });
      if (res.ok) {
        setIsSaveNewModalOpen(false);
        setNewResumeTitle("");
        alert("Resume snapshot saved successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const importFromGithub = async () => {
    setIsImporting(true);
    try {
      const res = await fetch("/api/github/repos");
      if (res.ok) {
        const newProjects = await res.json();
        const current = profile.projects.length === 1 && !profile.projects[0].name ? [] : profile.projects;
        setProfile({...profile, projects: [...current, ...newProjects]});
      } else {
        const err = await res.json();
        alert(err.error || "Failed to import. Make sure your GitHub URL is set in Settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to GitHub API.");
    }
    setIsImporting(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string || "";
    const names = fullName.split(" ");

    const payload = {
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      linkedin: formData.get("linkedin") as string,
      skills: formData.get("skills") as string,
      certifications: formData.get("certifications") as string,
      extraCurriculars: formData.get("extraCurriculars") as string,
      references: formData.get("references") as string,
      tenthGradeMarks: formData.get("tenthGradeMarks") as string,
      twelfthGradeMarks: formData.get("twelfthGradeMarks") as string,
      cgpa: formData.get("cgpa") as string,
      experience: JSON.stringify(profile.experience),
      projects: JSON.stringify(profile.projects),
      education: JSON.stringify(profile.education)
    };

    try {
      await fetch("/api/profile", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="absolute inset-0 z-0 overflow-auto mesh-bg p-6 lg:p-8">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8 w-full max-w-4xl relative z-10 pt-4 mx-auto"
      >
        <motion.div variants={item} className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Resume Studio</h1>
          <p className="text-muted-foreground text-lg">Manage your master profile and instantly generate tailored, ATS-friendly PDFs.</p>
        </motion.div>

        {isLoadingProfile ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm font-medium">Loading your Master Profile...</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-8">
          
          {/* AI Tailoring & Settings */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm flex flex-col gap-4 transition-all duration-300">
              <div className="flex items-center gap-2 text-primary font-semibold tracking-tight">
                <FileText className="h-5 w-5" /> Target Job Description
              </div>
              <p className="text-sm text-muted-foreground">Paste the target job description. Our AI will automatically tailor and re-write your experience to match the exact keywords.</p>
              <div className="relative mt-2">
                <textarea 
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full min-h-[100px] rounded-lg border border-primary/30 bg-background/80 p-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-y" 
                  placeholder="We are looking for a Senior Software Engineer with 5+ years of experience in React..." 
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 glass p-6 shadow-sm flex flex-col gap-4 transition-all duration-300">
              <div className="flex items-center gap-2 font-semibold tracking-tight">
                <Settings2 className="h-5 w-5" /> Document Settings
              </div>
              <p className="text-sm text-muted-foreground">Configure the final PDF layout and generation constraints.</p>
              <div className="flex items-center gap-4 mt-2">
                <label className="text-sm font-medium">Max Pages:</label>
                <div className="flex bg-background/50 border border-border/50 rounded-lg p-1">
                  <button 
                    type="button" 
                    onClick={() => setPagesToggle("1")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${pagesToggle === "1" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted/50 text-muted-foreground"}`}
                  >
                    1 Page (Strict)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPagesToggle("auto")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${pagesToggle === "auto" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted/50 text-muted-foreground"}`}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Master Profile Header */}
          <div className="flex items-center gap-4">
             <div className="h-px bg-border/50 flex-1"></div>
             <span className="text-xs uppercase font-semibold text-muted-foreground tracking-widest px-2">Master Profile Data</span>
             <button 
                type="button" 
                onClick={onScrapeLinkedIn}
                disabled={isScraping}
                className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
             >
                {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
                {isScraping ? "Importing Data..." : "Import from LinkedIn"}
             </button>
             <div className="h-px bg-border/50 flex-1"></div>
          </div>

          {/* Personal Details */}
          <motion.div variants={item} className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 transition-all duration-300">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-4">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">First Name</label>
                <input name="firstName" type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="Alex" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Last Name</label>
                <input name="lastName" type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="Doe" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <input name="email" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="alex@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Phone</label>
                <input name="phone" type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground/80">LinkedIn / Website URL</label>
                <input name="linkedin" type="url" value={profile.linkedin} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="https://linkedin.com/in/alexdoe" />
              </div>
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div variants={item} className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">Experience</h2>
              <button type="button" onClick={() => setProfile({...profile, experience: [...profile.experience, { title: "", company: "", description: "" }]})} className="inline-flex items-center gap-2 text-sm font-medium text-white bg-github-green hover:bg-github-green-hover px-4 py-2 rounded-lg transition-colors shadow-sm">
                <Plus className="h-4 w-4" /> Add Role
              </button>
            </div>
            
            {profile.experience.map((exp, index) => (
              <div key={index} className="flex flex-col gap-4 border border-border/50 rounded-xl p-6 bg-background/30 group relative">
                {profile.experience.length > 1 && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => {
                        const newArray = [...profile.experience];
                        newArray.splice(index, 1);
                        setProfile({...profile, experience: newArray});
                      }} className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full pr-12">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground/80">Job Title</label>
                    <input name={`jobTitle_${index}`} type="text" value={exp.title || ""} onChange={(e) => {
                      const newArray = [...profile.experience];
                      newArray[index] = { ...newArray[index], title: e.target.value };
                      setProfile({...profile, experience: newArray});
                    }} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="Software Engineer" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground/80">Company</label>
                    <input name={`company_${index}`} type="text" value={exp.company || ""} onChange={(e) => {
                      const newArray = [...profile.experience];
                      newArray[index] = { ...newArray[index], company: e.target.value };
                      setProfile({...profile, experience: newArray});
                    }} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="Acme Corp" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground/80">Responsibilities & Achievements</label>
                    <textarea name={`description_${index}`} value={exp.description || ""} onChange={(e) => {
                      const newArray = [...profile.experience];
                      newArray[index] = { ...newArray[index], description: e.target.value };
                      setProfile({...profile, experience: newArray});
                    }} className="min-h-[140px] rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-y" placeholder="- Developed key features...&#10;- Improved performance by..." />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Education & Marks */}
          <motion.div variants={item} className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">Education & Marks</h2>
              <button type="button" onClick={() => setProfile({...profile, education: [...profile.education, { degree: "" }]})} className="inline-flex items-center gap-2 text-sm font-medium text-white bg-github-green hover:bg-github-green-hover p-1.5 rounded-lg transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground/80">Degrees & Universities</label>
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input name={`degree_${index}`} type="text" value={edu.degree || ""} onChange={(e) => {
                      const newArray = [...profile.education];
                      newArray[index] = { degree: e.target.value };
                      setProfile({...profile, education: newArray});
                    }} className="flex-1 h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="B.S. Computer Science" />
                    {profile.education.length > 1 && (
                      <button type="button" onClick={() => {
                          const newArray = [...profile.education];
                          newArray.splice(index, 1);
                          setProfile({...profile, education: newArray});
                      }} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">10th Grade Marks</label>
                <input name="tenthGradeMarks" type="text" value={profile.tenthGradeMarks} onChange={(e) => setProfile({...profile, tenthGradeMarks: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="95%" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">12th Grade Marks</label>
                <input name="twelfthGradeMarks" type="text" value={profile.twelfthGradeMarks} onChange={(e) => setProfile({...profile, twelfthGradeMarks: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="92%" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">CGPA</label>
                <input name="cgpa" type="text" value={profile.cgpa} onChange={(e) => setProfile({...profile, cgpa: e.target.value})} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="3.8 / 4.0" />
              </div>
            </div>
          </motion.div>

          {/* Projects */}
          <motion.div variants={item} className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
              <div className="flex items-center gap-2">
                  <button type="button" onClick={importFromGithub} disabled={isImporting} className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-foreground/80 bg-background hover:bg-muted border border-border/50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                    Import from GitHub
                  </button>
                   <button type="button" onClick={() => setProfile({...profile, projects: [...profile.projects, { name: "", description: "" }]})} className="inline-flex items-center gap-2 text-sm font-medium text-white bg-github-green hover:bg-github-green-hover px-4 py-2 rounded-lg transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> Add Project
                  </button>
              </div>
            </div>
            
            {profile.projects.map((proj, index) => (
              <div key={index} className="flex flex-col gap-4 border border-border/50 rounded-xl p-6 bg-background/30 group relative">
                {profile.projects.length > 1 && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => {
                        const newArray = [...profile.projects];
                        newArray.splice(index, 1);
                        setProfile({...profile, projects: newArray});
                      }} className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 w-full pr-12">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground/80">Project Name</label>
                    <input name={`projectName_${index}`} type="text" value={proj.name || ""} onChange={(e) => {
                      const newArray = [...profile.projects];
                      newArray[index] = { ...newArray[index], name: e.target.value };
                      setProfile({...profile, projects: newArray});
                    }} className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary" placeholder="E-commerce Web App" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground/80">Description</label>
                    <textarea name={`projectDesc_${index}`} value={proj.description || ""} onChange={(e) => {
                      const newArray = [...profile.projects];
                      newArray[index] = { ...newArray[index], description: e.target.value };
                      setProfile({...profile, projects: newArray});
                    }} className="min-h-[100px] rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-y" placeholder="- Built using Next.js...&#10;- Integrated Stripe..." />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
            
          {/* Skills, Certifications, Extras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item} className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="text-xl font-semibold tracking-tight">Skills & Certifications</h2>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Core Skills</label>
                <TagInput 
                  value={profile.skills} 
                  onChange={(val) => setProfile({...profile, skills: val})} 
                  placeholder="React, Node.js, TypeScript, Python..." 
                />
                {/* Hidden input to ensure FormData gets the value on native submit */}
                <input type="hidden" name="skills" value={profile.skills} />
              </div>
              <div className="flex flex-col gap-2 relative mt-2">
                <label className="text-sm font-medium text-foreground/80">Certifications</label>
                <p className="text-xs text-muted-foreground absolute right-0">e.g. AWS Cloud Practitioner</p>
                <TagInput 
                  value={profile.certifications} 
                  onChange={(val) => setProfile({...profile, certifications: val})} 
                  placeholder="AWS Certified, Google Cloud Professional..." 
                />
                <input type="hidden" name="certifications" value={profile.certifications} />
              </div>
            </motion.div>
            
            <motion.div variants={item} className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="text-xl font-semibold tracking-tight">Extras & References</h2>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Extra Curriculars</label>
                <TagInput 
                  value={profile.extraCurriculars} 
                  onChange={(val) => setProfile({...profile, extraCurriculars: val})} 
                  placeholder="President of CS Club, Volunteer..." 
                />
                <input type="hidden" name="extraCurriculars" value={profile.extraCurriculars} />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-foreground/80">References</label>
                <TagInput 
                  value={profile.references} 
                  onChange={(val) => setProfile({...profile, references: val})} 
                  placeholder="Jane Doe (Manager) - jdoe@acme.com..." 
                />
                <input type="hidden" name="references" value={profile.references} />
              </div>
            </motion.div>
          </div>

          {/* Action Footer */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-end gap-4 pt-6 pb-12">
            <button 
              type="button" 
              onClick={() => setIsSaveNewModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border/50 glass px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <BookmarkPlus className="h-4 w-4 tracking-tight" />
              Save Snapshot
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border/50 glass px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveSuccess ? <Check className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
              {saveSuccess ? "Saved!" : "Save Master"}
            </button>
            <div className="hidden sm:block h-8 w-px bg-border/50"></div>
            <button 
              type="button" 
              onClick={onGeneratePDF}
              disabled={isGenerating || isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {isGenerating ? "Analyzing Target Job URL..." : "Generate Tailored PDF"}
            </button>
          </motion.div>
        </form>
        )}

        {/* AI Generation Overlay Animation */}
        {isGenerating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-6"
            >
              {/* Gemini-style glowing orb rings */}
              <div className="relative flex items-center justify-center h-32 w-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent opacity-50"
                  style={{ borderWidth: "4px" }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-t-transparent border-r-emerald-500 border-b-blue-500 border-l-transparent opacity-50"
                  style={{ borderWidth: "4px" }}
                />
                
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 blur-md absolute"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 absolute shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                />
              </div>

              <div className="text-center flex flex-col gap-2">
                <motion.h3 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text"
                >
                  Tailoring Resume...
                </motion.h3>
                <div className="flex flex-col gap-1 text-sm text-foreground/60 w-64 items-center">
                   <motion.span 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      className="absolute"
                   >
                      Analyzing target JD...
                   </motion.span>
                   <motion.span 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }}
                      className="absolute bg-background"
                   >
                      Rewriting bullet points...
                   </motion.span>
                   <motion.span 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.5 }}
                      className="absolute bg-background"
                   >
                      Injecting ATS keywords...
                   </motion.span>
                   <motion.span 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 6 }}
                      className="absolute bg-background"
                   >
                      Finalizing PDF structure...
                   </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Hidden PDF Injection */}
        <ResumePreview ref={componentRef} profile={profile} pagesToggle={pagesToggle} />
      </motion.div>

      {/* LinkedIn Import Modal */}
      <AnimatePresence>
        {isLinkedInModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border/50 glass shadow-2xl rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#0A66C2]/20 p-2 rounded-lg text-[#0A66C2]">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">Import from LinkedIn</h3>
                </div>
                <button 
                  onClick={() => setIsLinkedInModalOpen(false)}
                  className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-foreground/70 mb-5">
                Please enter your public LinkedIn URL to automatically extract your skills, experience, and education history.
              </p>
              
              <form onSubmit={handleLinkedInModalSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="linkedin-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">LinkedIn URL</label>
                  <input
                    id="linkedin-url"
                    type="url"
                    required
                    autoFocus
                    value={linkedInInputUrl}
                    onChange={(e) => setLinkedInInputUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="flex h-11 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsLinkedInModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-[#0A66C2] text-white rounded-md shadow hover:bg-[#004182] transition-colors"
                  >
                    Start Import
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save New Resume Modal */}
      <AnimatePresence>
        {isSaveNewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border/50 glass shadow-2xl rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500">
                    <BookmarkPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">Save Resume Snapshot</h3>
                </div>
                <button 
                  onClick={() => setIsSaveNewModalOpen(false)}
                  className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-foreground/70 mb-5">
                Save the current state of the Studio as a distinct resume. You can reload this snapshot at any time in the future.
              </p>
              
              <form onSubmit={onSaveAsNew} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="resume-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Snapshot Name</label>
                  <input
                    id="resume-title"
                    type="text"
                    required
                    autoFocus
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    placeholder="e.g. Google Frontend Role, Stripe Backend 2026..."
                    className="flex h-11 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsSaveNewModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors"
                  >
                    Save Snapshot
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
