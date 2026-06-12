'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-12 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">Terms of Mastery</h1>
        <p className="text-outline text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-on-surface-variant leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account or using جامعة فايرير السعودية, you agree to these Terms. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">2. Accounts</h2>
            <p>You are responsible for safeguarding your account credentials and for all activity under your account. You must provide accurate information and keep it up to date.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">3. Course Access & Enrollment</h2>
            <p>Enrolling in a course grants you a personal, non-transferable license to access its content. Free courses may be accessed at no cost; paid courses require payment at checkout.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">4. Refunds</h2>
            <p>Paid courses are covered by a 30-day money-back guarantee. Contact support to request a refund within that window.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">5. Instructor Content</h2>
            <p>Instructors retain ownership of the content they publish and are responsible for its accuracy and legality. جامعة فايرير السعودية is a hosting platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">6. Acceptable Use</h2>
            <p>You agree not to share account access, redistribute course materials, or disrupt the platform or other users.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">7. Changes</h2>
            <p>We may update these Terms from time to time. Continued use after changes constitutes acceptance.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex gap-6 text-sm">
          <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Protocol</Link>
          <Link href="/support/contact" className="text-primary font-bold hover:underline">Contact us</Link>
        </div>
      </main>
    </div>
  );
}
