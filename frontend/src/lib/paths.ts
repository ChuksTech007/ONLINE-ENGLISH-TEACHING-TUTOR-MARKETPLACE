import type { AuthUser } from "./api";

export function dashboardHome(role?: AuthUser["role"] | string | null) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "TEACHER") return "/dashboard/teacher";
  return "/dashboard";
}

export function teacherRedirect(pathname: string) {
  if (pathname.startsWith("/dashboard/teacher")) return null;
  if (pathname.startsWith("/dashboard/messages/")) {
    return pathname.replace("/dashboard/messages/", "/dashboard/teacher/messages/");
  }
  const map: Record<string, string> = {
    "/dashboard": "/dashboard/teacher",
    "/dashboard/profile": "/dashboard/teacher/profile",
    "/dashboard/wallet": "/dashboard/teacher/wallet",
    "/dashboard/enquiries": "/dashboard/teacher/enquiries",
    "/dashboard/messages": "/dashboard/teacher/messages",
    "/dashboard/lessons": "/dashboard/teacher",
  };
  return map[pathname] || "/dashboard/teacher";
}
