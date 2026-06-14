'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase sets a recovery session from the email link's hash fragment.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // also check if a session already exists (link already processed)
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl border border-outline-variant/10 shadow-xl p-8">
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
            </div>
            <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Password updated</h1>
            <p className="text-on-surface-variant text-sm">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">Set a new password</h1>
            <p className="text-on-surface-variant text-sm mb-6">
              {ready ? 'Enter your new password below.' : 'Open this page from the reset link in your email. Waiting for a valid recovery session…'}
            </p>
            <form onSubmit={submit} className="space-y-4">
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" disabled={!ready}
                className="w-full px-4 py-3.5 rounded-xl bg-surface-container-low border-0 focus:ring-2 focus:ring-primary/30 outline-none text-sm disabled:opacity-50" />
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" disabled={!ready}
                className="w-full px-4 py-3.5 rounded-xl bg-surface-container-low border-0 focus:ring-2 focus:ring-primary/30 outline-none text-sm disabled:opacity-50" />
              {error && <p className="text-sm text-error font-medium">{error}</p>}
              <button type="submit" disabled={loading || !ready} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
            <Link href="/login" className="block text-center text-sm text-outline hover:text-on-surface mt-4">Back to login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
