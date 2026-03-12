"use client";

import { useSession, signOut } from "next-auth/react";
import { Search, Bell, User as UserIcon, LogOut } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 glass px-6 lg:px-8 z-10">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-full border border-input/50 bg-background/50 pl-9 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors hover:scale-105">
          <Bell className="h-5 w-5" />
        </button>
        
        {session ? (
          <div className="flex items-center gap-3 ml-2 border-l border-border/50 pl-4">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-border/50 glass flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        ) : (
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <UserIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
