"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText, AlertTriangle, ShieldAlert, BadgeInfo, Pin } from "lucide-react";

export default function TimelinePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/records")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (!session) return null;

  const pinnedRecords = records.filter((r) => r.isPinned);
  const regularRecords = records.filter((r) => !r.isPinned);

  const getIconForType = (type: string, requiresAction: boolean) => {
    if (requiresAction) return <ShieldAlert className="h-5 w-5 text-white" />;
    switch (type) {
      case "DIAGNOSIS": return <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
      case "PRESCRIPTION": return <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case "INSTRUCTION": return <BadgeInfo className="h-5 w-5 text-teal-500 dark:text-teal-400" />;
      default: return <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Medical History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl text-lg">
          A secure, chronological record of your health journey, directly from your care team.
        </p>
      </div>

      {pinnedRecords.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
             <Pin className="h-5 w-5 text-blue-600" /> Pinned Instructions
          </h2>
          <div className="grid gap-4">
            {pinnedRecords.map((pr) => (
              <Card key={pr.id} className="border-l-4 border-l-blue-600 overflow-hidden shadow-md bg-blue-50/20 dark:bg-blue-900/10 dark:border-slate-800">
                <CardHeader className="py-4 px-6 border-b border-blue-100/50 dark:border-blue-900/20">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">
                       {pr.title}
                    </CardTitle>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{pr.type}</span>
                  </div>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed p-6">
                  {pr.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
         <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Activity Timeline</h2>
         {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : regularRecords.length === 0 ? (
            <div className="text-center p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
               <FileText className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500 dark:text-slate-400 font-medium">No medical records found in your history.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-5 md:ml-7 pb-4">
              {regularRecords.map((r, idx) => (
                <div key={r.id} className="relative pl-10 md:pl-12 mb-10 last:mb-0">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[19px] top-0 h-9 w-9 rounded-full border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-sm z-10
                    ${r.requiresAction ? 'bg-red-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                     {getIconForType(r.type, r.requiresAction)}
                  </div>
                  
                  <Card className={`overflow-hidden shadow-sm transition-all hover:shadow-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900 ${r.requiresAction ? 'border-red-200 dark:border-red-900/50 bg-red-50/5 dark:bg-red-900/5' : ''}`}>
                    <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 px-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">{r.title}</CardTitle>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-bold uppercase tracking-wide">{r.type}</span>
                           {r.tags && (
                             <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
                               {r.tags}
                             </span>
                           )}
                           {r.requiresAction && (
                             <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-md font-black animate-pulse shadow-sm tracking-tighter">ACTION REQUIRED</span>
                           )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {r.content || "Detailed clinical notes are not available for this entry."}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
