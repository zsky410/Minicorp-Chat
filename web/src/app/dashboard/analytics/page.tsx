"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect analytics page to dashboard (analytics is now integrated in dashboard)
export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
