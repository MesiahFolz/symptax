"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Pill, Info, Clock, AlertCircle, ChevronRight, Bookmark, ArrowLeft, Stethoscope, Droplets, Zap, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";

const MEDICINE_DATA = [
  {
    id: 1,
    name: "Biogesic (Paracetamol)",
    category: "Analgesic & Antipyretic",
    symptoms: ["Headache", "Fever", "Body Pain"],
    description: "A trusted brand for fast relief of headache and fever without stomach irritation.",
    dosage: "500mg per tablet.",
    interval: "Every 4 to 6 hours as needed.",
    maxDose: "Max 4000mg (8 tablets) in 24 hours.",
    advice: "Safe for most people. Can be taken on an empty stomach.",
    color: "emerald"
  },
  {
    id: 2,
    name: "Advil / Medicol (Ibuprofen)",
    category: "NSAID / Anti-inflammatory",
    symptoms: ["Muscle Pain", "Inflammation", "Toothache", "Dysmenorrhea"],
    description: "Reduces hormones that cause inflammation and pain in the body.",
    dosage: "200mg to 400mg per dose.",
    interval: "Every 4 to 6 hours.",
    maxDose: "Typically 1200mg/day for OTC use.",
    advice: "MUST be taken with food or milk to protect the stomach lining.",
    color: "blue"
  },
  {
    id: 3,
    name: "Gaviscon / Kremil-S",
    category: "Antacid & Anti-reflux",
    symptoms: ["Stomachache", "Hyperacidity", "Heartburn", "Bloating"],
    description: "Neutralizes stomach acid and creates a protective barrier over the stomach contents.",
    dosage: "1-2 tablets or 10ml liquid.",
    interval: "After meals and at bedtime.",
    maxDose: "Do not exceed 8 tablets/day.",
    advice: "Chew tablets thoroughly. Avoid taking other meds within 2 hours of this.",
    color: "amber"
  },
  {
    id: 4,
    name: "Loperamide (Imodium)",
    category: "Anti-diarrheal",
    symptoms: ["Diarrhea", "Loose Stools"],
    description: "Slows down the movement of the gut. This decreases the number of bowel movements.",
    dosage: "2mg (initial 2 caps, then 1 after each loose stool).",
    interval: "As needed after bowel movements.",
    maxDose: "Max 16mg (8 capsules) in 24 hours.",
    advice: "Drink plenty of water and electrolytes to prevent dehydration.",
    color: "orange"
  },
  {
    id: 5,
    name: "Neozep / Decolgen",
    category: "Antihistamine & Decongestant",
    symptoms: ["Runny Nose", "Clogged Nose", "Sneezing", "Colds"],
    description: "Clears nasal passages and relieves symptoms associated with the common cold.",
    dosage: "1 tablet.",
    interval: "Every 6 hours.",
    maxDose: "Max 4 tablets in 24 hours.",
    advice: "May cause drowsiness. Use caution when driving or operating machinery.",
    color: "sky"
  },
  {
    id: 6,
    name: "Amoxicillin",
    category: "Antibiotic",
    symptoms: ["Bacterial Infection", "Sore Throat", "UTI"],
    description: "Fights bacteria in the body. Commonly used for ear, nose, and throat infections.",
    dosage: "250mg to 500mg.",
    interval: "Every 8 hours.",
    maxDose: "Follow physician's prescription exactly.",
    advice: "Finish the ENTIRE course even if you feel better. DO NOT skip doses.",
    color: "purple"
  },
  {
    id: 7,
    name: "Solmux / Carbocisteine",
    category: "Mucolytic",
    symptoms: ["Cough with Phlegm", "Chest Congestion"],
    description: "Makes phlegm less thick and sticky, making it easier to cough up.",
    dosage: "500mg per capsule.",
    interval: "Three times a day.",
    maxDose: "Follow instructions on label or doctor's advice.",
    advice: "Increase fluid intake to help loosen the phlegm faster.",
    color: "teal"
  },
  {
    id: 8,
    name: "Ascorbic Acid (Vitamin C)",
    category: "Vitamin / Supplement",
    symptoms: ["Immunity Boost", "Weakness", "Prevention of Scurvy"],
    description: "Essential nutrient for the repair of all body tissues and immune system support.",
    dosage: "500mg to 1000mg.",
    interval: "Once daily.",
    maxDose: "Upper limit is 2000mg per day for adults.",
    advice: "Best taken after breakfast. Stay hydrated.",
    color: "rose"
  },
  {
    id: 9,
    name: "Buscopan (Hyoscine)",
    category: "Antispasmodic",
    symptoms: ["Stomach Cramps", "Abdominal Pain", "Menstrual Cramps"],
    description: "Relaxes the muscles in the stomach, intestine, and bladder.",
    dosage: "10mg to 20mg.",
    interval: "Three to five times a day.",
    maxDose: "Max 100mg in 24 hours.",
    advice: "Take 30-60 minutes before meals if possible.",
    color: "indigo"
  },
  {
    id: 10,
    name: "Cetirizine (Virlix)",
    category: "Antihistamine",
    symptoms: ["Allergy", "Itchiness", "Hives"],
    description: "Long-acting, non-sedating antihistamine for allergic reactions.",
    dosage: "10mg.",
    interval: "Once daily.",
    maxDose: "Max 10mg in 24 hours.",
    advice: "Can be taken at night if it causes mild drowsiness.",
    color: "violet"
  }
];

