import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <div>
      <PageHero kicker="Legal" title="Terms of use" subtitle="Merit is an advertising marketplace for independent English teachers. These terms describe how the platform operates." image="/images/library.jpg" />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 leading-8 text-navy/80">
        <p>By creating an account you agree that Merit does not employ teachers, does not collect lesson fees, and does not guarantee learning outcomes. Teachers are independent providers. Students contract with teachers directly.</p>
        <h2 className="font-display text-2xl text-navy">Accounts</h2>
        <p>You must provide accurate information. Teachers remain pending until an administrator approves the public profile. Merit may suspend accounts that abuse other users, submit fake enquiries, or attempt to manipulate advertising wallets.</p>
        <h2 className="font-display text-2xl text-navy">Advertising credits</h2>
        <p>Credits are an internal advertising balance. They are deducted on a first contact between a student and a teacher. Repeat messages in that relationship are not charged. Profile views are not charged. Refunds of credits, where granted, are recorded as new transactions.</p>
        <h2 className="font-display text-2xl text-navy">Lessons</h2>
        <p>Video classrooms are hosted by Zoom, Google Meet or similar tools chosen by the teacher. Merit stores the meeting link. Payment for lessons is arranged privately between student and teacher.</p>
      </article>
    </div>
  );
}
