"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect from old prescriptions route to the new timeline
export default function PrescriptionsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/timeline");
  }, [router]);
  return null;
}
