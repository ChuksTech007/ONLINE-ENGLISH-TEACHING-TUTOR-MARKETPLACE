"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { dashboardHome } from "@/lib/paths";

export default function LegacyProfileRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    router.replace(user.role === "TEACHER" ? "/dashboard/teacher/profile" : dashboardHome(user.role));
  }, [user, router]);
  return <p className="text-sm text-navy/60">Opening your workspace…</p>;
}
