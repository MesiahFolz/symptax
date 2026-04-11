"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users, Link as LinkIcon, Stethoscope, Loader2, Check, X, ShieldCheck, MailPlus } from "lucide-react";
import { toast } from "sonner";

interface FoundUser {
  id: string;
  name: string;
  publicId: string;
  role: string;
  isVerified: boolean;
}

interface Request {
  id: string;
  sender: { name: string; publicId: string; role: string };
  senderId: string;
}

export default function NetworkingPage() {
  const { data: session } = useSession();
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [connections, setConnections] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNetwork = async () => {
    try {
      const res = await fetch("/api/network");
      const data = await res.json();
      setRequests(data.requests || []);
      setConnections(data.connections || []);
    } catch (err) {
      toast.error("Failed to load network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const handleSearch = async () => {
    if (!searchId.startsWith("ST-")) {
       toast.error("Invalid format. IDs start with ST-");
       return;
    }
    setSearching(true);
    setFoundUser(null);
    try {
      const res = await fetch(`/api/network/search?publicId=${searchId}`);
      const data = await res.json();
      if (data.user) {
        setFoundUser(data.user);
      } else {
        toast.error("ID not found");
      }
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (targetId: string) => {
    try {
      const isInvite = session?.user?.role === "DOCTOR";
      const res = await fetch("/api/network/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: targetId, type: isInvite ? "INVITE" : "FRIEND" })
      });
      if (res.ok) {
        toast.success("Request Sent");
        setFoundUser(null);
        setSearchId("");
      } else {
        const d = await res.json();
        toast.error(d.message || "Error sending request");
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await fetch(`/api/network/request/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept })
      });
      toast.success(accept ? "Accepted" : "Rejected");
      fetchNetwork();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-1 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <LinkIcon className="h-8 w-8 text-blue-600" />
             Medical Network
          </h1>
          <p className="text-slate-500 mt-1">Connect with verified doctors and patients using unique Clinical IDs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Search Column */}
         <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
               <div className="p-1 bg-blue-600" />
               <CardHeader>
                  <CardTitle className="text-lg">Find Practitioner or Patient</CardTitle>
                  <CardDescription>Enter the ST-XXXX ID found on their profile.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex gap-2">
                     <Input 
                        placeholder="ST-A1B2" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                     />
                     <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSearch} disabled={searching}>
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                     </Button>
                  </div>

                  {foundUser && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl animate-in fade-in slide-in-from-top-2">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600">
                             {foundUser.name[0]}
                          </div>
                          <div>
                             <p className="font-bold text-sm">{foundUser.name}</p>
                             <p className="text-[10px] font-mono text-slate-400">{foundUser.publicId}</p>
                          </div>
                       </div>
                       <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => sendRequest(foundUser.id)}>
                          {session?.user?.role === "DOCTOR" ? <MailPlus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                          {session?.user?.role === "DOCTOR" ? "Invite Patient" : "Send Friend Request"}
                       </Button>
                    </div>
                  )}
               </CardContent>
            </Card>

            {requests.length > 0 && (
              <div className="space-y-4">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Pending Requests</h2>
                 {requests.map(req => (
                    <Card key={req.id} className="border-blue-100 dark:border-blue-900/50 bg-blue-50/20">
                       <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="text-blue-600"><Users className="h-4 w-4" /></div>
                             <div>
                                <p className="text-xs font-bold">{req.sender.name}</p>
                                <p className="text-[9px] font-mono text-slate-400">{req.sender.publicId}</p>
                             </div>
                          </div>
                          <div className="flex gap-1">
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => respondToRequest(req.id, true)}>
                                <Check className="h-4 w-4" />
                             </Button>
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => respondToRequest(req.id, false)}>
                                <X className="h-4 w-4" />
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>
            )}
         </div>

         {/* Connections Column */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
               Your Clinical Network <Users className="h-5 w-5 text-slate-400" />
            </h2>

            {loading ? (
               <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
            ) : connections.length === 0 ? (
               <Card className="bg-slate-50/50 border-dashed border-2">
                  <CardContent className="h-40 flex flex-col items-center justify-center text-slate-400">
                     <Users className="h-8 w-8 mb-2 opacity-20" />
                     <p>Connect with a doctor or friend to share medical records.</p>
                  </CardContent>
               </Card>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((c) => (
                    <Card key={c.id} className="hover:shadow-md transition-all border-slate-200 dark:border-slate-800">
                       <CardContent className="p-4 flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${c.role === "DOCTOR" ? "bg-emerald-500" : "bg-blue-600"}`}>
                             {c.role === "DOCTOR" ? <Stethoscope className="h-6 w-6" /> : c.name[0]}
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <div className="flex items-center gap-2">
                                <h3 className="font-bold truncate">{c.name}</h3>
                                {c.isVerified && <ShieldCheck className="h-4 w-4 text-blue-500" />}
                             </div>
                             <p className="text-[10px] font-mono text-slate-400 uppercase">{c.publicId}</p>
                             <Badge variant="outline" className="mt-2 text-[8px] uppercase font-black">{c.role}</Badge>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
