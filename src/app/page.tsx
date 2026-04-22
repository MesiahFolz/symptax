"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, Stethoscope, ShieldCheck, WifiOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import LogoAnimation from "@/components/LogoAnimation";
import { TutorialGate } from "@/components/tutorial/TutorialGate";
import { useTutorial } from "@/components/tutorial/TutorialContext";

export default function Home() {
  const [showTutorialGate, setShowTutorialGate] = useState(false);
  const { isActive, exitTutorial } = useTutorial();

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <TutorialGate isOpen={showTutorialGate} onClose={() => setShowTutorialGate(false)} />
      
      <header className="px-8 py-5 flex items-center justify-between border-b border-border bg-surface-flat/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <img src="/symptax_logo.svg" alt="SympTax" className="h-14 w-auto" id="main-logo" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <nav className="hidden md:flex items-center gap-2">
            {!isActive ? (
              <Button 
                variant="outline" 
                onClick={() => setShowTutorialGate(true)}
                className="font-black text-xs tracking-widest border-primary/20 text-primary hover:bg-primary/5 rounded-xl px-4"
              >
                TUTORIAL MODE
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                onClick={exitTutorial}
                className="font-black text-xs tracking-widest rounded-xl px-4"
              >
                EXIT TUTORIAL
              </Button>
            )}
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-sm tracking-wide">LOG IN</Button>
            </Link>
            <Link href="/register">
              <Button className="raised-button bg-primary text-primary-foreground font-black px-6 rounded-xl hover:scale-105">
                GET STARTED
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-32 px-6 text-center max-w-6xl mx-auto overflow-visible">
          {/* 3D background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full opacity-60" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-surface-subtle border border-border-raised shadow-inner text-xs font-bold text-primary tracking-[0.2em] uppercase">
            <ShieldCheck className="h-4 w-4" />
            Enterprise Health Systems
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter mb-8 leading-[0.95]">
            Health Records, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-500 to-indigo-600 drop-shadow-sm">Re-imagined.</span>
          </h1>

          <div className="scale-110 md:scale-125 mb-16">
            <LogoAnimation />
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            SympTax centralizes your medical journey with a secure clinical ledger, 
            <span className="text-foreground"> real-time telehealth</span>, and AI diagnostics.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/register" className="group" id="hero-register-btn">
              <Button className="raised-button w-full sm:w-80 h-16 text-xl bg-primary text-primary-foreground font-black rounded-2xl">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login" className="group" id="hero-login-btn">
              <Button variant="outline" className="w-full sm:w-64 h-16 text-xl border-2 border-border-raised bg-surface-flat font-black rounded-2xl hover:bg-surface-subtle shadow-[var(--shadow-raised)]">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section - Raised Cards */}
        <section className="py-32 bg-surface-subtle border-y border-border-raised relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">Built for the Modern Web</h2>
               <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto italic">Everything you need to manage your practice or your patient profile.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="raised-card p-10 flex flex-col group">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-inner group-hover:bg-primary group-hover:rotate-6 transition-all duration-500">
                  <Stethoscope className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Doctor-Patient Link</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Direct clinical channels with Master Admin oversight. Approved connections only for maximum privacy.
                </p>
                <div className="mt-auto pt-8">
                   <div className="h-1 w-12 bg-primary rounded-full" />
                </div>
              </div>
              
              <div className="raised-card p-10 flex flex-col group">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-blue-200 dark:border-blue-800 shadow-inner group-hover:bg-blue-600 transition-all duration-500">
                  <HeartPulse className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Smart Timeline</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  A unified digital ledger for diagnoses, prescriptions, and clinical media. No more paper records.
                </p>
                <div className="mt-auto pt-8">
                   <div className="h-1 w-12 bg-blue-500 rounded-full" />
                </div>
              </div>

              <div className="raised-card p-10 flex flex-col group">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-emerald-200 dark:border-emerald-800 shadow-inner group-hover:bg-emerald-600 transition-all duration-500">
                  <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Hierarchical Security</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Enterprise-grade governance. Multi-branch hospitals with delegated admin authority.
                </p>
                <div className="mt-auto pt-8">
                   <div className="h-1 w-12 bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Website-First Interaction Section */}
        <section className="py-32 px-6">
           <div className="max-w-6xl mx-auto raised-card bg-slate-900 dark:bg-primary p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 rounded-full" />
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Revolutionizing Healthcare?</h2>
              <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium">Join thousands of clinical professionals today. Experience the most advanced health ledger built for production.</p>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <Link href="/register">
                  <Button size="lg" className="raised-button h-16 px-12 text-xl bg-white text-slate-900 hover:bg-slate-50 font-black rounded-2xl">
                    Get Started Now
                  </Button>
                </Link>
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-surface-subtle border-t border-border-raised py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex flex-col items-center md:items-start">
              <img src="/symptax_logo.svg" alt="SympTax" className="h-12 w-auto mb-6" />
              <p className="text-muted-foreground text-center md:text-left max-w-sm font-medium">
                Empowering the digital health era with secure records and remote insight systems.
              </p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-8 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Architecture</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Security</Link>
              <Link href="#" className="hover:text-primary transition-colors">API Docs</Link>
           </div>

           <p className="text-muted-foreground/60 text-xs font-mono">
             © 2026 SympTax. Enterprise v1.2
           </p>
        </div>
      </footer>
    </div>
  );
}
