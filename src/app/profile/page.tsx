'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/context/LanguageContext';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Profile() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certCount, setCertCount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: enrollData } = await supabase
        .from('enrollments')
        .select(`*, courses (id, title, category, thumbnail_url, total_duration_minutes)`)
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false, nullsFirst: false });
      if (enrollData) {
        setEnrollments(enrollData);
        const mins = enrollData.reduce((s, e) => s + (e.courses?.total_duration_minutes || 0), 0);
        setTotalHours(Math.round(mins / 60));
      }

      const { count } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setCertCount(count || 0);

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading profile…</div>;
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-surface font-body text-on-background min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <div className="flex pt-20 min-h-screen max-w-screen-2xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden lg:flex h-[calc(100vh-80px)] w-72 flex-col sticky top-20 left-0 bg-slate-50 px-6 py-8 gap-y-2">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-container flex items-center justify-center text-primary font-bold text-lg">
              {profile?.avatar_url
                ? <img alt={displayName} className="w-full h-full object-cover" src={profile.avatar_url} />
                : initial}
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface">{displayName}</h3>
              <p className="text-xs font-mono uppercase tracking-wider text-primary capitalize">{profile?.role || 'student'}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-y-1">
            <Link href="/profile" className="flex items-center gap-3 p-3 font-body text-sm font-medium bg-white text-cyan-600 shadow-sm rounded-xl active:scale-95 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              My Profile
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300 rounded-xl">
              <span className="material-symbols-outlined">auto_stories</span>
              Learning Path
            </Link>
            <Link href="/certificates" className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300 rounded-xl">
              <span className="material-symbols-outlined">military_tech</span>
              Certificates
            </Link>
            <Link href="/dashboard/orders" className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300 rounded-xl">
              <span className="material-symbols-outlined">payments</span>
              Orders
            </Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300 rounded-xl">
              <span className="material-symbols-outlined">shield</span>
              Settings
            </Link>
          </nav>
          <div className="mt-auto mb-10">
            <Link href="/courses" className="block text-center w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-bold text-sm hover:shadow-[0_0_15px_rgba(0,217,255,0.15)] transition-all active:scale-95">
              Browse Courses
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-10 space-y-12 pb-24 lg:pb-10">
          {/* Hero */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-2xl bg-surface-container-low p-8 flex flex-col md:flex-row justify-between items-end md:items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="z-10 space-y-2">
              <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface">{t('profile.title') || 'My Profile'}</h1>
              <p className="text-outline max-w-md">
                Welcome back, {displayName}. You're enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <div className="flex gap-8 z-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-start">
              <div className="text-center">
                <p className="text-3xl font-headline font-bold text-on-surface">{enrollments.length}</p>
                <p className="text-xs font-mono uppercase text-outline">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-headline font-bold text-on-surface">{totalHours}</p>
                <p className="text-xs font-mono uppercase text-outline">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-headline font-bold text-on-surface">{certCount}</p>
                <p className="text-xs font-mono uppercase text-outline">Certificates</p>
              </div>
            </div>
          </motion.section>

          {/* Learning Path */}
          <section className="space-y-8">
            <div className="flex gap-x-8 border-b border-outline-variant/30">
              <h2 className="pb-4 text-cyan-600 border-b-2 border-cyan-500 font-headline font-bold tracking-tight">Learning Path</h2>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest rounded-2xl">
                <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">school</span>
                <p className="text-on-surface-variant mb-4">You haven't enrolled in any courses yet.</p>
                <Link href="/courses" className="text-primary font-bold hover:underline">Explore courses →</Link>
              </div>
            ) : (
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrollments.map((e) => {
                  const progress = Math.round(e.progress_percentage || 0);
                  return (
                    <motion.div key={e.id} variants={fadeUpVariant} className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_24px_rgba(23,28,33,0.06)] relative overflow-hidden group">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded-full font-bold ${progress >= 100 ? 'bg-emerald-100 text-emerald-700' : progress > 0 ? 'bg-secondary-container/10 text-secondary' : 'bg-primary-container/20 text-on-primary-container'}`}>
                            {progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                          <span className="text-xs text-outline font-mono">{e.courses?.category}</span>
                        </div>
                        <h3 className="text-xl font-headline font-bold text-on-surface">{e.courses?.title}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-primary rounded-full"></motion.div>
                          </div>
                        </div>
                        <Link href={`/courses/lesson?id=${e.courses?.id}`} className="pt-2 text-primary font-mono text-sm font-bold flex items-center gap-2 group/btn">
                          {progress > 0 ? 'CONTINUE LESSON' : 'START LEARNING'}
                          <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </section>
        </main>
      </div>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 z-50 flex justify-around p-4 shadow-lg shadow-black/5">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="text-[10px] font-medium">Courses</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-medium font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
