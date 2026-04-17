"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Building, User, CheckCircle, XCircle, Clock, Loader2, Users, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SuperAdminPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const fetchData = async () => {
    try {
      setLoading(true);
      const resReq = await fetch("/api/superadmin/hospital-requests");
      if (resReq.ok) {
        const data = await resReq.json();
        setRequests(data.requests || []);
      }
      
      const resDir = await fetch("/api/superadmin/directory");
      if (resDir.ok) {
        const data = await resDir.json();
        setBranches(data.branches || []);
        setUsers(data.users || []);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) fetchData();
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
        fetchData();
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
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4 max-w-7xl mx-auto">
      {/* Super Admin Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 bg-blue-500 opacity-20 rounded-full h-48 w-48 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 bg-indigo-500 opacity-20 rounded-full h-48 w-48 blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
            <ShieldCheck className="h-10 w-10 text-blue-100" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Nexus</h1>
            <p className="text-blue-200 mt-1 text-lg font-medium">Manage cross-hospital infrastructure and general users.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4 mr-2" /> Pending Requests
            {requests.filter(r => r.status === "PENDING").length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 shrink-0 px-1 py-0">{requests.filter(r => r.status === "PENDING").length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="branches" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Network className="w-4 h-4 mr-2" /> Active Branches
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 mr-2" /> Platform Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : requests.length === 0 ? (
            <Card className="border-dashed shadow-sm bg-slate-50 dark:bg-slate-900 border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle className="h-12 w-12 text-blue-300 dark:text-blue-900/50 mb-3" />
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">All caught up! No pending hospital requests.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requests.map(req => (
                <Card key={req.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 overflow-hidden dark:bg-slate-800 border-r-0 border-t-0 border-b-0 rounded-2xl">
                  <CardHeader className="pb-3 bg-blue-50/50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-blue-900 dark:text-blue-100">{req.hospitalName}</CardTitle>
                        <CardDescription className="font-medium text-blue-600 dark:text-blue-400">Branch: {req.branchName}</CardDescription>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                         {req.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 relative p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <User className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium uppercase tracking-wider text-xs">Requester ID:</span> <span className="font-mono text-xs">{req.requesterId.substring(0,8)}...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Building className="h-4 w-4 shrink-0 text-slate-400" />
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
        </TabsContent>

        <TabsContent value="branches">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {branches.map(branch => (
               <Card key={branch.id} className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                     <div className="h-10 w-10 text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                       <Building className="h-5 w-5" />
                     </div>
                     <h3 className="font-bold text-lg mb-1">{branch.name}</h3>
                     <p className="text-sm font-medium text-slate-500 mb-4">{branch.hospital.name}</p>
                     <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                        <span className="text-slate-500">M. ADMIN</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{branch.masterAdmin?.name || "Pending"}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-slate-500">MEMBERS (APPROVED)</span>
                        <Badge variant="secondary" className="font-mono">{branch._count.memberships}</Badge>
                     </div>
                  </div>
               </Card>
             ))}
           </div>
        </TabsContent>

        <TabsContent value="users">
           <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Name / Public ID</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Global Verification</th>
                      <th className="px-6 py-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {users.map(user => (
                       <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                         <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                            <p className="font-mono text-xs text-slate-500 mt-0.5">{user.publicId}</p>
                         </td>
                         <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                         <td className="px-6 py-4">
                            <Badge variant="outline" className={`text-[10px] tracking-widest ${user.role === 'SUPER_ADMIN' ? 'border-purple-200 text-purple-700 bg-purple-50' : user.role === 'MASTER_ADMIN' ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-600'}`}>
                              {user.role}
                            </Badge>
                         </td>
                         <td className="px-6 py-4">
                            {user.isVerified ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-slate-300" />}
                         </td>
                         <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(user.createdAt).toLocaleDateString()}
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
             </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
