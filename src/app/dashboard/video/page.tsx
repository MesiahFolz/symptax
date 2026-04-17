"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, PhoneOff, Maximize, Mic, VideoOff } from "lucide-react";

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const roomUrl = searchParams.get("url");
  const meetingId = searchParams.get("id");
  const videoRef = useRef<HTMLDivElement>(null);
  const [callFrame, setCallFrame] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!roomUrl || !videoRef.current || callFrame) return;

    const frame = DailyIframe.createFrame(videoRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "1rem",
      },
      showLeaveButton: true,
    });

    frame.join({ url: roomUrl });
    setCallFrame(frame);

    frame.on("left-meeting", () => {
      router.push("/dashboard/messages");
    });

    return () => {
      frame.destroy();
    };
  }, [roomUrl, router]);

  if (!roomUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Video className="h-16 w-16 text-slate-300 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Active Session</h2>
        <p className="text-slate-500 max-w-sm mt-2">
          You need a valid consultation link to join a video call. Please contact your doctor or patient.
        </p>
        <Button onClick={() => router.back()} className="mt-8 bg-blue-600 hover:bg-blue-700">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Clinical Video Consultation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Secure, encrypted medical consultation (Ref: {meetingId || "GENERIC"})
          </p>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl rounded-3xl">
        <div ref={videoRef} className="w-full h-full min-h-[500px]" />
      </Card>

      <div className="mt-6 flex justify-center gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-600 flex items-center gap-2">
          <ShieldCheck className="h-3 w-3" />
          SympTax Video utilizes Daily.co infrastructure with HIPAA-compatible encryption.
        </p>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
