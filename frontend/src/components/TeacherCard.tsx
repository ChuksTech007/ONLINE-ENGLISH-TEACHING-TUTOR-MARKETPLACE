import Link from "next/link";
import { type TeacherCard as Teacher } from "@/lib/api";
import { teacherPhoto } from "@/lib/photos";
import { MapPin, Star } from "lucide-react";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  const photo = teacherPhoto(teacher.slug, teacher.photoUrl);

  return (
    <article className="card-lift flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-navy/8 bg-white shadow-sm">
      <div className="img-zoom relative h-60 bg-navy/5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`${teacher.firstName} ${teacher.lastName}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-navy/30">
            {teacher.firstName[0]}
          </div>
        )}
        {teacher.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-medium text-navy">
            Featured
          </span>
        )}
        {teacher.isNativeSpeaker && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs text-navy">
            Native speaker
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-navy">
              {teacher.firstName} {teacher.lastName}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-navy/60">
              <MapPin className="h-3.5 w-3.5" />
              {teacher.city ? `${teacher.city}, ` : ""}
              {teacher.country}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-navy">
              {teacher.currency} {Number(teacher.hourlyRate).toFixed(0)}
            </div>
            <div className="text-xs text-navy/50">per hour</div>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-navy/80">{teacher.bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {teacher.specializations.slice(0, 3).map((item) => (
            <span key={item} className="rounded-full bg-cream px-3 py-1 text-xs text-navy/80">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm text-navy/70">
          <Star className="h-4 w-4 fill-gold text-gold" />
          {Number(teacher.averageRating).toFixed(1)} · {teacher.reviewCount} reviews · {teacher.experienceYears} yrs
        </div>
        <div className="mt-5 flex gap-2">
          <Link href={`/teachers/${teacher.slug}`} className="flex-1 rounded-full border border-navy/15 px-4 py-2 text-center text-sm text-navy">
            View profile
          </Link>
          <Link href={`/teachers/${teacher.slug}#contact`} className="flex-1 rounded-full bg-navy px-4 py-2 text-center text-sm text-cream">
            Contact
          </Link>
        </div>
      </div>
    </article>
  );
}
