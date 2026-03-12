import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { PageTransition } from "@/components/page-transition";

import { OnboardingProvider } from "@/components/onboarding-provider";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          <OnboardingProvider>
            <PageTransition>{children}</PageTransition>
          </OnboardingProvider>
        </main>
      </div>
    </div>
  );
}
