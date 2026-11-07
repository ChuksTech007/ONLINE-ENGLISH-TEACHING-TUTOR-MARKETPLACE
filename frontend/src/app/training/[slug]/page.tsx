import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { trainingArticles } from "@/lib/training";

export function generateStaticParams() {
  return trainingArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = trainingArticles.find((item) => item.slug === slug);
  return { title: article?.title ?? "Training" };
}

export default async function TrainingArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = trainingArticles.find((item) => item.slug === slug);
  if (!article) notFound();
  return (
    <article>
      <div className="relative h-72 bg-navy">
        <img src={article.image} alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-3xl px-4">
          <Link href="/training" className="text-sm text-gold">All training</Link>
          <h1 className="mt-2 font-display text-4xl text-cream">{article.title}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-lg leading-8 text-navy/80">
        {article.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <Link href="/register?role=TEACHER" className="btn-primary mt-6 inline-flex">
          Create your teacher profile
        </Link>
      </div>
    </article>
  );
}
