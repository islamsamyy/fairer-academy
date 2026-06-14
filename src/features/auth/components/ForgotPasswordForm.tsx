'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl border border-outline-variant/10 shadow-xl p-8">
        <Link href="/login" className="text-sm text-outline hover:text-on-surface flex items-center gap-1 mb-6">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to login
        </Link>
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">mark_email_read</span>
            </div>
            <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Check your email</h1>
            <p className="text-on-surface-variant text-sm">If an account exists for <strong>{email}</strong>, a password reset link is on its way.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">Reset password</h1>
            <p className="text-on-surface-variant text-sm mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={submit} className="space-y-4">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-surface-container-low border-0 focus:ring-2 focus:ring-primary/30 outline-none text-sm"
              />
              {error && <p className="text-sm text-error font-medium">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
