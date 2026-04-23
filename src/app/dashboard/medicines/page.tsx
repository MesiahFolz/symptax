"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Pill, Info, Clock, AlertCircle, ChevronRight, Bookmark, ArrowLeft, Stethoscope, Droplets, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

const MEDICINE_DATA = [
  {
    id: 1,
    name: "Paracetamol (Acetaminophen)",
    category: "Analgesic & Antipyretic",
    description: "Used to treat pain and fever. It is typically used for mild to moderate pain relief.",
    dosage: "500mg to 1000mg per dose.",
    interval: "Every 4 to 6 hours as needed.",
    maxDose: "Do not exceed 4000mg (4g) in 24 hours.",
    advice: "Can be taken with or without food. Avoid alcohol while taking this medication.",
    color: "emerald"
  },
  {
    id: 2,
    name: "Ibuprofen",
    category: "NSAID",
    description: "Nonsteroidal anti-inflammatory drug used for treating pain, fever, and inflammation.",
    dosage: "200mg to 400mg per dose.",
    interval: "Every 4 to 6 hours.",
    maxDose: "Typically 1200mg/day for over-the-counter use.",
    advice: "Take with food or milk to prevent stomach upset. Not recommended for those with stomach ulcers.",
    color: "blue"
  },
  {
    id: 3,
    name: "Amoxicillin",
    category: "Antibiotic (Penicillin)",
    description: "Used to treat various bacterial infections such as chest infections and UTIs.",
    dosage: "250mg to 500mg per dose.",
    interval: "Three times a day (Every 8 hours).",
    maxDose: "As prescribed by a physician.",
    advice: "Must complete the entire course even if symptoms disappear. Can be taken with food.",
    color: "purple"
  },
  {
    id: 4,
    name: "Cetirizine",
    category: "Antihistamine",
    description: "Used to relieve allergy symptoms such as hay fever, hives, and itchy eyes.",
    dosage: "10mg per dose.",
    interval: "Once daily.",
    maxDose: "10mg in 24 hours.",
    advice: "Can cause drowsiness in some people. Avoid driving until you know how it affects you.",
    color: "amber"
  },
  {
    id: 5,
    name: "Metformin",
    category: "Antidiabetic",
    description: "First-line medication for the treatment of type 2 diabetes, helping control blood sugar levels.",
    dosage: "500mg to 850mg initially.",
    interval: "Once or twice daily with meals.",
    maxDose: "2550mg per day.",
    advice: "Take with meals to reduce gastrointestinal side effects. Monitor blood sugar regularly.",
    color: "rose"
  },
  {
    id: 6,
    name: "Omeprazole",
    category: "Proton Pump Inhibitor",
    description: "Reduces the amount of acid produced in your stomach. Treats heartburn and acid reflux.",
    dosage: "20mg per dose.",
    interval: "Once daily, preferably in the morning.",
    maxDose: "40mg per day.",
    advice: "Take at least 30-60 minutes before a meal for best results.",
    color: "sky"
  },
  {
    id: 7,
    name: "Salbutamol (Albuterol)",
    category: "Bronchodilator",
    description: "Relaxes muscles in the airways and increases airflow to the lungs. Used for asthma/COPD.",
    dosage: "1-2 puffs (90-100mcg per puff).",
    interval: "Every 4 to 6 hours as needed.",
    maxDose: "Typically not to exceed 8 puffs in 24 hours unless directed.",
    advice: "Rinse mouth after use if using a steroid combination. Keep your inhaler with you at all times.",
    color: "orange"
  },
  {
    id: 8,
    name: "Atorvastatin",
    category: "Statin",
    description: "Used to lower cholesterol and reduce the risk of heart attack and stroke.",
    dosage: "10mg to 80mg per dose.",
    interval: "Once daily, any time of day.",
    maxDose: "80mg per day.",
    advice: "Avoid large amounts of grapefruit juice. Report unexplained muscle pain immediately.",
    color: "indigo"
  }
];

export default function MedicineLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(MEDICINE_DATA.map(m => m.category)))];

  const filteredMedicines = MEDICINE_DATA.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
           </Link>
           <div>
             <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Medicine Library</h1>
             <p className="text-slate-500 dark:text-slate-400 font-medium">A comprehensive guide to common pharmaceutical treatments.</p>
           </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Clinical Reference</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 rounded-[32px] overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search by medicine name or condition..." 
                className="pl-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <Pill className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
           <p className="text-slate-500 font-bold">No medicines found matching your search.</p>
           <Button variant="link" onClick={() => {setSearch(""); setSelectedCategory("All");}} className="mt-2 text-primary font-bold">Clear all filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMedicines.map((med) => (
            <Card key={med.id} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 dark:bg-slate-900 rounded-[32px] overflow-hidden">
               <div className={`h-2 bg-${med.color}-500`} />
               <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start">
                     <div className={`p-3 rounded-2xl bg-${med.color}-50 dark:bg-${med.color}-900/20 text-${med.color}-600 dark:text-${med.color}-400 mb-3 group-hover:scale-110 transition-transform`}>
                        <Pill className="h-6 w-6" />
                     </div>
                     <Badge variant="outline" className={`border-${med.color}-200 text-${med.color}-600 bg-${med.color}-50/30 dark:bg-transparent`}>
                        {med.category}
                     </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{med.name}</CardTitle>
                  <CardDescription className="text-sm font-medium leading-relaxed mt-2 line-clamp-2">
                    {med.description}
                  </CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                           <Droplets className="h-3 w-3" /> Standard Dosage
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{med.dosage}</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                           <Clock className="h-3 w-3" /> Interval
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{med.interval}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                           <Info className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administration Advice</p>
                           <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{med.advice}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="shrink-0 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                           <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cautionary Limit</p>
                           <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Max: <span className="font-bold text-amber-600">{med.maxDose}</span></p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">SympTax Verify</span>
                     <Button variant="ghost" size="sm" className="h-8 rounded-xl font-bold text-xs group/btn">
                        Clinical Details <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-[32px] flex gap-4 items-start">
         <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
         <div className="space-y-2">
            <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Medical Disclaimer</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 leading-relaxed font-medium">
              This library is for informational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication. Never disregard professional medical advice or delay in seeking it because of something you have read here.
            </p>
         </div>
      </div>
    </div>
  );
}
