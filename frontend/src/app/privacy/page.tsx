import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div>
      <PageHero kicker="Legal" title="Privacy" subtitle="We collect what we need to run accounts, messaging, lessons and advertising wallets." image="/images/library.jpg" />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 leading-8 text-navy/80">
        <p>Account data includes name, email, country, role and optional phone. Teachers also provide biography, qualifications, certificates, availability and payment instructions they choose to publish.</p>
        <h2 className="font-display text-2xl text-navy">What students can see</h2>
        <p>Public teacher profiles show professional information and the payment methods the teacher elected to display. Private certificate files are for administrators and the teacher, not for public download.</p>
        <h2 className="font-display text-2xl text-navy">Wallet data</h2>
        <p>Wallet balances and ledgers belong to the teacher and to administrators. Students cannot see another person’s advertising balance. Teachers cannot change their own balance from the browser.</p>
        <h2 className="font-display text-2xl text-navy">Messages</h2>
        <p>Conversations are stored so both parties can continue a thread. Do not send passwords or card numbers in chat. Lesson payments stay off-platform.</p>
      </article>
    </div>
  );
}
