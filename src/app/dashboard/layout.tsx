"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, LayoutDashboard, FileText, MessageSquare, Bot, Lightbulb, Users } from "lucide-react";
import { NotificationsBell } from "@/components/notifications";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isDoctor = (session?.user as any)?.role === "DOCTOR";

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SympTax</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
            <LayoutDashboard className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            Dashboard
          </Link>

          {!isDoctor && (
            <>
              <Link href="/dashboard/timeline" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                Medical History
              </Link>
              <Link href="/dashboard/insights" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Insights
              </Link>
              <Link href="/dashboard/ai-chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                <Bot className="h-5 w-5 text-purple-500" />
                Health Bot
              </Link>
            </>
          )}

          {isDoctor && (
            <Link href="/dashboard/patients" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
              <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              Patients
            </Link>
          )}

          <Link href="/dashboard/messages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
            <MessageSquare className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            Messages
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
              {session?.user?.name?.charAt(0) || "U"}
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
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between md:justify-end gap-2">
           <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:hidden">SympTax</h2>
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
