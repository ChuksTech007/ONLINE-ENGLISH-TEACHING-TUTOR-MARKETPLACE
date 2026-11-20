"use client";

import { Headphones, Landmark, Shield, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

const adminLinks = [
  { href: "/dashboard/admin", label: "Operations home", icon: Shield },
  { href: "/dashboard/admin/teachers", label: "Teachers", icon: Users },
  { href: "/dashboard/admin/finance", label: "Finance", icon: Landmark },
  { href: "/dashboard/admin/support", label: "Customer chat", icon: Headphones },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || user.role !== "ADMIN") return <>{children}</>;

  return (
    <WorkspaceShell
      tone="admin"
      kicker="Operations console"
      title={`${user.firstName} ${user.lastName}`}
      subtitle="Approve teachers, set the contact fee, and audit advertising wallets. Lesson money never appears here."
      links={adminLinks}
    >
      {children}
    </WorkspaceShell>
  );
}
