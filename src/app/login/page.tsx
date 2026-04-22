"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HeartPulse, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTutorial } from "@/components/tutorial/TutorialContext";
import { TUTORIAL_STEPS } from "@/lib/tutorialConfig";

export default function LoginPage() {
  const router = useRouter();
  const { isActive, role: tutorialRole, step } = useTutorial();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Tutorial Auto-fill Logic
  useEffect(() => {
    if (isActive && tutorialRole) {
      const currentStepData = TUTORIAL_STEPS[tutorialRole][step];
      if (currentStepData?.autoFill) {
        const data = currentStepData.autoFill;
        if (data.email) setEmail(data.email);
        if (data.password) setPassword(data.password);
      }
    }
  }, [isActive, tutorialRole, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error === "ACCOUNT_PENDING_VERIFICATION") {
        setError("Your account is pending approval by the Master Admin. Please check back later.");
      } else {
        setError("Invalid email or password");
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <img src="/symptax_logo.svg" alt="SympTax" className="h-28 w-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mt-2">Digital Health Record Platform</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 dark:bg-slate-900 dark:border dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Welcome back</CardTitle>
            <CardDescription className="dark:text-slate-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="dark:text-slate-300">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-10"
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
              <Button type="submit" id="login-submit-btn" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="ml-1 text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Create account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
