"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Ruler, Weight, Droplets, Calendar, Home, Save, Loader2, Camera, ShieldCheck, ShieldAlert, FileText, Upload, ExternalLink, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

export default function ProfilePage() {
   const { data: session, update } = useSession();
   const [loading, setLoading] = useState(false);
   const [fetching, setFetching] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [profileUploading, setProfileUploading] = useState(false);
   const [files, setFiles] = useState<any[]>([]);
   const profileInputRef = useRef<HTMLInputElement>(null);

   // Verification state
   const [verifyLoading, setVerifyLoading] = useState(false);
   const [verificationDoc, setVerificationDoc] = useState("");
   const [requestedRole, setRequestedRole] = useState("PATIENT");
   const [verificationSubmitted, setVerificationSubmitted] = useState(false);

   const isVerified = (session?.user as any)?.isVerified || false;
   const currentRole = (session?.user as any)?.role || "PATIENT";

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
         const fileExt = file.name.split(".").pop();
         const fileName = `${Math.random()}.${fileExt}`;
         const filePath = `${session?.user?.id}/${fileName}`;

         const { data, error } = await supabase.storage
            .from("medical-files")
            .upload(filePath, file);

         if (error) throw error;

         const { data: { publicUrl } } = supabase.storage
            .from("medical-files")
            .getPublicUrl(filePath);

         await fetch("/api/medical-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               name: file.name,
               url: publicUrl,
               type: file.type.startsWith("image") ? "IMAGE" : "PDF"
            })
         });

         toast.success("Document uploaded successfully!");
         fetchFiles();
      } catch (err) {
         toast.error("Upload failed", {
            description: "Make sure 'medical-files' bucket exists in Supabase.",
         });
      } finally {
         setUploading(false);
      }
   };

   const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setProfileUploading(true);
      try {
         const supabase = getSupabase();
         const fileExt = file.name.split(".").pop();
         const fileName = `profile-${Date.now()}.${fileExt}`;
         const filePath = `profiles/${session?.user?.id}/${fileName}`;

         const { error } = await supabase.storage
            .from("medical-files")
            .upload(filePath, file);

         if (error) throw error;

         const { data: { publicUrl } } = supabase.storage
            .from("medical-files")
            .getPublicUrl(filePath);

         // Update profile in DB
         const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, profileImage: publicUrl }),
         });

         if (res.ok) {
            toast.success("Profile picture updated!");
            await update(); // Refresh session to show new image everywhere
         } else {
            throw new Error("Failed to update database");
         }
      } catch (err) {
         toast.error("Profile photo update failed", {
            description: "Please try again.",
         });
      } finally {
         setProfileUploading(false);
      }
   };

   const handleVerificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
         const supabase = getSupabase();
         const fileExt = file.name.split(".").pop();
         const fileName = `verification-${Date.now()}.${fileExt}`;
         const filePath = `verifications/${session?.user?.id}/${fileName}`;

         const { error } = await supabase.storage
            .from("medical-files")
            .upload(filePath, file);

         if (error) throw error;

         const { data: { publicUrl } } = supabase.storage
            .from("medical-files")
            .getPublicUrl(filePath);

         setVerificationDoc(publicUrl);
         toast.success("ID photo uploaded!", {
            description: "Now select your role and submit for verification.",
         });
      } catch (err) {
         toast.error("ID upload failed", {
            description: "Please try again.",
         });
      } finally {
         setUploading(false);
      }
   };

   const handleSubmitVerification = async () => {
      if (!verificationDoc) {
         toast.error("Please upload your ID photo first");
         return;
      }

      setVerifyLoading(true);
      try {
         const res = await fetch("/api/profile/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               verificationDoc,
               requestedRole,
            }),
         });

         if (res.ok) {
            setVerificationSubmitted(true);
            toast.success("Verification request submitted!", {
               description: "The Super Admin will review your identity. You'll be notified once verified.",
            });
         } else {
            const data = await res.json();
            toast.error("Verification submission failed", {
               description: data.message || "Please try again.",
            });
         }
      } catch (err) {
         toast.error("Connection error", {
            description: "Please check your internet connection.",
         });
      } finally {
         setVerifyLoading(false);
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
            toast.success("Profile updated successfully!");
            update();
         } else {
            toast.error("Failed to save profile", {
               description: "Please try again.",
            });
         }
      } catch (err) {
         toast.error("Connection error");
      } finally {
         setLoading(false);
      }
   };

   if (fetching) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

   return (
      <div className="max-w-4xl mx-auto space-y-8 p-1 md:p-6 pb-20">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  My Profile
               </h1>
               <p className="text-slate-500 mt-1 text-sm">Manage your account and verify your identity.</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
               isVerified
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
            }`}>
               {isVerified ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
               ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
               )}
               <span className={`text-xs font-black uppercase tracking-widest ${
                  isVerified ? "text-emerald-700" : "text-amber-700"
               }`}>
                  {isVerified 
                    ? `Verified ${currentRole.toLowerCase().split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` 
                    : "Not Verified"}
               </span>
            </div>
         </div>

         {/* === VERIFICATION SECTION (shown only if NOT verified) === */}
         {!isVerified && !verificationSubmitted && (
            <Card className="border-2 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 shadow-xl overflow-hidden">
               <CardHeader className="border-b border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <ShieldAlert className="h-6 w-6 text-amber-600" />
                     </div>
                     <div>
                        <CardTitle className="text-lg font-black">Verify Your Identity</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                           Upload a valid government ID and select your role to unlock all features.
                        </CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                  {/* ID Upload */}
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Government ID / Professional License
                     </Label>
                     <div className="relative">
                        <div className={`h-40 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                           verificationDoc
                              ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                              : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5"
                        }`}>
                           {verificationDoc ? (
                              <div className="flex flex-col items-center gap-2">
                                 <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                 <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">ID Photo Uploaded</span>
                                 <img src={verificationDoc} className="h-16 w-auto rounded-lg object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                              </div>
                           ) : (
                              <>
                                 <Camera className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                                 <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Tap to upload ID photo</span>
                                 <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">JPEG, PNG • Max 10MB</span>
                              </>
                           )}
                           <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={handleVerificationUpload}
                              disabled={uploading}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        What is your role?
                     </Label>
                     <Select value={requestedRole} onValueChange={setRequestedRole}>
                        <SelectTrigger className="h-12 rounded-xl">
                           <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="PATIENT">Patient</SelectItem>
                           <SelectItem value="DOCTOR">Doctor</SelectItem>
                           <SelectItem value="MASTER_ADMIN">Master Admin (Hospital Branch Manager)</SelectItem>
                        </SelectContent>
                     </Select>
                     <p className="text-[10px] text-slate-400 leading-relaxed">
                        The Super Admin will verify your identity and role based on your uploaded document.
                     </p>
                  </div>
               </CardContent>
               <CardFooter className="bg-white/50 dark:bg-slate-900/30 border-t border-amber-200/50 dark:border-amber-800/30 p-4">
                  <Button
                     onClick={handleSubmitVerification}
                     disabled={!verificationDoc || verifyLoading}
                     className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                     {verifyLoading ? "Submitting..." : "Submit for Verification"}
                     {!verifyLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>
               </CardFooter>
            </Card>
         )}

         {/* Verification Pending Banner */}
         {!isVerified && verificationSubmitted && (
            <Card className="border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shrink-0">
                     <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                     <h3 className="font-black text-blue-900 dark:text-blue-200">Verification Pending</h3>
                     <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Your identity is being reviewed by the Super Admin. You'll gain access to additional features once approved.
                     </p>
                  </div>
               </CardContent>
            </Card>
         )}

         <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Photo & ID Card */}
            <div className="md:col-span-1 space-y-6">
               <Card>
                  <CardContent className="p-6 text-center">
                     <div className="relative inline-block mb-4">
                        {session?.user?.image ? (
                           <img
                              src={session.user.image}
                              alt="Profile"
                              className="h-32 w-32 rounded-3xl object-cover shadow-2xl border-4 border-white/50 dark:border-slate-800/50"
                           />
                        ) : (
                           <div className="h-32 w-32 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <User className="h-16 w-16 text-slate-300" />
                           </div>
                        )}
                        <input
                           type="file"
                           ref={profileInputRef}
                           className="hidden"
                           accept="image/*"
                           onChange={handleProfileImageUpload}
                        />
                        <button 
                           type="button" 
                           onClick={() => profileInputRef.current?.click()}
                           disabled={profileUploading}
                           className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
                        >
                           {profileUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        </button>
                     </div>
                     <h3 className="font-bold text-lg">{session?.user?.name}</h3>
                     <p className="text-xs font-mono text-slate-500 uppercase mt-1">{(session?.user as any)?.publicId}</p>
                  </CardContent>
               </Card>

               <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                     <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Clinical ST-ID</p>
                     <p className="text-2xl font-black tracking-tighter">{(session?.user as any)?.publicId}</p>
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
                           onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Weight className="h-4 w-4" /> Weight</Label>
                        <Input
                           placeholder="e.g. 70kg"
                           value={formData.weight}
                           onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Droplets className="h-4 w-4 text-red-500" /> Blood Type</Label>
                        <Select value={formData.bloodType} onValueChange={(v: string) => setFormData({ ...formData, bloodType: v })}>
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
                           onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Home className="h-4 w-4" /> Residential Address</Label>
                        <Input
                           placeholder="123 Health Street..."
                           value={formData.address}
                           onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                     </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 dark:bg-slate-900 border-t justify-end p-4">
                     <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Profile Changes
                     </Button>
                  </CardFooter>
               </Card>

               {/* Medical Document Vault */}
               <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b">
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle className="flex items-center gap-2 italic">
                              <FileText className="h-5 w-5 text-primary" /> Medical Vault
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
                              className={`flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => window.open(file.fileUrl, "_blank")}>
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
