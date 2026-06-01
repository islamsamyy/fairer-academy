'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) {
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setAvatarUrl(profile.avatar_url || '');
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleAvatarSelect = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      alert('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSavedMsg('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, avatar_url: avatarUrl || null, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setSaving(false);
    setSavedMsg(error ? `Error: ${error.message}` : 'Changes saved ✓');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setPwMsg('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    setPwMsg('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    setPwMsg(error ? `Error: ${error.message}` : 'Password updated ✓');
    if (!error) setNewPassword('');
    setTimeout(() => setPwMsg(''), 4000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading settings…</div>;
  }

  const initial = (fullName || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="bg-surface font-body text-on-background antialiased min-h-screen">
      <main className="max-w-3xl mx-auto px-6 py-10 pt-24">
        <motion.div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-on-background">{t('settings.title') || 'Settings'}</h2>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-bold text-error hover:underline">
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-8">

          {/* Profile */}
          <motion.section variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <h3 className="text-xl font-headline font-bold">Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-3">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative group cursor-pointer w-32 h-32 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-lg border-2 border-transparent hover:border-primary/30 transition-all bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold"
                >
                  {avatarUrl ? <img alt="avatar" className="w-full h-full object-cover" src={avatarUrl} /> : initial}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  </div>
                  {uploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Uploading…</div>}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarSelect(e.target.files[0])} />
                <p className="text-[10px] uppercase tracking-widest text-outline mt-4 text-center md:text-left">Click to upload</p>
              </div>
              <div className="md:col-span-9 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Full Name</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface outline-none" type="text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Email Address</label>
                    <input value={user?.email || ''} disabled className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-outline outline-none cursor-not-allowed" type="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface resize-y outline-none" rows={3} placeholder="Tell us about yourself…" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Security */}
          <motion.section variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary">lock</span>
              </div>
              <h3 className="text-xl font-headline font-bold">Security</h3>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Change Password</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="New password (min 6 chars)"
                  className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface outline-none"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={changingPw || !newPassword}
                  className="px-6 py-3 rounded-lg bg-secondary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
                >
                  {changingPw ? 'Updating…' : 'Update Password'}
                </button>
              </div>
              {pwMsg && <p className={`text-sm font-medium ${pwMsg.startsWith('Error') ? 'text-error' : 'text-emerald-600'}`}>{pwMsg}</p>}
            </div>
          </motion.section>

          {/* Preferences */}
          <motion.section variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary">tune</span>
              </div>
              <h3 className="text-xl font-headline font-bold">Preferences</h3>
            </div>
            <div className="space-y-2 max-w-xs">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Language</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border-2 ${language === 'en' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-low border-transparent text-outline hover:text-on-surface'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border-2 ${language === 'ar' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-low border-transparent text-outline hover:text-on-surface'}`}
                >
                  العربية
                </button>
              </div>
            </div>
          </motion.section>

          {/* Footer Actions */}
          <motion.div variants={itemVariants} className="mt-4 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant/20">
            {savedMsg && <p className={`text-sm font-bold ${savedMsg.startsWith('Error') ? 'text-error' : 'text-emerald-600'}`}>{savedMsg}</p>}
            <div className="flex gap-4 w-full md:w-auto md:ml-auto">
              <Link href="/dashboard" className="flex-1 md:flex-none px-8 py-4 rounded-xl font-headline font-bold text-outline hover:bg-surface-container hover:text-on-surface transition-all text-center">
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 md:flex-none px-12 py-4 rounded-xl font-headline font-bold bg-gradient-to-br from-primary to-primary-container text-white shadow-lg hover:shadow-primary/30 disabled:opacity-60 transition-all"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
