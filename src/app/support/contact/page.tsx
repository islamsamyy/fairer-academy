'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (profile?.full_name) setName(profile.full_name);
      }
    });
  }, []);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setSending(true);
    setError('');
    const { error } = await supabase.from('support_messages').insert({
      user_id: userId, name, email, subject, message,
    });
    setSending(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">{t('contact.title') || 'Contact Us'}</h1>
          <p className="text-on-surface-variant mt-2 max-w-lg mx-auto">{t('contact.subtitle') || "We'd love to hear from you."}</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/10">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-emerald-600 text-3xl">mark_email_read</span>
                  </div>
                  <h2 className="text-xl font-headline font-bold text-on-surface mb-2">Message sent ✓</h2>
                  <p className="text-on-surface-variant text-sm mb-6">Thanks, {name.split(' ')[0]}! Our team will get back to you at {email}.</p>
                  <button
                    onClick={() => { setSent(false); setMessage(''); setSubject('General Inquiry'); }}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('contact.nameLabel') || 'Name'}</label>
                      <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Your name" type="text" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('contact.emailLabel') || 'Email'}</label>
                      <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="you@email.com" type="email" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('contact.messageLabel') || 'Message'}</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={6} placeholder="How can we help?" />
                  </div>
                  {error && <p className="text-sm text-error font-medium mb-4">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all outline-none flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined">send</span> {sending ? 'Sending…' : (t('contact.send') || 'Send Message')}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-4">
            {[
              { icon: 'mail', title: 'Email', desc: 'support@fairer.academy', sub: 'Typically replies within 2 hours' },
              { icon: 'schedule', title: 'Hours', desc: 'Mon–Fri, 9 AM – 6 PM UTC', sub: 'Weekend support via AI Mentor' },
              { icon: 'location_on', title: 'Office', desc: 'Cairo Innovation Hub', sub: 'Maadi Technology Park, Cairo' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-5 rounded-2xl border border-outline-variant/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">{item.title}</p>
                  <p className="font-bold text-on-surface text-sm">{item.desc}</p>
                  <p className="text-xs text-outline mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
            <Link href="/support/chat" className="flex items-center gap-3 p-5 bg-primary/5 rounded-2xl border border-primary/10 hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
              <div>
                <p className="font-bold text-primary text-sm">Instant AI Help</p>
                <p className="text-xs text-outline">Get immediate answers 24/7</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
