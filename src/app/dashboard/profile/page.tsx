"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Ruler, Weight, Droplets, Calendar, Home, Save, Loader2, Camera, ShieldCheck, FileText, Upload, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

// Export force-dynamic to ensure this page is not statically generated at build time
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  // Initialize Supabase Client lazily
  const getSupabase = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
    );
  };
  
  const [formData, setFormData] = useState({
    name: "",
    height: "",
    weight: "",
    bloodType: "",
    gender: "",
    dob: "",
    address: "",
  });

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/medical-files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setFormData({
            name: session?.user?.name || "",
            height: p.height || "",
            weight: p.weight || "",
            bloodType: p.bloodType || "",
            gender: p.gender || "",
            dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
            address: p.address || "",
          });
        }
        await fetchFiles();
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, [session]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = getSupabase();
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session?.user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("medical-files")
        .upload(filePath, file);

      if (error) throw error;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("medical-files")
        .getPublicUrl(filePath);

      // 3. Register in Database
      await fetch("/api/medical-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          url: publicUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "PDF"
        })
      });

      toast.success("Document uploaded successfully");
      fetchFiles();
    } catch (err) {
      toast.error("Upload failed. Make sure 'medical-files' bucket exists in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success("Profile Updated Successfully");
        update(); // Refresh session
      } else {
        toast.error("Error saving profile");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-1 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
               <User className="h-8 w-8 text-blue-600" />
               Patient Profile
            </h1>
            <p className="text-slate-500 mt-1">Manage your clinical characteristics and medical papers.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
             <ShieldCheck className="h-4 w-4 text-emerald-600" />
             <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                {session?.user?.isVerified ? "Verified Identity" : "Pending Verification"}
             </span>
          </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Profile Photo & ID Card */}
         <div className="md:col-span-1 space-y-6">
            <Card>
               <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                     <div className="h-32 w-32 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="h-16 w-16 text-slate-300" />
                     </div>
                     <button type="button" className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
                        <Camera className="h-4 w-4" />
                     </button>
                  </div>
                  <h3 className="font-bold text-lg">{session?.user?.name}</h3>
                  <p className="text-xs font-mono text-slate-500 uppercase mt-1">{session?.user?.publicId}</p>
               </CardContent>
            </Card>

            <Card className="bg-blue-600 text-white">
               <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Clinical ST-ID</p>
                  <p className="text-2xl font-black tracking-tighter">{session?.user?.publicId}</p>
                  <div className="mt-6 pt-4 border-t border-white/20">
                     <p className="text-[10px] opacity-70 leading-relaxed font-medium">Use this ID to connect with Doctors or send networking requests.</p>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* General Stats & Info */}
         <div className="md:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Clinical Characteristics</CardTitle>
                  <CardDescription>Vital indicators used for medical diagnostics.</CardDescription>
               </CardHeader>
               <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Height</Label>
                     <Input 
                        placeholder="e.g. 175cm" 
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Weight className="h-4 w-4" /> Weight</Label>
                     <Input 
                        placeholder="e.g. 70kg" 
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Droplets className="h-4 w-4 text-red-500" /> Blood Type</Label>
                     <Select value={formData.bloodType} onValueChange={(v: string) => setFormData({...formData, bloodType: v})}>
                        <SelectTrigger>
                           <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                           {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                             <SelectItem key={t} value={t}>{t}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date of Birth</Label>
                     <Input 
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                     />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="space-y-2">
                     <Label>Full Name</Label>
                     <Input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Home className="h-4 w-4" /> Residential Address</Label>
                     <Input 
                        placeholder="123 Health Street..." 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                     />
                  </div>
               </CardContent>
               <CardFooter className="bg-slate-50/50 dark:bg-slate-900 border-t justify-end p-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={loading}>
                     {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Save Profile Changes
                  </Button>
               </CardFooter>
            </Card>

            {/* NEW: Medical Document Vault */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b">
                   <div className="flex items-center justify-between">
                      <div>
                         <CardTitle className="flex items-center gap-2 italic">
                            <FileText className="h-5 w-5 text-blue-600" /> Medical Vault
                         </CardTitle>
                         <CardDescription>X-Rays, lab results, and clinical papers.</CardDescription>
                      </div>
                      <div className="relative">
                         <input 
                           type="file" 
                           id="file-upload" 
                           className="hidden" 
                           onChange={handleFileUpload}
                           disabled={uploading}
                         />
                         <Label 
                           htmlFor="file-upload" 
                           className={`flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                         >
                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            Upload New
                         </Label>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   {files.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm italic">
                         No documents uploaded yet.
                      </div>
                   ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                         {files.map(file => (
                           <div key={file.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-slate-400" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{file.fileType}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => window.open(file.fileUrl, "_blank")}>
                                    <ExternalLink className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                         ))}
                      </div>
                   )}
                </CardContent>
            </Card>
         </div>
      </form>
    </div>
  );
}
