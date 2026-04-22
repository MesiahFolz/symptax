"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (name.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      setLoading(false);
      toast.error("Username too short");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      toast.error("Password too short");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Account created successfully!", {
          description: "Your next step is to sign in with your new credentials.",
        });
        setTimeout(() => router.push("/login"), 2500);
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
        toast.error("Registration failed", {
          description: data.message || "Please check your details and try again.",
        });
      }
    } catch (err) {
      setError("An error occurred during registration");
      toast.error("Connection error", {
        description: "Please check your internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-sm text-center p-8 border-0 shadow-2xl dark:bg-slate-900">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-5 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-black mb-2 dark:text-white">Account Created!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm leading-relaxed">
            You can now sign in to access your dashboard.
          </p>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-semibold">
            Your next step is to verify your identity in your Profile to unlock all features.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Redirecting to login...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center justify-center">
          <img src="/symptax_logo.svg" alt="SympTax" className="h-24 w-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Digital Health Record Platform</p>
        </div>

        <Card className="border-0 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="dark:text-white text-xl font-black">Create Account</CardTitle>
            <CardDescription className="dark:text-slate-400 text-xs leading-relaxed">
              Sign up to get started. You can verify your identity later in your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-800 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Username</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="ml-1 text-primary font-bold hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
