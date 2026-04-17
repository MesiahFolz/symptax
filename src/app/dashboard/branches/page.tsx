"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, ArrowRightLeft, ShieldCheck, MapPin, Loader2, Hospital } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BranchesPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      setBranches(data.branches || []);
      setMemberships(data.memberships || []);
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async (branchId: string) => {
    setActionLoading(branchId);
    try {
      const res = await fetch("/api/branches/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSwitchContext = async (branchId: string) => {
    setActionLoading(`switch-${branchId}`);
    try {
      const res = await fetch("/api/branches/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        // Force session refresh so UI recognizes the new branchId instantly
        await update();
        fetchData();
        // Give time for toast to show then reload
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to switch branches");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(filter.toLowerCase()) || 
    b.hospital.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getMembershipStatus = (branchId: string) => {
    return memberships.find(m => m.branchId === branchId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 bg-white opacity-10 rounded-full h-40 w-40 blur-2xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
             <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
               <Building2 className="h-8 w-8 text-blue-50" />
             </div>
             <div>
               <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Network</h1>
               <p className="text-blue-100 mt-1 font-medium">Join and manage your clinical branches across the enterprise.</p>
             </div>
           </div>
           
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-5 w-5 text-blue-200" />
              <Input 
                placeholder="Search branches..." 
                className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-blue-200 rounded-xl focus-visible:ring-white/50"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
           </div>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map(branch => {
            const membership = getMembershipStatus(branch.id);
            const isPending = membership?.status === "PENDING";
            const isApproved = membership?.status === "APPROVED";
            const isActivePrimary = membership?.isPrimary || ((session?.user as any)?.branchId === branch.id);

            return (
              <Card key={branch.id} className={`overflow-hidden rounded-[24px] border-0 transition-all duration-300 ${isActivePrimary ? 'shadow-blue-500/20 shadow-2xl ring-2 ring-blue-500 scale-[1.02]' : 'shadow-lg hover:shadow-xl hover:-translate-y-1 dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}>
                 <div className={`p-6 ${isActivePrimary ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40' : 'bg-white dark:bg-slate-900'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${isActivePrimary ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        <Hospital className="h-6 w-6" />
                      </div>
                      {isActivePrimary ? (
                         <Badge className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs tracking-widest uppercase font-black">Active Context</Badge>
                      ) : isApproved ? (
                         <Badge variant="outline" className="text-emerald-600 border-emerald-600 px-3 py-1">Member</Badge>
                      ) : isPending ? (
                         <Badge variant="outline" className="text-amber-500 border-amber-500 px-3 py-1">Pending Approval</Badge>
                      ) : null}
                    </div>

                    <div className="space-y-1 mb-6">
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{branch.name}</h3>
                       <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{branch.hospital.name}</p>
                    </div>

                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                       <div className="flex items-center gap-2">
                         <ShieldCheck className="h-4 w-4 text-emerald-500" />
                         <span>Admin: <span className="font-semibold">{branch.masterAdmin?.name || 'Unassigned'}</span></span>
                       </div>
                       <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-rose-500" />
                         <span className="truncate">{branch.address || 'No location set'}</span>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      {!membership && (
                        <Button 
                          className="w-full h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 font-bold"
                          onClick={() => handleJoin(branch.id)}
                          disabled={actionLoading === branch.id}
                        >
                          {actionLoading === branch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request to Join'}
                        </Button>
                      )}
                      {isPending && (
                        <Button 
                          className="w-full h-11 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800" disabled
                        >
                          Awaiting Master Admin
                        </Button>
                      )}
                      {isApproved && !isActivePrimary && (
                        <Button 
                          className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md"
                          onClick={() => handleSwitchContext(branch.id)}
                          disabled={actionLoading === `switch-${branch.id}`}
                        >
                           {actionLoading === `switch-${branch.id}` ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <><ArrowRightLeft className="mr-2 h-4 w-4" /> Swap to this Branch</>
                           )}
                        </Button>
                      )}
                      {isActivePrimary && (
                        <Button 
                          className="w-full h-11 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold" disabled
                        >
                          Currently Inside
                        </Button>
                      )}
                    </div>
                 </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
