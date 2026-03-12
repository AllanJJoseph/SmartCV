"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Wallet, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    field: "",
    linkedin: "",
    github: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data) {
             setProfileData({
               field: data.field || "",
               linkedin: data.linkedin || "",
               github: data.github || ""
             });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  return (
    <div className="absolute inset-0 z-0 overflow-auto mesh-bg p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8 w-full max-w-4xl relative z-10 pt-4 mx-auto"
      >
        <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
          <h1 className="text-4xl font-semibold tracking-tight gradient-text inline-block">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account preferences and billing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sidebar inside Settings */}
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm transition-colors text-left">
              <User className="h-4 w-4" /> Account
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-colors text-left">
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-colors text-left">
              <Shield className="h-4 w-4" /> Privacy & Security
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-colors text-left">
              <Wallet className="h-4 w-4" /> Billing
            </button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="rounded-2xl border border-border/50 glass p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Account Information</h2>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Display Name</label>
                  <input 
                    type="text" 
                    disabled 
                    value={session?.user?.name || ""} 
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm text-muted-foreground cursor-not-allowed" 
                  />
                  <p className="text-xs text-muted-foreground">This is your public display name from Google.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Email Address</label>
                  <input 
                    type="email" 
                    disabled 
                    value={session?.user?.email || ""} 
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm text-muted-foreground cursor-not-allowed" 
                  />
                  <p className="text-xs text-muted-foreground">The email address associated with your account.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Professional Field</label>
                  <select 
                    value={profileData.field}
                    onChange={(e) => setProfileData({ ...profileData, field: e.target.value })}
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
                  >
                    <option value="">Select a field...</option>
                    <option value="computer_science">Computer Science</option>
                    <option value="medicine">Medical Professional</option>
                    <option value="law">Law</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business / Hotel Management</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">LinkedIn URL</label>
                  <input 
                    type="url" 
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username" 
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                  />
                </div>
              </div>

              {profileData.field === "computer_science" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">GitHub URL</label>
                  <input 
                    type="url" 
                    value={profileData.github}
                    onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    placeholder="https://github.com/username" 
                    className="h-11 rounded-lg border border-border/50 bg-background/50 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" 
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-destructive tracking-tight">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all of your content.</p>
              <button className="w-fit inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-6 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
