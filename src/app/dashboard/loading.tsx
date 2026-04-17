"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-slate-800"></div>
          <div className="h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );
}
