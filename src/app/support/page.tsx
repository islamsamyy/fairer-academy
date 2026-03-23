'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const categories = [
  { icon: 'school', title: 'Courses & Enrollment', desc: 'Course access, certificates, and progress', count: 24 },
  { icon: 'payments', title: 'Billing & Payments', desc: 'Refunds, invoices, and subscriptions', count: 18 },
  { icon: 'settings', title: 'Account & Security', desc: 'Login issues, privacy, and settings', count: 15 },
  { icon: 'devices', title: 'Technical Support', desc: 'App issues, downloads, and performance', count: 12 },
  { icon: 'group', title: 'Community & Forum', desc: 'Guidelines, moderation, and conduct', count: 8 },
  { icon: 'workspace_premium', title: 'Pro Membership', desc: 'Features, upgrades, and benefits', count: 10 },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Settings > Security > Change Password. You can also reset from the login page by clicking "Forgot Password".' },
  { q: 'Can I get a refund after enrolling?', a: 'Yes, we offer a 30-day money-back guarantee on all courses. Contact our support team to initiate a refund.' },
  { q: 'How do I download my certificate?', a: 'Once you complete a course, visit your Certificates page. Click the PDF button to download your certificate.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use 256-bit SSL encryption and never store your full card details on our servers.' },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-0 pb-24">
        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden py-20 px-6 text-center bg-gradient-to-br from-primary/5 via-surface to-secondary/5">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block">support_agent</span>
            <h1 className="text-4xl sm:text-5xl font-headline font-bold tracking-tight text-on-background mb-4">How can we help?</h1>
            <p className="text-on-surface-variant text-lg mb-8">Search our help center or browse categories below</p>
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-outline-variant/10 px-5 py-3 max-w-lg mx-auto">
              <span className="material-symbols-outlined text-outline mr-3">search</span>
              <input className="bg-transparent border-none text-sm w-full outline-none placeholder:text-outline" placeholder="Search for help articles..." type="text" />
            </div>
          </div>
        </motion.section>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12 space-y-16">
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/support/chat" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all outline-none">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              AI Mentor Chat
            </Link>
            <Link href="/support/contact" className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors outline-none">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Contact Us
            </Link>
            <Link href="/support/community" className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors outline-none">
              <span className="material-symbols-outlined text-[18px]">forum</span>
              Community Forum
            </Link>
          </div>

          {/* Categories */}
          <section>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Browse by Topic</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <motion.div key={cat.title} variants={itemVariants} className="bg-white p-6 rounded-2xl border border-outline-variant/10 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">{cat.title}</h3>
                  <p className="text-xs text-outline mb-3">{cat.desc}</p>
                  <span className="text-[10px] font-mono font-bold text-primary">{cat.count} ARTICLES</span>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3 max-w-3xl">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left outline-none"
                  >
                    <span className="font-bold text-on-surface text-sm pr-4">{faq.q}</span>
                    <span className={`material-symbols-outlined text-outline transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5">
                      <p className="text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
