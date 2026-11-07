import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { FAQ } from "@/components/FAQ";
import { defaultFaqs } from "@/lib/faqs";

export const metadata: Metadata = { title: "FAQ" };

const extra = [
  ...defaultFaqs,
  {
    q: "Do I need to finish teacher training to go live?",
    a: "No. Training is free and optional. Visibility requires administrator approval of your profile, not a training certificate.",
  },
  {
    q: "Can I be both a student and a teacher?",
    a: "In this version each account has one role, chosen at registration. Use a second email if you need both.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHero
        kicker="FAQ"
        title="Clear answers about money, lessons and approval."
        subtitle="If a question is about a specific class, write to your teacher. If it is about the platform, start here."
        image="/images/materials.jpg"
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <FAQ items={extra} />
      </div>
    </div>
  );
}
