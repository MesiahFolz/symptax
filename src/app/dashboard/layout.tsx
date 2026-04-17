"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, LayoutDashboard, FileText, MessageSquare, Bot, Lightbulb, Users, Menu, X, User, Share2, ShieldCheck, Pill } from "lucide-react";
import { NotificationsBell } from "@/components/notifications";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDoctor = (session?.user as any)?.role === "DOCTOR";

  const closeMenu = () => setIsMenuOpen(false);

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
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SympTax</h2>
          <button onClick={closeMenu} className="md:hidden p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
            <LayoutDashboard className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            Dashboard
          </Link>

          {(session?.user as any)?.role !== "MASTER_ADMIN" && (
            <>
              {!isDoctor && (
                <>
                  <Link href="/dashboard/medical-history" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                    <Pill className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    Medical History
                  </Link>
                  <Link href="/dashboard/timeline" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                    <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    Symptom Timeline
                  </Link>
                  <Link href="/dashboard/insights" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Insights
                  </Link>
                  <Link href="/dashboard/ai-chat" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                    <Bot className="h-5 w-5 text-purple-500" />
                    Health Bot
                  </Link>
                </>
              )}

              <Link href="/dashboard/network" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                <Share2 className="h-5 w-5 text-blue-500" />
                Medical Network
              </Link>

              {isDoctor && (
                <Link href="/dashboard/patients" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                  <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  Patients
                </Link>
              )}

              <Link href="/dashboard/messages" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                <MessageSquare className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                Messages
              </Link>
            </>
          )}

          {isDoctor && (
            <Link href="/dashboard/patients" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
              <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              Patients
            </Link>
          )}

          <Link href="/dashboard/messages" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
            <MessageSquare className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            Messages
          </Link>

          <Link href="/dashboard/profile" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
            <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            My Profile
          </Link>

          {(session?.user as any)?.role === "MASTER_ADMIN" && (
            <Link href="/dashboard/master" onClick={closeMenu} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-bold mt-4">
              <ShieldCheck className="h-5 w-5" />
              Master Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold overflow-hidden shadow-sm">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
              ) : (
                session?.user?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{(session?.user as any)?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:hidden">SympTax</h2>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationsBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
