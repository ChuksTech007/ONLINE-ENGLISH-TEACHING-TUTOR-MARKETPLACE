import { mediaUrl } from "./api";

export function teacherPhoto(slug?: string | null, photoUrl?: string | null) {
  const remote = mediaUrl(photoUrl);
  if (remote) return remote;
  const s = (slug || "").toLowerCase();
  if (s.includes("amara")) return "/images/amara.jpg";
  if (s.includes("james")) return "/images/james.jpg";
  if (s.includes("sofia")) return "/images/sofia.jpg";
  return "";
}

export function teacherPhotoOrFallback(slug?: string | null, photoUrl?: string | null) {
  return teacherPhoto(slug, photoUrl) || "/images/teachers-group.jpg";
}

export function youtubeEmbed(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
