"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PatientsListPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<any[]>([]); 
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => {
        setPatients(data.patients || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!session || (session.user as any).role !== "DOCTOR") return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-600" /> Patient Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Search and manage your patient records securely.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input 
             placeholder="Search name or email..." 
             className="pl-10 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white h-11 rounded-xl shadow-sm focus-visible:ring-blue-600"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-20">
             <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center p-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
             <UsersIcon className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500 dark:text-slate-500 font-medium">No patients found matches your criteria.</p>
          </div>
        ) : (
          filteredPatients.map((p) => (
             <Card key={p.id} className="group hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
               <CardHeader className="p-5 md:px-8 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                       <UsersIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white font-bold">{p.name}</CardTitle>
                      <CardDescription className="dark:text-slate-400">{p.email}</CardDescription>
                    </div>
                 </div>
                 <Link href={`/dashboard/patients/${p.id}`}>
                   <Button variant="ghost" className="text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4">
                      View Profile <ChevronRight className="ml-1 h-4 w-4" />
                   </Button>
                 </Link>
               </CardHeader>
             </Card>
          ))
        )}
      </div>
    </div>
  );
}
