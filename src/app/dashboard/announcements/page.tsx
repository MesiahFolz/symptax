"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, FileText, Calendar, User, History, ArrowLeft, Loader2, Download, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AnnouncementsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("recordId");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.records || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium">Loading clinical announcements...</p>
      </div>
    );
  }

  const highlightedRecord = recordId ? records.find(r => r.id === recordId) : null;
  const otherRecords = recordId ? records.filter(r => r.id !== recordId) : records;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Doctor Announcements</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">View official medical records and instructions from your clinical team.</p>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-2 rounded-2xl flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Official Medical Channel</span>
        </div>
      </div>

      {highlightedRecord && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest px-1">
            <Bell className="h-4 w-4 animate-bounce" /> New Linked Announcement
          </div>
          <Card className="border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 dark:bg-slate-900 overflow-hidden rounded-3xl">
            <div className="h-3 bg-emerald-500" />
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">{highlightedRecord.type}</Badge>
                     {highlightedRecord.isPinned && <Badge variant="outline" className="text-blue-600 border-blue-200">PINNED</Badge>}
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">{highlightedRecord.title}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Received On</p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{new Date(highlightedRecord.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap border-l-4 border-emerald-100 dark:border-emerald-900/50 pl-6 py-2">
                  {highlightedRecord.content}
                </p>
              </div>
              {highlightedRecord.fileUrl && (
                <div className="mt-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                  <img src={highlightedRecord.fileUrl} alt="Attached clinical data" className="w-full max-h-[500px] object-cover" />
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" className="rounded-xl font-bold shadow-xl" onClick={() => window.open(highlightedRecord.fileUrl, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" /> View Original
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="pt-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-6">
          <History className="h-6 w-6 text-slate-400" /> {recordId ? "Other Records" : "Your Announcement History"}
        </h2>
        
        {otherRecords.length === 0 ? (
          <div className="text-center p-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-medium italic">No further announcements found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {otherRecords.map((r) => (
              <Card key={r.id} className="border-0 shadow-lg hover:shadow-xl transition-all dark:bg-slate-900 rounded-3xl group">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    {r.type === 'PRESCRIPTION' ? <FileText className="h-7 w-7 text-purple-500" /> : <ShieldAlert className="h-7 w-7 text-blue-500" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{r.type}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{r.content}</p>
                    <div className="pt-2">
                      <Link href={`/dashboard/announcements?recordId=${r.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 font-bold">
                          Read Full Announcement <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${className}`}>
      {children}
    </span>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}
