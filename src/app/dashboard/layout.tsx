"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, FileText, MessageSquare, Bot, Lightbulb, Users, Menu, X, User, Share2, ShieldCheck, Pill, Building2, Lock } from "lucide-react";
import { NotificationsBell } from "@/components/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const role = (session?.user as any)?.role || "PATIENT";
  const isVerified = (session?.user as any)?.isVerified || false;

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold active:scale-[0.98] ${
      isActive(path)
        ? "bg-primary/10 text-primary border border-primary/20"
        : "text-slate-700 dark:text-slate-300 hover:bg-surface-subtle dark:hover:bg-slate-800"
    }`;

  const handleLockedFeature = (featureName: string) => {
    toast.info(`${featureName} is locked`, {
      description: "Your next step is to verify your identity in your Profile to unlock this feature.",
      action: {
        label: "Go to Profile",
        onClick: () => window.location.href = "/dashboard/profile",
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-surface-flat dark:bg-slate-900 border-r border-border-raised flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-[var(--shadow-raised)]
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <img src="/symptax_logo.svg" alt="SympTax" className="h-12 w-auto" />
            <button onClick={closeMenu} className="md:hidden p-1 text-slate-500 hover:bg-surface-subtle dark:hover:bg-slate-800 rounded-lg">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* === CORE FEATURES (Always visible) === */}
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground px-4 py-2">Core</div>
          
          <Link href="/dashboard/medical-history" onClick={closeMenu} className={navLinkClass("/dashboard/medical-history")}>
            <Pill className="h-5 w-5 text-emerald-500" />
            Medication Ledger
          </Link>
          <Link href="/dashboard/ai-chat" onClick={closeMenu} className={navLinkClass("/dashboard/ai-chat")}>
            <Bot className="h-5 w-5 text-purple-500" />
            Health Bot
          </Link>
          <Link href="/dashboard/profile" onClick={closeMenu} className={navLinkClass("/dashboard/profile")}>
            <User className="h-5 w-5 text-blue-500" />
            Profile
          </Link>

          {/* === VERIFIED-ONLY FEATURES === */}
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground px-4 py-2 mt-6 flex items-center gap-2">
            Premium
            {!isVerified && <Lock className="h-3 w-3 text-amber-500" />}
          </div>

          {isVerified ? (
            <>
              <Link href="/dashboard/insights" onClick={closeMenu} className={navLinkClass("/dashboard/insights")}>
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Health Insights
              </Link>
              <Link href="/dashboard/messages" onClick={closeMenu} className={navLinkClass("/dashboard/messages")}>
                <MessageSquare className="h-5 w-5 text-sky-500" />
                Messages
              </Link>
              <Link href="/dashboard/network" onClick={closeMenu} className={navLinkClass("/dashboard/network")}>
                <Share2 className="h-5 w-5 text-indigo-500" />
                Medical Network
              </Link>
              <Link href="/dashboard/branches" onClick={closeMenu} className={navLinkClass("/dashboard/branches")}>
                <Building2 className="h-5 w-5 text-rose-500" />
                Explore Branches
              </Link>

              {role === "DOCTOR" && (
                <Link href="/dashboard/patients" onClick={closeMenu} className={navLinkClass("/dashboard/patients")}>
                  <Users className="h-5 w-5 text-teal-500" />
                  Patients
                </Link>
              )}

              {role === "MASTER_ADMIN" && (
                <Link href="/dashboard/master" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 hover:bg-indigo-100 transition-all font-bold mt-2 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                  Master Admin
                </Link>
              )}

              {role === "SUPER_ADMIN" && (
                <Link href="/dashboard/superadmin" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 text-primary dark:text-blue-400 hover:bg-blue-100 transition-all font-bold mt-2 shadow-[var(--shadow-raised)] border border-blue-100 dark:border-blue-900/50">
                  <ShieldCheck className="h-5 w-5" />
                  Super Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <button onClick={() => handleLockedFeature("Health Insights")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 dark:text-slate-600 transition-all font-semibold w-full text-left opacity-60 cursor-not-allowed">
                <Lightbulb className="h-5 w-5" />
                Health Insights
                <Lock className="h-3.5 w-3.5 ml-auto text-amber-500/70" />
              </button>
              <button onClick={() => handleLockedFeature("Messages")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 dark:text-slate-600 transition-all font-semibold w-full text-left opacity-60 cursor-not-allowed">
                <MessageSquare className="h-5 w-5" />
                Messages
                <Lock className="h-3.5 w-3.5 ml-auto text-amber-500/70" />
              </button>
              <button onClick={() => handleLockedFeature("Medical Network")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 dark:text-slate-600 transition-all font-semibold w-full text-left opacity-60 cursor-not-allowed">
                <Share2 className="h-5 w-5" />
                Medical Network
                <Lock className="h-3.5 w-3.5 ml-auto text-amber-500/70" />
              </button>
              <button onClick={() => handleLockedFeature("Explore Branches")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 dark:text-slate-600 transition-all font-semibold w-full text-left opacity-60 cursor-not-allowed">
                <Building2 className="h-5 w-5" />
                Explore Branches
                <Lock className="h-3.5 w-3.5 ml-auto text-amber-500/70" />
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border bg-surface-subtle/30">
          {/* Verification Banner */}
          {!isVerified && (
            <Link href="/dashboard/profile" className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider leading-none">Verify Identity</p>
                <p className="text-[10px] mt-0.5 opacity-70">Upload ID to unlock all features</p>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-3 mb-4 px-3 bg-white dark:bg-slate-800/50 p-2 rounded-2xl border border-border shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow-inner">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
              ) : (
                session?.user?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                {isVerified ? role : "Unverified"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toast.info("Signing out...");
              signOut({ callbackUrl: "/" });
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-surface-flat dark:bg-slate-900 border-b border-border p-4 flex items-center justify-between gap-2 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-surface-subtle rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/symptax_logo.svg" alt="SympTax" className="h-11 w-auto md:hidden" />
              {isVerified && (
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-surface-subtle px-3 py-1.5 rounded-full border border-border shadow-inner">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Verified</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div id="theme-toggle-wrapper">
              <ThemeToggle />
            </div>
            <NotificationsBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
