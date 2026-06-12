'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function BidJobsPage() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    // Store the interest as a support message so the team sees it in the admin inbox
    const { error } = await supabase.from('support_messages').insert({
      name: 'BidJobs Waitlist',
      email,
      subject: 'BidJobs launch notification request',
      message: `Please notify ${email} when BidJobs launches.`,
    });
    setStatus(error ? 'error' : 'done');
  };

  return (
    <div className="bg-surface min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-outline-variant/10 shadow-xl shadow-primary/5 text-center"
      >
        <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-primary text-4xl">work_history</span>
        </div>
        <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface mb-4">{t('bidjobs.title')}</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
          {t('bidjobs.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center gap-2 px-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl text-primary font-bold">
            <span className="material-symbols-outlined">rocket_launch</span>
            Launching Soon
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
          >
            Get Notified
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {status === 'done' ? (
                <p className="mt-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm">
                  ✅ You're on the list! We'll email you when BidJobs launches.
                </p>
              ) : (
                <form onSubmit={handleNotify} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="px-5 py-3.5 bg-surface-container-low rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium w-full sm:w-72"
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-6 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm disabled:opacity-60 hover:bg-primary/90 transition-colors"
                  >
                    {status === 'sending' ? 'Saving…' : 'Notify Me'}
                  </button>
                </form>
              )}
              {status === 'error' && (
                <p className="mt-3 text-destructive text-sm font-medium">Something went wrong — please try again.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
