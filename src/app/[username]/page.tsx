'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function InstructorProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ students: 0, reviews: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // The route param is the profile id (instructors are linked by id)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', username)
        .maybeSingle();

      if (!profileData) { setNotFound(true); setLoading(false); return; }
      setProfile(profileData);

      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', profileData.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (coursesData) setCourses(coursesData);

      const courseIds = (coursesData || []).map((c: any) => c.id);
      if (courseIds.length > 0) {
        const [{ count: studentCount }, { data: reviewData }] = await Promise.all([
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).in('course_id', courseIds),
          supabase.from('reviews').select('rating').in('course_id', courseIds),
        ]);
        const avg = reviewData && reviewData.length
          ? reviewData.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewData.length
          : 0;
        setStats({
          students: studentCount || 0,
          reviews: reviewData?.length || 0,
          avgRating: Math.round(avg * 10) / 10,
        });
      }
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading profile…</div>;
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-6xl text-outline/30">person_off</span>
        <p className="text-on-surface-variant">Instructor not found.</p>
        <Link href="/courses" className="text-primary font-bold hover:underline">Browse courses →</Link>
      </div>
    );
  }

  const name = profile.full_name || 'Instructor';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-0 pb-24">
        {/* Header */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-gradient-to-br from-primary/10 via-surface to-secondary/5 py-16 px-4 sm:px-8 pt-28">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8">
            {profile.avatar_url ? (
              <img alt={name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl" src={profile.avatar_url} />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-primary/15 border-4 border-white shadow-xl flex items-center justify-center text-primary text-5xl font-bold">
                {initial}
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-background">{name}</h1>
              <p className="text-primary font-bold mt-1 capitalize">{profile.role || 'Instructor'}</p>
              {profile.bio && <p className="text-on-surface-variant text-sm mt-3 max-w-lg">{profile.bio}</p>}
              <div className="flex flex-wrap gap-6 mt-6 justify-center sm:justify-start">
                {[
                  { value: stats.avgRating || '—', label: 'Rating' },
                  { value: stats.students.toLocaleString(), label: 'Students' },
                  { value: courses.length, label: 'Courses' },
                  { value: stats.reviews.toLocaleString(), label: 'Reviews' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold font-headline text-on-surface">{s.value}</p>
                    <p className="text-[10px] text-outline uppercase tracking-widest font-mono">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-10">
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Courses by {name}</h2>
          {courses.length === 0 ? (
            <p className="text-on-surface-variant py-10 text-center">No published courses yet.</p>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <motion.div key={c.id} variants={itemVariants}>
                  <Link href={`/courses/${c.id}`} className="bg-white rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-lg transition-shadow block group">
                    <div className="h-36 overflow-hidden bg-surface-container">
                      {c.thumbnail_url
                        ? <img alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={c.thumbnail_url} />
                        : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-outline/40">menu_book</span></div>}
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">{c.category}</span>
                      <h3 className="font-headline font-bold text-on-surface text-sm group-hover:text-primary transition-colors mt-1">{c.title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold font-headline text-on-surface">{c.price === 0 ? 'Free' : `$${c.price}`}</span>
                        <span className="text-xs text-outline capitalize">{c.level}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