export default function MedicineLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(MEDICINE_DATA.map(m => m.category)))];

  const filteredMedicines = MEDICINE_DATA.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.description.toLowerCase().includes(search.toLowerCase()) ||
                          m.symptoms.some(s => s.toLowerCase().includes(search.toLowerCase()));
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
             <p className="text-slate-500 dark:text-slate-400 font-medium">Find relief by medicine name or your symptoms.</p>
           </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Safe Usage Guide</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 rounded-[32px] overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search 'Headache', 'Stomachache', 'Biogesic'..." 
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
           <p className="text-slate-500 font-bold">No results found.</p>
           <Button variant="link" onClick={() => {setSearch(""); setSelectedCategory("All");}} className="mt-2 text-primary font-bold">Show all medicines</Button>
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
                     <Badge variant="outline" className={`border-${med.color}-200 text-${med.color}-600 bg-${med.color}-50/30 dark:bg-transparent text-[10px] uppercase font-black`}>
                        {med.category}
                     </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{med.name}</CardTitle>
                  
                  {/* SYMPTOMS HIGHLIGHT */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {med.symptoms.map(s => (
                      <span key={s} className={`px-2.5 py-1 rounded-lg bg-${med.color}-50/50 dark:bg-${med.color}-900/10 text-${med.color}-700 dark:text-${med.color}-300 text-[10px] font-bold border border-${med.color}-100 dark:border-${med.color}-800/50 flex items-center gap-1.5`}>
                        <Activity className="h-2.5 w-2.5" /> {s}
                      </span>
                    ))}
                  </div>

                  <CardDescription className="text-sm font-medium leading-relaxed mt-4 line-clamp-2">
                    {med.description}
                  </CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                           <Droplets className="h-3 w-3" /> Standard Dosage
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{med.dosage}</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                           <Clock className="h-3 w-3" /> Interval
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{med.interval}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <div className="shrink-0 h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                           <Info className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administration Advice</p>
                           <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{med.advice}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="shrink-0 h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                           <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cautionary Limit</p>
                           <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Max: <span className="font-bold text-amber-600">{med.maxDose}</span></p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Verified Reference</span>
                     <Button variant="ghost" size="sm" className="h-8 rounded-xl font-bold text-xs group/btn hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        Full Details <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 p-8 rounded-[40px] flex flex-col md:flex-row gap-6 items-start shadow-xl shadow-amber-900/5">
         <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-3xl shrink-0 border border-amber-200 dark:border-amber-800">
            <ShieldCheck className="h-8 w-8 text-amber-600" />
         </div>
         <div className="space-y-3">
            <h4 className="text-lg font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider">Critical Medical Disclaimer</h4>
            <p className="text-sm text-amber-800/80 dark:text-amber-500/80 leading-relaxed font-medium">
              The information in this library is curated for educational purposes and should NEVER replace professional medical advice. Medications can interact differently with each individual's body. 
              <br/><br/>
              <span className="font-bold">Always consult your doctor before starting any new medication</span>, especially if you are pregnant, nursing, or have pre-existing health conditions. If you experience an allergic reaction or severe side effects, seek emergency medical care immediately.
            </p>
         </div>
      </div>
    </div>
  );
}
