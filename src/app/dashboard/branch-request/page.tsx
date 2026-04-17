"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, FileCheck, Send, Loader2, Hospital } from "lucide-react";
import { toast } from "sonner";

export default function BranchRequestPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    hospitalName: "",
    branchName: "",
    branchAddress: "",
    documentUrl: "",
  });

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/hospital-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/hospital-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Branch request submitted successfully!");
        setFormData({
          hospitalName: "",
          branchName: "",
          branchAddress: "",
          documentUrl: "",
        });
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit request.");
      }
    } catch {
      toast.error("Internal configuration error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 bg-white opacity-10 rounded-full h-40 w-40 blur-2xl"></div>
         <div className="relative z-10 flex items-center gap-4">
           <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
             <Hospital className="h-8 w-8 text-blue-50" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight">Enterprise Branch Application</h1>
             <p className="text-blue-100 mt-1">Register your clinical institution to manage operations as a Master Admin.</p>
           </div>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50 p-6 flex flex-col gap-2">
             <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">Establish Branch</CardTitle>
             <CardDescription className="text-slate-500 dark:text-slate-400">
               Fill out your institutional details carefully.
             </CardDescription>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <Hospital className="h-4 w-4 text-blue-500" /> Institution / Hospital Name
                </label>
                <Input
                  required
                  placeholder="e.g. Genesis Medical Center"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <Building2 className="h-4 w-4 text-blue-500" /> Branch Division Name
                </label>
                <Input
                  required
                  placeholder="e.g. North Wing Diagnostics"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-blue-500" /> Primary Address
                </label>
                <Input
                  required
                  placeholder="Street, City, Postal Code"
                  value={formData.branchAddress}
                  onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <FileCheck className="h-4 w-4 text-blue-500" /> Verification Document URL (Optional)
                </label>
                <Input
                  placeholder="Link to medical license or registry"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-transform hover:-translate-y-1 font-bold mt-4"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Submit Application</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h3 className="text-xl font-bold px-2 text-slate-800 dark:text-slate-200">Your Applications</h3>
          
          {fetching ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
          ) : requests.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
              <FileCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 font-medium">No applications submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-4">
              {requests.map(req => (
                <Card key={req.id} className="border-0 shadow-md bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                   <div className="p-4 border-l-4 border-l-blue-500 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{req.hospitalName}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">{req.branchName}</p>
                      </div>
                      <div className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status}
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
