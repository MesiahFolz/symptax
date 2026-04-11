"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, UserX, Image as ImageIcon, ExternalLink, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  publicId: string;
  isVerified: boolean;
  verificationDoc: string | null;
  createdAt: string;
}

export default function MasterAdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const checkSystems = async () => {
    try {
      const res = await fetch("/api/master/diagnostics");
      const data = await res.json();
      setDiagnostics(data);
    } catch (error) {
       toast.error("Systems check failed");
    }
  };

  const fetchUsers = async () => {
    // ...
    try {
      const res = await fetch("/api/master/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId: string, verify: boolean) => {
    try {
      const res = await fetch(`/api/master/verify/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: verify }),
      });
      
      if (res.ok) {
        toast.success(verify ? "User Verified" : "Verification Reset");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const pendingUsers = users.filter(u => !u.isVerified && (u.name.toLowerCase().includes(filter.toLowerCase()) || u.publicId.includes(filter)));
  const verifiedUsers = users.filter(u => u.isVerified);

  if (session?.user?.role !== "MASTER_ADMIN") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-slate-500">This area is reserved for the Master Administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <ShieldCheck className="h-8 w-8 text-blue-600" />
             Master Verification Authority
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve clinical credentials for Doctors and Patients.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Search by name or ST-ID..." 
             className="pl-9"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
              Pending Verification 
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">{pendingUsers.length}</Badge>
           </h2>

           {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
           ) : pendingUsers.length === 0 ? (
             <Card className="bg-slate-50/50 border-dashed border-2">
                <CardContent className="h-40 flex items-center justify-center text-slate-400 italic">
                   No pending verification requests.
                </CardContent>
             </Card>
           ) : (
             pendingUsers.map(user => (
               <Card key={user.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-lg">
                  <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600">
                           {user.name[0]}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{user.name}</h3>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{user.role}</Badge>
                           </div>
                           <p className="text-xs font-mono text-slate-500 uppercase">{user.publicId}</p>
                           <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 w-full md:w-auto">
                        {user.verificationDoc && (
                          <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2" onClick={() => window.open(user.verificationDoc!, "_blank")}>
                             <ImageIcon className="h-4 w-4" /> View Doc
                          </Button>
                        )}
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none gap-2" onClick={() => handleVerify(user.id, true)}>
                           <UserCheck className="h-4 w-4" /> Approve
                        </Button>
                     </div>
                  </div>
               </Card>
             ))
           )}
        </div>

        <div className="space-y-6">
           <Card className="border-blue-100 dark:border-blue-900 shadow-lg bg-blue-50/20">
              <CardHeader className="pb-3 text-center">
                 <CardTitle className="text-sm uppercase tracking-widest font-black">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold italic">RESEND MAIL</span>
                    {diagnostics?.resend === "CONFIGURED" ? (
                       <Badge className="bg-emerald-500">ACTIVE</Badge>
                    ) : (
                       <Badge variant="destructive">MISSING</Badge>
                    )}
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold italic">VAULT STORAGE</span>
                    {diagnostics?.storage === "READY" ? (
                       <Badge className="bg-emerald-500">READY</Badge>
                    ) : (
                       <Badge variant="destructive">NOT FOUND</Badge>
                    )}
                 </div>
                 <Button variant="outline" className="w-full text-[10px] h-8 font-black uppercase tracking-tighter" onClick={checkSystems}>
                    Run Diagnostics
                 </Button>
              </CardContent>
           </Card>

           <h2 className="text-xl font-bold flex items-center gap-2">Recently Verified</h2>
           <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-0">
                 {verifiedUsers.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 text-sm">None verified yet.</div>
                 ) : (
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {verifiedUsers.slice(0, 5).map(u => (
                        <div key={u.id} className="p-4 flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                 <UserCheck className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold">{u.name}</p>
                                 <p className="text-[10px] font-mono text-slate-400">{u.publicId}</p>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" className="group-hover:opacity-100 opacity-0" onClick={() => handleVerify(u.id, false)}>
                              <UserX className="h-4 w-4 text-slate-400 hover:text-red-500" />
                           </Button>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
