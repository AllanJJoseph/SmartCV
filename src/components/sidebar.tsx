"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, FolderHeart, MessageSquareText, Activity, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Studio", href: "/dashboard/resumes", icon: FileText },
  { name: "Saved Snapshots", href: "/dashboard/snapshots", icon: FolderHeart },
  { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { name: "Recruiter Simulator", href: "/dashboard/simulator", icon: MessageSquareText },
  { name: "Resume Heatmap", href: "/dashboard/heatmap", icon: Activity },
  { name: "Skill Analyzer", href: "/dashboard/analyzer", icon: Compass },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/50 glass z-20">
      <div className="flex h-16 items-center border-b border-border/50 px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.svg" alt="SmartCV Logo" width={200} height={48} className="h-12 w-auto object-contain" priority />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1.5 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon 
                  className={cn(
                    "mr-3 h-4 w-4 shrink-0 transition-colors duration-200",
                    isActive ? "text-primary-foreground" : "text-muted-foreground/70 group-hover:text-foreground/70"
                  )} 
                  aria-hidden="true" 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
