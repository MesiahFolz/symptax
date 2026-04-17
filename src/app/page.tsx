import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, Stethoscope, ShieldCheck, WifiOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import LogoAnimation from "@/components/LogoAnimation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/symptax_logo.svg" alt="SympTax" className="h-14 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3 ml-2">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20">Get Started</Button>
            </Link>
          </div>
          <div className="sm:hidden">
             <Link href="/login">
               <Button size="sm" variant="outline" className="dark:border-slate-700 dark:text-slate-300">Log in</Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-50/50 dark:bg-blue-900/10 blur-3xl -z-10 rounded-full" />
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
            Your Health Records, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">Simplified.</span>
          </h1>

          <LogoAnimation />
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            SympTax makes it easy for patients and doctors to connect, view prescriptions, and access medical history anytime, even offline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link href="/register" className="w-full sm:w-auto flex-1">
              <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex-1">
              <Button variant="outline" className="w-full h-14 text-lg border-2 border-slate-200 dark:border-slate-700 dark:text-white font-bold rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Choose SympTax?</h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Built for clarity, speed, and privacy in modern healthcare.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="bg-blue-100 dark:bg-blue-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                  <Stethoscope className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Doctor-Patient Link</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Seamlessly consult doctors, receive notes, and ask follow-up questions safely in our encrypted environment.
                </p>
              </div>
              
              <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="bg-teal-100 dark:bg-teal-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 transition-colors">
                  <WifiOff className="h-8 w-8 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Offline Access</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Keep your critical prescriptions and medical notes available on your device even without an internet connection.
                </p>
              </div>

              <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Secure & Private</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your health data is protected via stringent security practices and safe encryption protocols to ensure confidentiality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple CTA */}
        <section className="py-24 px-6">
           <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 dark:bg-blue-600 p-8 md:p-16 text-center transform shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to simplify your healthcare?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Join thousands of patients and doctors today. Free to register, accessible for all ages.</p>
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-xl shadow-xl transition-all hover:scale-105">
                   Get Started Now
                </Button>
              </Link>
           </div>
        </section>
      </main>

      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
           <div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                <img src="/symptax_logo.svg" alt="SympTax" className="h-12 w-auto" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                Empowering patients and doctors through secure digital records and remote health insights.
              </p>
           </div>
           <p className="text-slate-400 dark:text-slate-600 text-sm md:text-right">
             © 2026 SympTax. All rights reserved. Built for production.
           </p>
        </div>
      </footer>
    </div>
  );
}
