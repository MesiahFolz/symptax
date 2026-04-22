"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, MessageSquare, Bot, ArrowRight, Lightbulb, Users, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDoctor = (session?.user as any)?.role === "DOCTOR";

  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetch("/api/records").then(r => r.json()),
      fetch("/api/notifications").then(r => r.json()),
    ]).then(([recordsData, notifsData]) => {
      setRecords(recordsData.records || []);
      setNotifications(notifsData.notifications || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [session]);

  if (!session) return null;

  const alerts = records.filter(r => r.requiresAction);
  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border-raised">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="nav-prompt animate-none bg-primary/10 border-primary/20 text-primary">SESSION ACTIVE</div>
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">/ Overview</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Welcome, {session.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">
            {isDoctor
              ? "Manage your clinical directory and patient records."
              : "Unified health ledger and clinical insights."}
          </p>
        </div>
        <div className="flex gap-2">
           <div className="nav-prompt md:flex hidden">
             <span className="bg-white/50 dark:bg-slate-800 px-1 rounded border border-border italic font-mono text-[9px]">P</span>
             <span>Account Settings</span>
           </div>
        </div>
      </div>

      {!isDoctor && alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 shadow-xl rounded-3xl p-6 relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <div className="flex items-start gap-4">
            <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-2xl border border-red-200 dark:border-red-800 shadow-inner">
               <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                 <h3 className="font-black text-red-800 dark:text-red-300 text-xl uppercase tracking-tight">Clinical Action Required</h3>
                 <div className="nav-prompt bg-red-100 border-red-200 text-red-700 animate-none">Priority 1</div>
              </div>
              <div className="mt-4 space-y-4">
                {alerts.map(a => (
                  <div key={a.id} className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/40">
                    <p className="text-red-900 dark:text-red-300 font-bold leading-snug">
                      <span className="opacity-60 text-xs block mb-1">RECORD: {a.title}</span>
                      {a.content?.substring(0, 160)}...
                    </p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/timeline" className="mt-6 inline-flex items-center gap-2 text-red-700 dark:text-red-400 font-black text-sm hover:underline group">
                GO TO TIMELINE <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="raised-card p-6 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Ledger Records</span>
              <p className="text-4xl font-black text-foreground">{records.length}</p>
            </div>
            <div className="raised-card p-6 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Active Diagnoses</span>
              <p className="text-4xl font-black text-orange-500">{records.filter(r => r.type === "DIAGNOSIS").length}</p>
            </div>
            <div className="raised-card p-6 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Pending Prescriptions</span>
              <p className="text-4xl font-black text-primary">{records.filter(r => r.type === "PRESCRIPTION").length}</p>
            </div>
            <div className="raised-card p-6 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">New Alerts</span>
              <p className="text-4xl font-black text-emerald-500">{unreadNotifs.length}</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {!isDoctor && (
              <>
                <Card className="raised-card p-0 overflow-hidden border-none shadow-none group">
                  <div className="h-1.5 bg-primary w-full" />
                  <CardHeader className="p-8">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                          <FileText className="h-7 w-7 text-primary" />
                       </div>
                       <Button variant="ghost" size="icon" className="nav-prompt scale-100 flex h-6 w-6">H</Button>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Medical History</CardTitle>
                    <CardDescription className="text-base font-medium">Unified clinical timeline</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 flex justify-between items-center bg-surface-subtle/50 border-t border-border">
                    <span className="text-xs font-black text-muted-foreground">{records.length} RECORDS FOUND</span>
                    <Link href="/dashboard/timeline">
                      <Button variant="ghost" size="sm" className="font-black text-primary hover:bg-primary/10 gap-2">OPEN <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="raised-card p-0 overflow-hidden border-none shadow-none group">
                  <div className="h-1.5 bg-yellow-500 w-full" />
                  <CardHeader className="p-8">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 shadow-inner group-hover:scale-110 transition-transform">
                          <Lightbulb className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                       </div>
                       <Button variant="ghost" size="icon" className="nav-prompt scale-100 flex h-6 w-6">I</Button>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Clinical Insights</CardTitle>
                    <CardDescription className="text-base font-medium">AI wellbeing analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 flex justify-between items-center bg-surface-subtle/50 border-t border-border">
                    <span className="text-xs font-black text-muted-foreground">PATTERN BASED</span>
                    <Link href="/dashboard/insights">
                      <Button variant="ghost" size="sm" className="font-black text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 gap-2">VIEW <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="raised-card p-0 overflow-hidden border-none shadow-none group">
                  <div className="h-1.5 bg-purple-600 w-full" />
                  <CardHeader className="p-8">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-purple-600/10 p-4 rounded-2xl border border-purple-600/20 shadow-inner group-hover:scale-110 transition-transform">
                          <Bot className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                       </div>
                       <Button variant="ghost" size="icon" className="nav-prompt scale-100 flex h-6 w-6">C</Button>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">AI Health Bot</CardTitle>
                    <CardDescription className="text-base font-medium">Symmetry Medical Core</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 flex justify-between items-center bg-surface-subtle/50 border-t border-border">
                    <span className="text-xs font-black text-muted-foreground">FLUID INTERACTIVE</span>
                    <Link href="/dashboard/ai-chat">
                      <Button variant="ghost" size="sm" className="font-black text-purple-600 dark:text-purple-400 hover:bg-purple-600/10 gap-2">CHAT <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

            {isDoctor && (
              <Card className="raised-card p-0 overflow-hidden border-none shadow-none group">
                <div className="h-1.5 bg-primary w-full" />
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between mb-4">
                     <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                        <Users className="h-7 w-7 text-primary" />
                     </div>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">Patient Directory</CardTitle>
                  <CardDescription className="text-base font-medium">Manage clinical access</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 flex justify-between items-center bg-surface-subtle/50 border-t border-border">
                  <span className="text-xs font-black text-muted-foreground">SECURE ACCESS</span>
                  <Link href="/dashboard/patients">
                    <Button variant="ghost" size="sm" className="font-black text-primary hover:bg-primary/10 gap-2">OPEN <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="raised-card p-0 overflow-hidden border-none shadow-none group">
              <div className="h-1.5 bg-emerald-600 w-full" />
              <CardHeader className="p-8">
                <div className="flex items-center justify-between mb-4">
                   <div className="bg-emerald-600/10 p-4 rounded-2xl border border-emerald-600/20 shadow-inner group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <Button variant="ghost" size="icon" className="nav-prompt scale-100 flex h-6 w-6">M</Button>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">Messages</CardTitle>
                <CardDescription className="text-base font-medium">Clinical communication</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex justify-between items-center bg-surface-subtle/50 border-t border-border">
                <span className="text-xs font-black text-muted-foreground">ENCRYPTED END-TO-END</span>
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="sm" className="font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 gap-2">PORTAL <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="raised-card p-8 bg-surface-subtle/50 border-dashed">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-black text-lg text-foreground">Need help navigating?</h4>
                  <p className="text-muted-foreground text-sm font-medium">Use the keyboard shortcuts (hints in circles) or the sidebar to explore.</p>
                </div>
                <Button variant="outline" className="raised-button border-border-raised bg-surface-flat font-black text-xs px-6 py-4 rounded-xl">PRESS ESC FOR MAIN MENU</Button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
