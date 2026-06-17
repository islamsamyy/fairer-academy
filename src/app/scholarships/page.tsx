'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export default function ScholarshipsPage() {
  const { t } = useLanguage();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [applyTarget, setApplyTarget] = useState<any>(null);
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data } = await supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) setScholarships(data);

      if (user) {
        const { data: apps } = await supabase
          .from('scholarship_applications')
          .select('scholarship_id')
          .eq('user_id', user.id);
        if (apps) setAppliedIds(new Set(apps.map((a: any) => a.scholarship_id)));
      }
      setLoading(false);
    }
    load();
  }, []);

  const submitApplication = async () => {
    if (!userId || !applyTarget) return;
    setSubmitting(true);
    const { error } = await supabase.from('scholarship_applications').insert({
      scholarship_id: applyTarget.id,
      user_id: userId,
      motivation,
    });
    setSubmitting(false);
    if (error) { alert(error.message); return; }
    setAppliedIds(prev => new Set([...prev, applyTarget.id]));
    setApplyTarget(null);
    setMotivation('');
  };

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">{t('scholarships.loading')}</div>;
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-64px)] px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex justify-center mb-5">
            <Image src="/logo.png" alt="جامعة فايرير السعودية" width={64} height={64} className="drop-shadow-[0_0_16px_rgba(0,200,255,0.5)] animate-float" />
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface mb-3">{t('scholarships.title') || 'Scholarships'}</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">{t('scholarships.subtitle') || 'Funded opportunities to accelerate your learning. Apply below.'}</p>
        </motion.header>

        {scholarships.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-outline-variant/10 shadow-xl shadow-primary/5 text-center">
            <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 font-bold w-fit mx-auto">
              <span className="material-symbols-outlined">event</span>
              {t('scholarships.openingSoon')}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map((s, i) => {
              const applied = appliedIds.has(s.id);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-headline font-bold text-on-surface">{s.title}</h3>
                    {s.amount != null && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold whitespace-nowrap">
                        ${Number(s.amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-5 flex-1">{s.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-outline font-mono mb-5">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">event_seat</span>{s.seats} {s.seats !== 1 ? t('scholarships.seats') : t('scholarships.seat')}</span>
                    {s.deadline && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{new Date(s.deadline).toLocaleDateString()}</span>}
                  </div>
                  {applied ? (
                    <div className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-center text-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span> {t('scholarships.applied')}
                    </div>
                  ) : !userId ? (
                    <Link href="/login?redirect=/scholarships" className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-center text-sm hover:opacity-90 transition-opacity">
                      {t('scholarships.signInToApply')}
                    </Link>
                  ) : (
                    <button onClick={() => setApplyTarget(s)} className="w-full py-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                      {t('scholarships.applyNow')}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setApplyTarget(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
          >
            <h2 className="text-xl font-headline font-bold text-on-surface mb-1">Apply: {applyTarget.title}</h2>
            <p className="text-sm text-outline mb-5">{t('scholarships.applyModalDesc')}</p>
            <textarea
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              rows={5}
              placeholder={t('scholarships.motivationPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3 mt-5">
              <button onClick={submitApplication} disabled={submitting} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-50">
                {submitting ? t('scholarships.submitting') : t('scholarships.submitApplication')}
              </button>
              <button onClick={() => setApplyTarget(null)} className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high">
                {t('scholarships.cancel')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
