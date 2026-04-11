"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, History, Calendar, Trash2, Clock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  status: string;
}

export default function MedicationHistoryPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    isCurrent: true,
  });

  const fetchMeds = async () => {
    try {
      const res = await fetch("/api/medications");
      const data = await res.json();
      setMeds(data.medications || []);
    } catch (err) {
      toast.error("Failed to load medication history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: formData.isCurrent ? "CURRENT" : "HISTORICAL"
        })
      });
      if (res.ok) {
        toast.success("Medication Added Successfully");
        setFormData({ name: "", dosage: "", frequency: "", startDate: new Date().toISOString().split("T")[0], isCurrent: true });
        fetchMeds();
      }
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setAdding(false);
    }
  };

  const deleteMed = async (id: string) => {
    if (!confirm("Remove this entry from history?")) return;
    try {
      await fetch(`/api/medications/${id}`, { method: "DELETE" });
      setMeds(meds.filter(m => m.id !== id));
      toast.success("Entry Removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-1 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <Pill className="h-8 w-8 text-blue-600" />
             Medication Ledger
          </h1>
          <p className="text-slate-500 mt-1">Keep a permanent record of treatments for better clinical visibility.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Add New Entry Form */}
         <div className="lg:col-span-1">
            <Card className="sticky top-6 border-slate-200 dark:border-slate-800 shadow-lg">
               <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <Plus className="h-4 w-4" /> Add Record
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleAddMed} className="space-y-4">
                     <div className="space-y-1">
                        <Label htmlFor="med-name">Medicine Name</Label>
                        <Input 
                           id="med-name" 
                           placeholder="e.g. Lisinopril" 
                           required 
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <Label htmlFor="dosage">Dosage</Label>
                           <Input 
                              id="dosage" 
                              placeholder="10mg" 
                              value={formData.dosage}
                              onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                           />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="frequency">Frequency</Label>
                           <Input 
                              id="frequency" 
                              placeholder="Once daily" 
                              value={formData.frequency}
                              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input 
                           id="start-date" 
                           type="date"
                           value={formData.startDate}
                           onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                     </div>
                     <div className="flex items-center gap-2 pt-2">
                        <input 
                           type="checkbox" 
                           id="is-current" 
                           checked={formData.isCurrent}
                           onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})}
                           className="h-4 w-4 rounded border-slate-300" 
                        />
                        <Label htmlFor="is-current" className="text-sm font-medium">Currently taking this</Label>
                     </div>
                     <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={adding}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Commit to History
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>

         {/* Timeline / Ledger List */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
               Medical Timeline <History className="h-5 w-5 text-slate-400" />
            </h2>
            
            {loading ? (
               <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
            ) : meds.length === 0 ? (
               <Card className="bg-slate-50/50 border-dashed border-2">
                  <CardContent className="h-40 flex flex-col items-center justify-center text-slate-400">
                     <Clock className="h-8 w-8 mb-2 opacity-20" />
                     <p>No medication history recorded yet.</p>
                  </CardContent>
               </Card>
            ) : (
               <div className="space-y-4">
                  {meds.map((med) => (
                     <Card key={med.id} className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                        <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-start gap-4">
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center flex-shrink-0">
                                 <Pill className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg">{med.name}</h3>
                                    <Badge className={med.status === "CURRENT" ? "bg-emerald-500" : "bg-slate-400"}>
                                       {med.status}
                                    </Badge>
                                 </div>
                                 <p className="text-sm text-slate-500 font-medium">{med.dosage} • {med.frequency}</p>
                                 <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                       <Calendar className="h-3 w-3" /> Started: {new Date(med.startDate).toLocaleDateString()}
                                    </span>
                                    {med.endDate && (
                                      <span className="flex items-center gap-1">
                                         <Calendar className="h-3 w-3" /> Ended: {new Date(med.endDate).toLocaleDateString()}
                                      </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              className="self-end md:self-auto text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteMed(med.id)}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
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
