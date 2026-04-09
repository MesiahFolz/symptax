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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {session.user?.name} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
          {isDoctor
            ? "Manage your patients, add records, and stay connected."
            : "Your health dashboard — records, insights, and support in one place."}
        </p>
      </div>

      {!isDoctor && alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-300 text-lg">Action Required</h3>
              {alerts.map(a => (
                <p key={a.id} className="text-red-700 dark:text-red-400 text-sm mt-1">
                  <strong>{a.title}:</strong> {a.content?.substring(0, 120)}...
                </p>
              ))}
              <Link href="/dashboard/timeline" className="text-red-600 dark:text-red-400 font-medium text-sm mt-2 inline-block hover:underline">
                View full details →
              </Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Records</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{records.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Diagnoses</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{records.filter(r => r.type === "DIAGNOSIS").length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Prescriptions</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{records.filter(r => r.type === "PRESCRIPTION").length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Notifications</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{unreadNotifs.length} new</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!isDoctor && (
              <>
                <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl dark:text-white">Medical History</CardTitle>
                      <CardDescription className="mt-1">Chronological timeline</CardDescription>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{records.length} records</span>
                    <Link href="/dashboard/timeline">
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600 dark:text-blue-400">View <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-500" />
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl dark:text-white">Insights</CardTitle>
                      <CardDescription className="mt-1">What to do & avoid</CardDescription>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Based on diagnoses</span>
                    <Link href="/dashboard/insights">
                      <Button variant="ghost" size="sm" className="gap-1 text-yellow-600 dark:text-yellow-400">View <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl dark:text-white">AI Health Bot</CardTitle>
                      <CardDescription className="mt-1">General symptom guidance</CardDescription>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Non-diagnostic</span>
                    <Link href="/dashboard/ai-chat">
                      <Button variant="ghost" size="sm" className="gap-1 text-purple-600 dark:text-purple-400">Chat <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

            {isDoctor && (
              <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl dark:text-white">Patients</CardTitle>
                    <CardDescription className="mt-1">Search & manage</CardDescription>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">View all patients</span>
                  <Link href="/dashboard/patients">
                    <Button variant="ghost" size="sm" className="gap-1 text-blue-600 dark:text-blue-400">Open <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl dark:text-white">Messages</CardTitle>
                  <CardDescription className="mt-1">Secure communication</CardDescription>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Contact directly</span>
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="sm" className="gap-1 text-emerald-600 dark:text-emerald-400">Open <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
