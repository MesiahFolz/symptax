"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, UserCheck, UserX, Image as ImageIcon, Loader2, Search, Users, Clock, User, Droplets, Ruler, Weight, Calendar, FileText, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserProfile {
  profileImage: string | null;
  bloodType: string | null;
  gender: string | null;
  height: string | null;
  weight: string | null;
  dob: string | null;
  address: string | null;
}

interface MemberUser {
  id: string;
  name: string;
  email: string;
  role: string;
  publicId: string;
  isVerified: boolean;
  verificationDoc: string | null;
  createdAt: string;
  profile: UserProfile | null;
  records: Array<{ id: string; title: string; type: string; createdAt: string }>;
}

interface Membership {
  id: string;
  user: MemberUser;
  status: string;
  createdAt: string;
}

export default function MasterAdminPage() {
  const { data: session } = useSession();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [branch, setBranch] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberUser | null>(null);

  // Branch creation state
  const [hospitalName, setHospitalName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [creatingBranch, setCreatingBranch] = useState(false);

  const fetchMemberships = async () => {
    try {
      const res = await fetch("/api/master/users");
      const data = await res.json();
      setMemberships(data.memberships || []);
      setBranch(data.branch || null);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleVerify = async (userId: string, verify: boolean) => {
    try {
      const res = await fetch(`/api/master/verify/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: verify }),
      });
      if (res.ok) {
        toast.success(verify ? "Member Approved" : "Member Rejected");
        fetchMemberships();
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName || !branchName) {
      toast.error("Please fill in hospital and branch names.");
      return;
    }

    setCreatingBranch(true);
    try {
      const res = await fetch("/api/master/branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalName, branchName, branchAddress }),
      });

      if (res.ok) {
        toast.success("Hospital Branch Created!", {
          description: "You can now manage your members and clinical records.",
        });
        fetchMemberships();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create branch");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setCreatingBranch(false);
    }
  };

  const filterFn = (m: Membership) =>
    m.user.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.user.publicId.toLowerCase().includes(filter.toLowerCase()) ||
    m.user.email.toLowerCase().includes(filter.toLowerCase());

  const pendingMemberships = memberships.filter(m => m.status === "PENDING" && filterFn(m));
  const approvedMemberships = memberships.filter(m => m.status === "APPROVED" && filterFn(m));

  if (session?.user?.role !== "MASTER_ADMIN") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-slate-500">This area is reserved for the Master Administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <ShieldCheck className="h-8 w-8 text-blue-100" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Branch Authority</h1>
              <p className="text-blue-200 mt-0.5 font-medium">{branch?.name || "Manage your branch"}</p>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
            <Input
              placeholder="Search members..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300 rounded-xl"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!branch ? (
        <Card className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 p-8 md:p-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto border-2 border-indigo-200 dark:border-indigo-800 shadow-inner">
              <Building2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Initialize Your Branch</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                As a Master Admin, you can create one hospital branch to manage your clinical network.
              </p>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hospital Name</label>
                <Input 
                  placeholder="e.g. City General Hospital" 
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Branch Name</label>
                <Input 
                  placeholder="e.g. Downtown Clinic" 
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Physical Address</label>
                <Input 
                  placeholder="123 Medical Dr..." 
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                disabled={creatingBranch}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                {creatingBranch ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                {creatingBranch ? "Creating..." : "Establish Branch"}
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <div className="flex gap-6">
        {/* Left: Member List Tabs */}
        <div className={`flex-1 min-w-0 ${selectedMember ? 'hidden lg:block' : ''}`}>
          <Tabs defaultValue="pending">
            <TabsList className="w-full mb-4 h-11 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <TabsTrigger value="pending" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                <Clock className="w-4 h-4 mr-2" /> Pending
                {pendingMemberships.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5">{pendingMemberships.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                <Users className="w-4 h-4 mr-2" /> Active Members
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">{approvedMemberships.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
              ) : pendingMemberships.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="h-32 flex items-center justify-center text-slate-400 italic">
                    No pending membership requests.
                  </CardContent>
                </Card>
              ) : (
                pendingMemberships.map(m => (
                  <Card
                    key={m.id}
                    onClick={() => setSelectedMember(m.user)}
                    className={`cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-lg transition-all ${selectedMember?.id === m.user.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center font-bold text-amber-600 text-lg">
                          {m.user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.user.name}</p>
                          <p className="text-xs font-mono text-slate-500">{m.user.publicId}</p>
                          <Badge variant="outline" className="text-[9px] mt-0.5">{m.user.role}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {m.user.verificationDoc && (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); window.open(m.user.verificationDoc!, "_blank"); }}>
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={(e) => { e.stopPropagation(); handleVerify(m.user.id, true); }}>
                          <UserCheck className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-3">
              {approvedMemberships.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="h-32 flex items-center justify-center text-slate-400 italic">
                    No active members yet.
                  </CardContent>
                </Card>
              ) : (
                approvedMemberships.map(m => (
                  <Card
                    key={m.id}
                    onClick={() => setSelectedMember(m.user)}
                    className={`cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-lg transition-all ${selectedMember?.id === m.user.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {m.user.profile?.profileImage ? (
                          <img src={m.user.profile.profileImage} className="h-11 w-11 rounded-2xl object-cover" alt={m.user.name} />
                        ) : (
                          <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 text-lg">
                            {m.user.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.user.name}</p>
                          <p className="text-xs font-mono text-slate-500">{m.user.publicId}</p>
                          <Badge variant="outline" className="text-[9px] mt-0.5 border-emerald-300 text-emerald-600">{m.user.role}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleVerify(m.user.id, false); }}>
                        <UserX className="h-4 w-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Member Detail Panel */}
        {selectedMember && (
          <div className="w-full lg:w-96 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Member Info</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>Close</Button>
            </div>

            <Card className="overflow-hidden border-0 shadow-xl dark:bg-slate-900 rounded-3xl">
              <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="px-6 pb-6 -mt-10">
                <div className="flex items-end gap-4 mb-4">
                  {selectedMember.profile?.profileImage ? (
                    <img src={selectedMember.profile.profileImage} className="h-20 w-20 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-lg" />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-slate-900 shadow-lg">
                      {selectedMember.name[0]}
                    </div>
                  )}
                  <div className="pb-1">
                    <p className="font-extrabold text-slate-900 dark:text-white text-xl">{selectedMember.name}</p>
                    <p className="font-mono text-xs text-slate-500">{selectedMember.publicId}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><User className="h-4 w-4" /> Email</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[180px]">{selectedMember.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Role</span>
                    <Badge variant="outline" className="capitalize">{selectedMember.role.toLowerCase()}</Badge>
                  </div>
                  {selectedMember.profile?.gender && (
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">Gender</span>
                      <span className="font-semibold">{selectedMember.profile.gender}</span>
                    </div>
                  )}
                  {selectedMember.profile?.bloodType && (
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium flex items-center gap-2"><Droplets className="h-4 w-4 text-red-500" /> Blood Type</span>
                      <span className="font-bold text-red-600">{selectedMember.profile.bloodType}</span>
                    </div>
                  )}
                  {selectedMember.profile?.height && (
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium flex items-center gap-2"><Ruler className="h-4 w-4" /> Height</span>
                      <span className="font-semibold">{selectedMember.profile.height}</span>
                    </div>
                  )}
                  {selectedMember.profile?.weight && (
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium flex items-center gap-2"><Weight className="h-4 w-4" /> Weight</span>
                      <span className="font-semibold">{selectedMember.profile.weight}</span>
                    </div>
                  )}
                  {selectedMember.profile?.dob && (
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Date of Birth</span>
                      <span className="font-semibold">{new Date(selectedMember.profile.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined</span>
                    <span className="font-semibold">{new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                  </div>

                  {selectedMember.records && selectedMember.records.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Recent Records</p>
                      <div className="space-y-2">
                        {selectedMember.records.map(r => (
                          <div key={r.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                            <span className="text-sm font-medium truncate max-w-[160px]">{r.title}</span>
                            <Badge variant="secondary" className="text-[9px] shrink-0">{r.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
