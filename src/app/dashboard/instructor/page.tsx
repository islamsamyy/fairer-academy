'use client';

import React, { useState, useEffect } from 'react';
import { motion , Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

export default function InstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [avgCompletion, setAvgCompletion] = useState(0);
  const [courseFilter, setCourseFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [monthly, setMonthly] = useState<{ label: string; revenue: number; enrollments: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Fetch instructor's courses with stats from 'course_stats' view
      const { data: coursesData } = await supabase
        .from('course_stats')
        .select('*')
        .eq('instructor_id', user.id);

      if (coursesData) {
        setCourses(coursesData);

        // Compute real average completion across enrollments in these courses
        const courseIds = coursesData.map((c: any) => c.id || c.course_id).filter(Boolean);
        if (courseIds.length > 0) {
          const { data: enrolls } = await supabase
            .from('enrollments')
            .select('progress_percentage')
            .in('course_id', courseIds);
          if (enrolls && enrolls.length > 0) {
            const avg = enrolls.reduce((s, e) => s + Number(e.progress_percentage || 0), 0) / enrolls.length;
            setAvgCompletion(Math.round(avg * 10) / 10);
          }

          // Build last-6-months revenue + enrollment series from real data
          const since = new Date();
          since.setMonth(since.getMonth() - 5);
          since.setDate(1);
          since.setHours(0, 0, 0, 0);

          const [{ data: orderRows }, { data: enrollRows }] = await Promise.all([
            supabase.from('orders').select('amount, created_at, status')
              .in('course_id', courseIds).gte('created_at', since.toISOString()),
            supabase.from('enrollments').select('enrolled_at')
              .in('course_id', courseIds).gte('enrolled_at', since.toISOString()),
          ]);

          const buckets: { label: string; key: string; revenue: number; enrollments: number }[] = [];
          for (let i = 0; i < 6; i++) {
            const d = new Date(since);
            d.setMonth(since.getMonth() + i);
            buckets.push({
              label: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
              key: `${d.getFullYear()}-${d.getMonth()}`,
              revenue: 0,
              enrollments: 0,
            });
          }
          const idxFor = (iso: string) => {
            const d = new Date(iso);
            return buckets.findIndex(b => b.key === `${d.getFullYear()}-${d.getMonth()}`);
          };
          (orderRows || []).forEach((o: any) => {
            if (o.status === 'refunded' || o.status === 'failed') return;
            const i = idxFor(o.created_at);
            if (i >= 0) buckets[i].revenue += Number(o.amount || 0);
          });
          (enrollRows || []).forEach((e: any) => {
            const i = idxFor(e.enrolled_at);
            if (i >= 0) buckets[i].enrollments += 1;
          });
          setMonthly(buckets.map(({ label, revenue, enrollments }) => ({ label, revenue, enrollments })));
        }
      }
      setLoading(false);
    }

    getInitialData();
  }, [router]);

  const filteredCourses = courses.filter(c =>
    courseFilter === 'all' ? true : courseFilter === 'published' ? c.is_published : !c.is_published
  );

  return (
    <div className="min-h-screen bg-surface font-body text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-surface-container-highest/20">
        <div className="flex items-center justify-between px-8 h-20 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform outline-none">
              <img
                alt="Fairer Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/ADBb0ui2HQlH4wehKDIFaKTzAAckSSlEp01ZDpqHBp-Yp3Xye2uSD5tyyoDtonRUNNrmktf17V6fxm089lUSM3btWWjMN8bKck3QfY8__gPG3swJlkvPSQEtEp6RbYKD4vLTGiZgAzYe3S9tDSNnVFN_JK1jOCv3NCscNRt1YMj5y4rFn-RKfw1XFcA9rSaBS4OJw6NFTLiFD7WPj2PgNr1mkIdjmPLAzA0t1sGxB4LXmNEKL15HOLWPpHzzkBoINpSkbdMeRKKNDepbwA"
              />
              <span className="text-2xl font-black text-primary tracking-tighter font-headline">Fairer</span>
            </Link>
            
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-surface-container rounded-lg transition-all active:scale-90 outline-none">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link href="/settings" className="p-2 text-slate-500 hover:bg-surface-container rounded-lg transition-all active:scale-90 outline-none">
              <span className="material-symbols-outlined">settings</span>
            </Link>
            <Link href="/profile" className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container outline-none hover:scale-105 transition-transform cursor-pointer bg-primary/10 flex items-center justify-center text-primary font-bold">
              {profile?.avatar_url
                ? <img className="w-full h-full object-cover" alt="Instructor profile avatar" src={profile.avatar_url} />
                : (profile?.full_name || 'I').charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-20 h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 bg-surface-container-lowest/50 border-r border-surface-container-highest/50 z-10">
          <div className="space-y-1">
            <h3 className="font-headline font-bold text-on-surface px-3 py-2">The Academy</h3>
            <p className="text-xs text-outline px-3 uppercase tracking-widest font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Luminous Logic
            </p>
          </div>
          <nav className="space-y-2 flex-grow">
            <Link href="/dashboard/instructor" className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-primary shadow-sm rounded-xl font-body text-sm font-medium transition-all duration-200 border border-surface-container-highest/20 outline-none">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                dashboard
              </span>
              <span>Overview</span>
            </Link>
            <Link href="/dashboard/instructor" className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-on-surface hover:bg-surface-container transition-all duration-200 rounded-xl font-body text-sm font-medium outline-none">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">monitoring</span>
              <span>Analytics</span>
            </Link>
            <Link href="/courses/create" className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-on-surface hover:bg-surface-container transition-all duration-200 rounded-xl font-body text-sm font-medium outline-none">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">menu_book</span>
              <span>Content</span>
            </Link>
            <Link href="/support/community" className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-on-surface hover:bg-surface-container transition-all duration-200 rounded-xl font-body text-sm font-medium outline-none">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">group</span>
              <span>Community</span>
            </Link>
            <Link href="/settings" className="group flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-on-surface hover:bg-surface-container transition-all duration-200 rounded-xl font-body text-sm font-medium outline-none">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">tune</span>
              <span>Settings</span>
            </Link>
          </nav>
          <div className="pt-6 border-t border-surface-container-highest/50">
            <Link href="/courses/create" className="group w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all outline-none">
              <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add_circle</span>
              Create New Course
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-10 pb-24 lg:pb-10">
            {/* Header Section */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
            >
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight text-on-background mb-2 font-headline">
                  {loading ? 'Initializing...' : `Welcome back, ${profile?.full_name || 'Instructor'}.`}
                </h1>
                <p className="text-xl text-slate-500">
                  Your <span className="text-primary font-semibold">Fairer</span> performance is updated in real-time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-3 bg-white/50 backdrop-blur-md border border-outline-variant/20 rounded-xl font-semibold text-sm hover:bg-white transition-all outline-none">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    share
                  </span>
                  Share Stats
                </button>
                <Link href="/courses/create" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform hover:shadow-primary/30 outline-none">
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Launch New Module
                </Link>
              </div>
            </motion.header>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Computed Aggregates */}
              {(() => {
                const totalStudents = courses.reduce((sum, c) => sum + Number(c.student_count || 0), 0);
                const totalRevenue = courses.reduce((sum, c) => sum + Number(c.total_revenue || 0), 0);
                const avgRating = courses.length ? (courses.reduce((sum, c) => sum + Number(c.avg_rating || 0), 0) / courses.length).toFixed(1) : "0.0";
                const publishedCount = courses.filter(c => c.is_published).length;
                
                return (
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-container/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                          <span className="material-symbols-outlined text-[14px]">trending_up</span>
                          Active
                        </span>
                      </div>
                      <p className="text-sm font-medium text-outline mb-1">Total Students</p>
                      <h2 className="text-3xl font-bold text-on-surface font-headline">{totalStudents}</h2>
                    </div>
                    
                    <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-container/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl">payments</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                          <span className="material-symbols-outlined text-[14px]">trending_up</span>
                          Active
                        </span>
                      </div>
                      <p className="text-sm font-medium text-outline mb-1">Total Revenue</p>
                      <h2 className="text-3xl font-bold text-on-surface font-headline">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                    </div>
                    
                    <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-container/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-outline bg-surface-container px-2 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">horizontal_rule</span>
                          Average
                        </span>
                      </div>
                      <p className="text-sm font-medium text-outline mb-1">Avg Rating</p>
                      <h2 className="text-3xl font-bold text-on-surface font-headline">{avgRating} <span className="text-lg text-outline font-normal">/ 5.0</span></h2>
                    </div>
                    
                    <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-container/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl">school</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          {courses.length}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-outline mb-1">Active Courses</p>
                      <h2 className="text-3xl font-bold text-on-surface font-headline">{publishedCount}</h2>
                    </div>
                  </motion.div>
                );
              })()}


              {/* Revenue Chart and Insights Section */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
                <div className="lg:col-span-2 p-6 md:p-8 bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10">
                  <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-on-surface font-headline">Revenue Tracking</h3>
                      <p className="text-sm text-outline">Monthly earnings over the last 6 months</p>
                    </div>
                    <button
                      onClick={() => {
                        const rows = [['Month', 'Revenue', 'Enrollments'], ...monthly.map(m => [m.label, m.revenue, m.enrollments])];
                        const csv = rows.map(r => r.join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = 'revenue.csv';
                        a.click();
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all outline-none"
                    >
                      Download CSV
                    </button>
                  </div>

                  {/* Real Bar Chart from order/enrollment data */}
                  {(() => {
                    const maxRev = Math.max(1, ...monthly.map(m => m.revenue));
                    const peakIdx = monthly.reduce((best, m, i, arr) => m.revenue > arr[best].revenue ? i : best, 0);
                    return (
                      <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-1 sm:px-2 pt-4 border-b border-outline-variant/20 pb-4">
                        {monthly.length === 0 ? (
                          <div className="w-full h-full flex items-center justify-center text-sm text-outline">No revenue data yet</div>
                        ) : monthly.map((m, i) => {
                          const pct = Math.round((m.revenue / maxRev) * 100);
                          const isPeak = i === peakIdx && m.revenue > 0;
                          return (
                            <div key={m.label + i} className="flex flex-col items-center gap-3 w-full h-full justify-end">
                              <div className="relative w-full group" style={{ height: `${Math.max(pct, 2)}%` }}>
                                <motion.div
                                  initial={{ height: 0 }} animate={{ height: '100%' }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 }}
                                  className={`absolute inset-x-0 bottom-0 rounded-t-lg ${isPeak ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-primary-container/50 group-hover:bg-primary/40'} transition-colors`}
                                />
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10">
                                  ${m.revenue.toLocaleString()} · {m.enrollments} enr.
                                </div>
                              </div>
                              <span className={`text-xs font-mono ${isPeak ? 'text-primary font-bold' : 'text-outline'}`}>{m.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="p-6 bg-gradient-to-br from-secondary to-secondary-container rounded-3xl text-white shadow-xl shadow-secondary/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-secondary-container opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-2 font-headline">Avg Completion Rate</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-bold font-headline tracking-tighter">{avgCompletion}%</span>
                        <span className="text-xs opacity-80 font-medium">across all enrollments</span>
                      </div>
                      <div className="w-full bg-white/20 h-2 rounded-full mb-6 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${avgCompletion}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} className="bg-white h-full rounded-full"></motion.div>
                      </div>
                      <p className="text-sm opacity-90 leading-relaxed italic border-l-2 border-white/30 pl-3">Average progress of students enrolled in your courses.</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <span className="material-symbols-outlined text-9xl">auto_awesome</span>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-tertiary-container rounded-3xl text-on-tertiary-container shadow-sm relative overflow-hidden group border border-tertiary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-tertiary bg-white/50 p-1.5 rounded-lg">military_tech</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container/80">Milestone Achieved</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 font-headline">Top Instructor</h3>
                    <p className="text-sm opacity-90 mb-6 font-medium">Awarded for high student satisfaction scores 3 months in a row.</p>
                    <button className="w-full py-2.5 bg-white/50 hover:bg-white/80 backdrop-blur text-xs font-bold rounded-xl border border-white/40 transition-all text-on-tertiary-container shadow-sm">
                      View Rewards
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Course Performance Table */}
              <motion.div variants={itemVariants} className="p-6 md:p-8 bg-surface-container-lowest rounded-3xl shadow-sm mb-10 overflow-hidden border border-outline-variant/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface font-headline">Course Performance</h3>
                    <p className="text-sm text-outline mt-1">Detailed overview of your active curriculum</p>
                  </div>
                  <div className="flex items-center gap-1 border border-surface-container-highest bg-surface-container-low p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                    {([['all', 'All Courses'], ['published', 'Published'], ['draft', 'Drafts']] as const).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setCourseFilter(key)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap outline-none transition-colors ${courseFilter === key ? 'bg-white shadow-sm text-primary' : 'text-outline hover:text-on-surface'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr className="text-left border-b border-surface-container-highest/50">
                        <th className="pb-4 pt-2 font-headline text-sm font-bold text-outline pl-2">Course Title</th>
                        <th className="pb-4 pt-2 font-headline text-sm font-bold text-outline">Students</th>
                        <th className="pb-4 pt-2 font-headline text-sm font-bold text-outline">Avg Rating</th>
                        <th className="pb-4 pt-2 font-headline text-sm font-bold text-outline">Revenue</th>
                        <th className="pb-4 pt-2 font-headline text-sm font-bold text-outline">Status</th>
                        <th className="pb-4 pt-2 font-headline text-sm font-bold text-outline pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-highest/30">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-outline">Loading your portfolio...</td>
                        </tr>
                      ) : filteredCourses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <p className="text-on-surface-variant mb-4">{courses.length === 0 ? "You haven't created any courses yet." : 'No courses match this filter.'}</p>
                            <Link href="/courses/create" className="text-primary font-bold hover:underline">Create your first course</Link>
                          </td>
                        </tr>
                      ) : (
                        filteredCourses.map((course) => (
                          <tr key={course.id || course.course_id} className="group hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden">
                                  {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <span className="material-symbols-outlined">menu_book</span>
                                  )}
                                </div>
                                <div className="font-bold text-on-surface group-hover:text-primary transition-colors outline-none font-headline">
                                  {course.title}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-mono text-sm font-medium text-on-surface-variant">{course.student_count || 0}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-on-surface-variant">{Number(course.avg_rating || 0).toFixed(1)}</span>
                                <span className="material-symbols-outlined text-xs text-amber-500">star</span>
                              </div>
                            </td>
                            <td className="py-4 font-mono text-sm font-bold text-on-surface">${Number(course.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${
                                course.is_published 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-surface-container-highest/50 text-outline border-outline-variant/30'
                              }`}>
                                {course.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="py-4 pr-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <Link href={`/courses/${course.id || course.course_id}/edit`} className="inline-flex p-2 text-outline-variant hover:text-primary hover:bg-primary-container/20 rounded-lg transition-colors outline-none" title="Edit course">
                                  <span className="material-symbols-outlined">edit</span>
                                </Link>
                                <Link href={`/courses/${course.id || course.course_id}`} className="inline-flex p-2 text-outline-variant hover:text-primary hover:bg-primary-container/20 rounded-lg transition-colors outline-none" title="View course">
                                  <span className="material-symbols-outlined">open_in_new</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-8 flex justify-center">
                  <Link href="/courses/create" className="text-sm font-bold text-primary hover:text-primary/80 hover:underline transition-all outline-none flex items-center gap-1">
                    Create another course
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Floating Action Button - Mobile Only */}
      <Link href="/courses/create" className="fixed bottom-6 right-6 lg:hidden z-40 outline-none">
        <button className="h-14 w-14 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-lg shadow-primary/30 text-white flex items-center justify-center active:scale-95 transition-transform outline-none">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </Link>
    </div>
  );
}
