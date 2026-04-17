"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HeartPulse, Eye, EyeOff, Camera, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@supabase/supabase-js";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("PATIENT");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profileImage, setProfileImage] = useState("");
  const [verificationDoc, setVerificationDoc] = useState("");

  const [hospitalName, setHospitalName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  const getSupabase = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  };

  const validateEmail = (email: string, role: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    if (role === "MASTER_ADMIN" || email === "master@symptax.com") {
      return domain === "symptax.com";
    }
    return domain === "gmail.com" || domain === "email.com";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'PROFILE' | 'ID') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = getSupabase();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `registrations/${fileName}`;

      const { data, error } = await supabase.storage
        .from("medical-files")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("medical-files")
        .getPublicUrl(filePath);

      if (type === 'PROFILE') setProfileImage(publicUrl);
      else setVerificationDoc(publicUrl);
    } catch (err: any) {
      console.error("UPLOAD_ERROR:", err);
      setError(`Upload failed: ${err.message || 'Unknown error'}. Check if 'medical-files' bucket is public.`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(email, role)) {
      setError(role === "MASTER_ADMIN" ? "Master Admin must use @symptax.com" : "Email must be @gmail.com or @email.com");
      setLoading(false);
      return;
    }

    if (!profileImage || !verificationDoc) {
      setError("Please upload both your Profile Photo and ID for verification.");
      setLoading(false);
      return;
    }
    
    if (role === "MASTER_ADMIN" && (!hospitalName || !branchName || !branchAddress)) {
      setError("Master Admins must provide Hospital and Branch details.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          profileImage,
          verificationDoc,
          hospitalName,
          branchName,
          branchAddress
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-slate-500 mb-6">Your account is now pending approval by the Master Admin. You will be able to log in once verified.</p>
          <p className="text-xs text-slate-400">Redirecting to login...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4 text-white">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 pt-10 pb-10">
        <div className="flex flex-col items-center justify-center">
          <img src="/symptax_logo.svg" alt="SympTax" className="h-16 w-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mt-2 italic">Official Identity Registration</p>
        </div>

        <Card className="border-0 shadow-xl dark:bg-slate-900 border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white text-xl">Create Account</CardTitle>
            <CardDescription className="dark:text-slate-400">All accounts require Master Admin verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-md border border-red-100 dark:border-red-800 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Photo</Label>
                  <div className="relative group">
                    <div className={`h-24 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${profileImage ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-blue-400'}`}>
                      {profileImage ? (
                        <img src={profileImage} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Camera className="h-6 w-6 text-slate-300" />
                          <span className="text-[10px] text-slate-400 mt-1">Upload JPEG</span>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'PROFILE')} disabled={uploading} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">ID / License Pic</Label>
                  <div className="relative group">
                    <div className={`h-24 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${verificationDoc ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-blue-400'}`}>
                      {verificationDoc ? (
                        <img src={verificationDoc} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-slate-300" />
                          <span className="text-[10px] text-slate-400 mt-1">Upload Photo</span>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'ID')} disabled={uploading} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-slate-300">Legal Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Johnathan Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-300">Personal Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-slate-300">Create Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="dark:text-slate-300">Identity Type</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="MASTER_ADMIN">Master Admin (Register New Branch)</option>
                </select>
              </div>

              {role === "MASTER_ADMIN" && (
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2">Institution Details</h3>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300 text-xs">Hospital Name</Label>
                    <Input
                      placeholder="e.g. Genesis Medical"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      required={role === "MASTER_ADMIN"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300 text-xs">Branch Name</Label>
                    <Input
                      placeholder="e.g. North Wing"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      required={role === "MASTER_ADMIN"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300 text-xs">Branch Address</Label>
                    <Input
                      placeholder="Street, City"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      required={role === "MASTER_ADMIN"}
                    />
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11" disabled={loading || uploading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Registering Account..." : "Submit for Verification"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="ml-1 text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
