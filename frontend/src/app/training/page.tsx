import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { trainingArticles } from "@/lib/training";

export const metadata: Metadata = { title: "Teacher training" };

export default function TrainingPage() {
  return (
    <div>
      <PageHero
        kicker="Free training"
        title="Guidance for teachers who want to teach English online well."
        subtitle="Completing these articles is optional. Approval depends on your profile, not on a training score."
        image="/images/materials.jpg"
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
        {trainingArticles.map((article) => (
          <Link key={article.slug} href={`/training/${article.slug}`} className="card-lift overflow-hidden rounded-[1.6rem] bg-white">
            <div className="img-zoom h-44">
              <img src={article.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl text-navy">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">{article.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
