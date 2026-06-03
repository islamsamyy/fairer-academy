'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const categories = [
  { icon: 'school', title: 'Courses & Enrollment', desc: 'Course access, certificates, and progress', href: '/courses' },
  { icon: 'payments', title: 'Billing & Payments', desc: 'Refunds, invoices, and subscriptions', href: '/dashboard/orders' },
  { icon: 'settings', title: 'Account & Security', desc: 'Login issues, privacy, and settings', href: '/settings' },
  { icon: 'devices', title: 'Technical Support', desc: 'App issues, downloads, and performance', href: '/support/contact' },
  { icon: 'group', title: 'Community & Forum', desc: 'Guidelines, moderation, and conduct', href: '/support/community' },
  { icon: 'workspace_premium', title: 'Certificates', desc: 'Earn and download your certificates', href: '/certificates' },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Settings > Security > Change Password. You can also reset from the login page by clicking "Forgot Password".' },
  { q: 'Can I get a refund after enrolling?', a: 'Yes, we offer a 30-day money-back guarantee on all courses. Contact our support team to initiate a refund.' },
  { q: 'How do I download my certificate?', a: 'Once you complete a course, visit your Certificates page. Click the PDF button to download your certificate.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use 256-bit SSL encryption and never store your full card details on our servers.' },
];

export default function SupportPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filteredFaqs = q
    ? faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    : faqs;
  const filteredCategories = q
    ? categories.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    : categories;

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-0 pb-24">
        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden py-20 px-6 text-center bg-gradient-to-br from-primary/5 via-surface to-secondary/5">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block">support_agent</span>
            <h1 className="text-4xl sm:text-5xl font-headline font-bold tracking-tight text-on-background mb-4">{t('support.subtitle')}</h1>
            <p className="text-on-surface-variant text-lg mb-8">{t('support.searchPlaceholder')}</p>
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-outline-variant/10 px-5 py-3 max-w-lg mx-auto">
              <span className="material-symbols-outlined text-outline mr-3">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none text-sm w-full outline-none placeholder:text-outline"
                placeholder={t('support.searchPlaceholder')}
                type="text"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-outline hover:text-on-surface ml-2">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
        </motion.section>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12 space-y-16">
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/support/chat" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all outline-none">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              {t('support.chat')}
            </Link>
            <Link href="/support/contact" className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors outline-none">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {t('support.contactUs')}
            </Link>
            <Link href="/support/community" className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors outline-none">
              <span className="material-symbols-outlined text-[18px]">forum</span>
              {t('support.community')}
            </Link>
          </div>

          {/* Categories */}
          <section>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">{t('support.browseTitle')}</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => (
                <motion.div key={cat.title} variants={itemVariants}>
                  <Link href={cat.href} className="block h-full bg-white p-6 rounded-2xl border border-outline-variant/10 hover:shadow-md hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-xs text-outline mb-3">{cat.desc}</p>
                    <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-1">
                      Open <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
              {filteredCategories.length === 0 && (
                <p className="text-on-surface-variant col-span-full text-center py-6">No topics match "{query}"</p>
              )}
            </motion.div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">{t('support.faqTitle')}</h2>
            <div className="space-y-3 max-w-3xl">
              {filteredFaqs.length === 0 && (
                <p className="text-on-surface-variant py-4">No answers match "{query}". Try <Link href="/support/contact" className="text-primary font-bold hover:underline">contacting us</Link>.</p>
              )}
              {filteredFaqs.map((faq, i) => (
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
