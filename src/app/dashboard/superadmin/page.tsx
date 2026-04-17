"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Building, User, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SuperAdminPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/superadmin/hospital-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (err) {
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) fetchRequests();
  }, [isSuperAdmin]);

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/superadmin/hospital-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Request ${status.toLowerCase()} successfully.`);
        fetchRequests();
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("An error occurred.");
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldCheck className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Unauthorized Access</h2>
        <p className="text-slate-500 mt-2">Only Super Admins can access this portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* Super Admin Header (Medical Blue Theme) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 bg-blue-500 opacity-20 rounded-full h-48 w-48 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 bg-indigo-500 opacity-20 rounded-full h-48 w-48 blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
            <ShieldCheck className="h-10 w-10 text-blue-100" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Nexus</h1>
            <p className="text-blue-200 mt-1 text-lg font-medium">Manage cross-hospital infrastructure and approvals.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" /> Pending Hospital Requests
        </h2>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="border-dashed shadow-sm bg-slate-50 dark:bg-slate-900">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">All caught up! No pending requests.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map(req => (
              <Card key={req.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 overflow-hidden dark:bg-slate-800">
                <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[18px] text-blue-900 dark:text-blue-100">{req.hospitalName}</CardTitle>
                      <CardDescription className="font-medium text-blue-600 dark:text-blue-400">Branch: {req.branchName}</CardDescription>
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                       <Clock className="h-3 w-3" /> {req.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 relative">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="font-medium uppercase tracking-wider text-xs">Requester ID:</span> <span className="font-mono text-xs">{req.requesterId.split('-')[0]}...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Building className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="font-medium uppercase tracking-wider text-xs">Address:</span> <span className="truncate">{req.branchAddress}</span>
                  </div>
                  
                  {req.status === "PENDING" && (
                     <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                       <Button onClick={() => handleAction(req.id, "APPROVED")} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md transition-all hover:-translate-y-0.5">
                         <CheckCircle className="mr-2 h-4 w-4" /> Approve
                       </Button>
                       <Button onClick={() => handleAction(req.id, "REJECTED")} variant="destructive" className="flex-1 shadow-md transition-all hover:-translate-y-0.5">
                         <XCircle className="mr-2 h-4 w-4" /> Reject
                       </Button>
                     </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
