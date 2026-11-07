const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const BACKEND = API.replace(/\/api$/, "");

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND}${path}`;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || data.error || "Request failed";
    throw new ApiError(message, res.status, data.code);
  }
  return data as T;
}

export type AuthUser = {
  id: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  firstName: string;
  lastName: string;
  phone?: string | null;
  country: string;
  timezone: string;
  teacher?: {
    id: string;
    slug: string;
    status: string;
    featured: boolean;
    walletBalance: string;
  } | null;
  student?: { id: string; level: string } | null;
};

export type TeacherCard = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  country: string;
  city?: string;
  bio: string;
  qualifications: string;
  experienceYears: number;
  specializations: string[];
  levels: string[];
  languages: string[];
  isNativeSpeaker: boolean;
  hourlyRate: string;
  currency: string;
  featured: boolean;
  averageRating: string;
  reviewCount: number;
  acceptingNewEnquiries: boolean;
  preferredPlatform: string;
  timezone?: string;
  availability?: { dayOfWeek: number; startMinute: number; endMinute: number }[];
};
