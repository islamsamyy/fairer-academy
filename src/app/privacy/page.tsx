'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-12 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">Privacy Protocol</h1>
        <p className="text-outline text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-on-surface-variant leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">1. Information We Collect</h2>
            <p>We collect the information you provide (name, email, profile details) and data generated as you use the platform (enrollments, progress, quiz results, reviews).</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">2. How We Use It</h2>
            <p>To deliver courses, track your learning progress, issue certificates, process payments, and improve the platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">3. Storage & Security</h2>
            <p>Your data is stored securely with row-level access controls so you can only access your own records. Passwords are managed by our authentication provider and never stored in plain text.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">4. Sharing</h2>
            <p>We do not sell your personal data. Limited information (e.g., your name on a review or forum post) is visible to other users by design.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">5. Your Rights</h2>
            <p>You can view and edit your profile in Settings, and request account deletion by contacting support.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">6. Contact</h2>
            <p>Questions about privacy? Reach us through the contact page.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex gap-6 text-sm">
          <Link href="/terms" className="text-primary font-bold hover:underline">Terms of Mastery</Link>
          <Link href="/support/contact" className="text-primary font-bold hover:underline">Contact us</Link>
        </div>
      </main>
    </div>
  );
}
