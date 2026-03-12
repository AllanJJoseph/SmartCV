"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Github, Code, Stethoscope, Scale, HardHat, Building2 } from "lucide-react";

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  checkOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  hasCompletedOnboarding: true,
  checkOnboardingStatus: async () => {},
});

const FIELDS = [
  { id: "computer_science", label: "Computer Science", icon: <Code className="w-5 h-5" /> },
  { id: "medicine", label: "Medical Professional", icon: <Stethoscope className="w-5 h-5" /> },
  { id: "law", label: "Law", icon: <Scale className="w-5 h-5" /> },
  { id: "engineering", label: "Engineering", icon: <HardHat className="w-5 h-5" /> },
  { id: "business", label: "Business / Hotel Management", icon: <Building2 className="w-5 h-5" /> },
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Form State
  const [selectedField, setSelectedField] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const profile = await res.json();
        // If they have no profile or no field chosen, show the onboarding modal
        if (!profile || !profile.field) {
          setShowModal(true);
          setHasCompletedOnboarding(false);
        } else {
          setShowModal(false);
          setHasCompletedOnboarding(true);
        }
      } else {
          // If error fetching, possibly just new user without profile row yet.
          setShowModal(true);
          setHasCompletedOnboarding(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Post the new field. We also pass github if it was computer science
        body: JSON.stringify({
          field: selectedField,
          github: selectedField === "computer_science" ? githubUrl : "",
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setHasCompletedOnboarding(true);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, checkOnboardingStatus }}>
      {children}

      <AnimatePresence>
        {!isLoading && showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden glass mix-blend-normal"
            >
              <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-3 gradient-text">Welcome to SmartCV</h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                  To personalize your AI resume generation, please select your primary professional field.
                </p>

                <form onSubmit={handleSubmit} className="w-full text-left flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FIELDS.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => setSelectedField(field.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                          selectedField === field.id
                            ? "bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/20"
                            : "bg-background/50 border-border/50 text-foreground/80 hover:bg-muted/50 hover:border-border"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${selectedField === field.id ? "bg-primary/20" : "bg-muted"}`}>
                            {field.icon}
                        </div>
                        <span className="font-semibold text-sm">{field.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Contextual Github Input for CS */}
                  <AnimatePresence>
                    {selectedField === "computer_science" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-3">
                          <label className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                            <Github className="w-4 h-4" /> Link your GitHub Profile
                          </label>
                          <p className="text-xs text-muted-foreground mb-1">
                            We'll use this to highlight your repositories and contributions.
                          </p>
                          <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username"
                            className="w-full h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-6 border-t border-border/50 flex justify-end">
                    <button
                      type="submit"
                      disabled={!selectedField || isSubmitting}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
