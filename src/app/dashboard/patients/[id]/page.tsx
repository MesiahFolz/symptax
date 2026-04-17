"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCircle, Plus, AlertTriangle, History, Bell, Loader2, ImagePlus, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const [patientId, setPatientId] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("DIAGNOSIS");
  const [isPinned, setIsPinned] = useState(false);
  const [requiresAction, setRequiresAction] = useState(false);
  
  // Notification states
  const [notificationMsg, setNotificationMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setPatientId(p.id);
      fetchRecords(p.id);
    });
  }, [params]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const fileExt = file.name.split(".").pop();
      const fileName = `record-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from("medical-files").upload(`records/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("medical-files").getPublicUrl(`records/${fileName}`);
      setImageUrl(publicUrl);
    } catch (e) {
      console.error("Image upload failed:", e);
    } finally {
      setUploading(false);
    }
  };

  const fetchRecords = async (id: string) => {
    try {
      const res = await fetch(`/api/records?patientId=${id}`);
      const data = await res.json();
      setRecords(data.records || []);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);

    try {
      await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, title, content, type, isPinned, requiresAction, imageUrl }),
      });
      fetchRecords(patientId);
      setTitle("");
      setContent("");
      setIsPinned(false);
      setRequiresAction(false);
      setImageUrl("");
    } catch(e) { console.error(e) }
    finally { setSubmitting(false) }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg) return;
    setSubmitting(true);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: patientId, message: notificationMsg }),
      });
      setNotificationMsg("");
      alert("Notification sent to patient!");
    } catch(e) { console.error(e) }
    finally { setSubmitting(false) }
  };

  if (!session || (session.user as any).role !== "DOCTOR") return null;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
           <UserCircle className="h-10 w-10 text-slate-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Patient Record System</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Detailed clinical management and history.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Management Tools */}
        <div className="space-y-8">
          <Card className="border-0 shadow-xl dark:bg-slate-900 overflow-hidden">
            <div className="h-2 bg-blue-600" />
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row items-center gap-3 bg-blue-50/30 dark:bg-blue-900/10">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl font-bold dark:text-white">Create New Record</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 p-6">
              <form onSubmit={handleAddRecord} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Type of Record</Label>
                     <select 
                       value={type} 
                       onChange={(e) => setType(e.target.value)}
                       className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                     >
                       <option value="DIAGNOSIS">Diagnosis</option>
                       <option value="PRESCRIPTION">Prescription</option>
                       <option value="INSTRUCTION">Instruction</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <Label className="dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Title / Heading</Label>
                     <Input 
                       required 
                       value={title} 
                       onChange={(e) => setTitle(e.target.value)} 
                       placeholder="e.g. Hypertension Phase 1" 
                       className="h-11 rounded-xl bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Clinical Notes & Action Details</Label>
                   <textarea
                     required
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm min-h-[140px] flex resize-none bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                     placeholder="Enter symptoms, dosage, or specific home care instructions..."
                   />
                </div>
                

                {/* Image Attachment */}
                <div className="space-y-2">
                  <Label className="dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Attach Image (Optional)</Label>
                  {imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={imageUrl} alt="Attachment" className="w-full max-h-48 object-cover" />
                      <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                      {uploading ? (<Loader2 className="h-6 w-6 animate-spin text-blue-600" />) : (<><ImagePlus className="h-6 w-6 text-slate-400 mb-1.5" /><span className="text-xs text-slate-500">Click to attach</span></>)}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <label className="flex-1 flex items-center gap-3 cursor-pointer group">
                     <div className="relative flex items-center">
                        <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="peer h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500" />
                     </div>
                     <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Pin to Patient Home</span>
                   </label>
                   <label className="flex-1 flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" checked={requiresAction} onChange={(e) => setRequiresAction(e.target.checked)} className="peer h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-red-600 focus:ring-red-500" />
                      </div>
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 group-hover:scale-105 transition-transform"><AlertTriangle className="h-4 w-4" /> Emergency Alert</span>
                   </label>
                </div>
                
                <Button type="submit" disabled={submitting} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                  {submitting ? "Processing..." : "Commit Record"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl dark:bg-slate-900 overflow-hidden">
            <div className="h-2 bg-emerald-500" />
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row items-center gap-3 bg-emerald-50/30 dark:bg-emerald-900/10">
              <Bell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-xl font-bold dark:text-white">Direct Push Notification</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 p-6">
              <form onSubmit={handleSendNotification} className="flex flex-col sm:flex-row gap-3">
                 <Input 
                   required
                   value={notificationMsg} 
                   onChange={(e) => setNotificationMsg(e.target.value)} 
                   placeholder="Short urgent message to patient..." 
                   className="h-11 rounded-xl bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white flex-1"
                 />
                 <Button type="submit" disabled={submitting} className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl">Send</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History Feed */}
        <div className="space-y-6 lg:h-[calc(100vh-12rem)] flex flex-col">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <History className="h-6 w-6 text-slate-500" /> History Timeline
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{records.length} Entries</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
              ) : records.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
                   <p className="text-slate-500 dark:text-slate-500 italic">No existing clinical history found.</p>
                </div>
              ) : (
                records.map((r) => (
                  <div key={r.id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h3 className="font-bold text-slate-900 dark:text-white text-lg">{r.title}</h3>
                           <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest">{r.type}</span>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed border-l-2 border-slate-100 dark:border-slate-800 pl-4">{r.content}</p>

                     {r.fileUrl && (
                       <div className="mt-3">
                         <img src={r.fileUrl} alt="Attached scan" className="rounded-xl max-h-60 w-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm" />
                       </div>
                     )}
                     
                     <div className="flex gap-2 mt-4">
                       {r.isPinned && <span className="text-[10px] text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold uppercase">Important PIN</span>}
                       {r.requiresAction && <span className="text-[10px] text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-2.5 py-1 rounded-full font-bold uppercase border border-red-100 dark:border-red-900/30">Action Alert</span>}
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
