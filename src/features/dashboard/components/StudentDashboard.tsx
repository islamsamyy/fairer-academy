'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion , Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowSuccess(true);
    }
  }, [searchParams]);

  useEffect(() => {
    async function getInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Role guard â€” students only; redirect others to their dashboard
      const { data: role } = await supabase.rpc('get_my_role');
      if (role === 'admin') { router.replace('/dashboard/admin'); return; }
      if (role === 'instructor') { router.replace('/dashboard/instructor'); return; }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(profileData || { full_name: 'Innovator', role: 'student' });

      // Fetch Enrollments with Course details
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id);
      
      if (enrollmentsData) {
        setEnrollments(enrollmentsData);
      }
      
      // Fetch Certificates
      const { data: certData } = await supabase
        .from('certificates')
        .select(`
          *,
          courses (title)
        `)
        .eq('user_id', user.id);
      
      if (certData) {
        setCertificates(certData);
      }
      
      setLoading(false);
    }

    getInitialData();
  }, [router]);

  return (
    <div className="bg-background font-body text-on-background min-h-screen">
      {/* TopNavBar */}

      {/* SideNavBar (Hidden on Mobile) */}
      <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-20 hover:w-72 transition-all duration-500 ease-in-out group z-40 bg-slate-50/50 backdrop-blur-md border-r border-slate-200/20 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex flex-col gap-2">
          {/* Active: Dashboard */}
          <a className="flex items-center gap-4 p-3 bg-cyan-500/10 text-cyan-600 rounded-xl transition-all duration-300 ease-out" href="/dashboard">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">Dashboard</span>
          </a>
          <a className="flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all duration-300 ease-out" href="/dashboard/orders">
            <span className="material-symbols-outlined">auto_stories</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">{t('dashboard.myCourses')}</span>
          </a>
          <a className="flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all duration-300 ease-out" href="/certificates">
            <span className="material-symbols-outlined">military_tech</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">Certificates</span>
          </a>
          <a className="flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all duration-300 ease-out" href="/support/community">
            <span className="material-symbols-outlined">group</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">Community</span>
          </a>
          <a className="flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all duration-300 ease-out" href="/dashboard/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">Notifications</span>
          </a>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <a className="flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all duration-300 ease-out" href="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">Settings</span>
          </a>
          <a className="flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all duration-300 ease-out" href="/support">
            <span className="material-symbols-outlined">help</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">Support</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-20 pt-[72px] min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-10">
          {/* Success Alert */}
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-600"
            >
              <span className="material-symbols-outlined text-2xl">verified_user</span>
              <div className="flex-1">
                <h3 className="font-bold text-sm uppercase tracking-widest">Enrollment Successful</h3>
                <p className="text-xs">Congratulations! You've successfully joined your chosen programs. Your specialized learning path is now active.</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="text-emerald-600 hover:text-emerald-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </motion.div>
          )}

          {/* Header Section */}
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
            {/* Futuristic glass welcome banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-cyan-600 to-secondary p-8 mb-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 animate-blob pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-white/70 text-xs font-mono font-bold uppercase tracking-widest mb-1">Welcome back</p>
                  <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter text-white mb-2">
                    Assalam, <span className="text-white/90">{loading ? '...' : (profile?.full_name || 'Innovator')}</span>! ðŸ‘‹
                  </h1>
                  <p className="text-white/70 font-body text-sm">Youâ€™re in the top 10% of active learners this week.</p>
                </div>
                <div className="flex gap-4 flex-shrink-0">
                  <div className="glass-dark rounded-2xl px-5 py-3 text-center border border-white/10">
                    <p className="text-white font-heading font-black text-2xl">ðŸ”¥ 12</p>
                    <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Day streak</p>
                  </div>
                  <div className="glass-dark rounded-2xl px-5 py-3 text-center border border-white/10">
                    <p className="text-white font-heading font-black text-2xl">{loading ? 'â€”' : enrollments.length}</p>
                    <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Stats Grid */}
          <motion.section initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Stat Card: Streak */}
            <motion.div variants={fadeUpVariant} className="glass-glow p-6 rounded-2xl card-hover-glow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-orange-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="text-primary text-xs font-mono bg-primary/10 px-2 py-1 rounded-full">+2 today</span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Learning Streak</p>
              <h3 className="text-3xl font-heading font-black text-on-background">12 Days</h3>
            </motion.div>
            {/* Stat Card: Courses */}
            <motion.div variants={fadeUpVariant} className="glass-glow p-6 rounded-2xl card-hover-glow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-secondary text-3xl">menu_book</span>
                <span className="text-secondary text-xs font-mono bg-secondary/10 px-2 py-1 rounded-full">{enrollments.length} Active</span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">In Progress</p>
              <h3 className="text-3xl font-heading font-black text-on-background">{enrollments.length} Courses</h3>
            </motion.div>
            {/* Stat Card: Certificates */}
            <motion.div variants={fadeUpVariant} className="bg-surface-container-lowest p-6 rounded-xl border border-tertiary-container/5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <span className="text-tertiary text-xs font-mono">Latest: {certificates.length > 0 ? certificates[0].courses?.title : 'None'}</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">{t('dashboard.certificates')}</p>
              <h3 className="text-3xl font-headline font-bold">{certificates.length} Earned</h3>
            </motion.div>
            {/* Stat Card: Time */}
            <motion.div variants={fadeUpVariant} className="bg-surface-container-lowest p-6 rounded-xl border border-primary-container/5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                <span className="text-primary text-xs font-mono">Avg 2.5h</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Study Time</p>
              <h3 className="text-3xl font-headline font-bold">{enrollments.length * 15.5} hrs</h3>
            </motion.div>
          </motion.section>

          {/* Learning Journey Chart & Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Chart Area (Bento Large) */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h2 className="font-headline text-2xl font-bold mb-1">Learning Journey</h2>
                  <p className="text-on-surface-variant text-sm">Focus intensity across the last 7 days</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-surface-container-lowest rounded-lg text-xs font-medium border border-outline-variant/20">Weekly</span>
                  <span className="px-3 py-1 hover:bg-surface-container-lowest rounded-lg text-xs font-medium border border-transparent transition-colors cursor-pointer">Monthly</span>
                </div>
              </div>
              {/* Chart Placeholder */}
              <div className="h-48 flex items-end justify-between gap-4 px-4 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path className="text-primary" d="M0,80 Q25,20 50,60 T100,40" fill="none" stroke="currentColor" strokeWidth="2"></path>
                  </svg>
                </div>
                <motion.div initial={{ height: 0 }} animate={{ height: "8rem" }} transition={{ duration: 0.8 }} className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-all">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Mon</div>
                </motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: "6rem" }} transition={{ duration: 0.8, delay: 0.1 }} className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-all"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: "10rem" }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 bg-primary/40 rounded-t-lg relative group cursor-pointer hover:bg-primary/60 transition-all"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: "4rem" }} transition={{ duration: 0.8, delay: 0.3 }} className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-all"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: "9rem" }} transition={{ duration: 0.8, delay: 0.4 }} className="flex-1 bg-secondary/30 rounded-t-lg relative group cursor-pointer hover:bg-secondary/50 transition-all"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: "7rem" }} transition={{ duration: 0.8, delay: 0.5 }} className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-all"></motion.div>
                <motion.div initial={{ height: 0 }} animate={{ height: "11rem" }} transition={{ duration: 0.8, delay: 0.6 }} className="flex-1 bg-primary/50 rounded-t-lg relative group cursor-pointer hover:bg-primary/70 transition-all border-t-4 border-primary-container"></motion.div>
              </div>
            </motion.div>

            {/* Secondary Info Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="bg-surface-container-highest p-8 rounded-xl flex flex-col justify-center border border-white/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="mb-6 relative z-10 text-left">
                <h4 className="text-secondary font-headline font-bold uppercase tracking-widest text-[10px] mb-2">Next Milestone</h4>
                <h3 className="text-xl font-headline font-bold">Bridge to BidJobs</h3>
                <p className="text-on-surface-variant text-sm mt-2">Complete your current certifications to unlock exclusive internship opportunities on our partner platform.</p>
              </div>
              <div className="mt-4 flex -space-x-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-surface-container-highest bg-[linear-gradient(135deg,#ffba49_0%,#ffddb1_50%,#ffba49_100%)] bg-[length:200%_200%] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs text-outline">lock</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Continue Learning Section */}
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-headline text-3xl font-bold">{t('dashboard.continueLearning')}</h2>
              <Link className="text-primary font-medium text-sm flex items-center gap-1 hover:underline" href="/courses">{t('dashboard.viewAll')} Curriculum <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 py-12 text-center text-outline">Loading your learning path...</div>
              ) : enrollments.length === 0 ? (
                <div className="col-span-3 py-12 text-center bg-surface-container-low rounded-xl">
                  <p className="text-on-surface-variant mb-4">You are not enrolled in any courses yet.</p>
                  <Link href="/courses" className="text-primary font-bold hover:underline">{t('dashboard.exploreCourses')}</Link>
                </div>
              ) : (
                enrollments.map((enr) => (
                  <div key={enr.id} className="bg-surface-container-lowest rounded-xl overflow-hidden group shadow-sm hover:shadow-lg transition-shadow">
                    <div className="h-40 relative overflow-hidden">
                      <img 
                        alt={enr.courses.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        src={enr.courses.thumbnail_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjdV9rs0XJYU0f5YyxXrLkxfr6Im0_UeV16HnWbSb58OZ7dOmxl-C8fRQFuw4RMPh0ExemHAqZuaZFQs3EKVjRsFEv-5DYFk-I7BR2Nx1ijU9ry-wLXmBZsNrq6JgSOsseaaa0s8DWiWzqe5Cw9LObBwMgnyBIdiuKx851nGBf1Tz9vje4ybe7pvZjjSxd9xN5j95jfsbtV2rQewATUOR1AmNAuixkcj4CYwULUPKwLblJgfIW9bT7CjlG2qMi_7POJC2JjahzVNE'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
                      <span className="absolute top-4 left-4 bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                        {enr.courses.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h4 className="font-headline font-bold text-lg mb-1">{enr.courses.title}</h4>
                      <p className="text-on-surface-variant text-xs mb-4">Price: ${enr.courses.price}</p>
                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span>0% COMPLETE</span>
                          <span>0 Units</span>
                        </div>
                        <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "0%" }} className="h-full bg-gradient-to-r from-primary to-primary-container"></motion.div>
                        </div>
                      </div>
                      <Link href={`/courses/lesson?id=${enr.course_id}`} className="w-full py-3 rounded-lg border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                        Continue <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Recommended For You Carousel */}
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="mb-12">
            <h2 className="font-headline text-2xl font-bold mb-6">Recommended For You</h2>
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              <div className="flex-none w-80 bg-surface-container rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-2">Cognitive Offloading</h4>
                <p className="text-on-surface-variant text-sm mb-6">A deep dive into mental efficiency using luminous logic frameworks.</p>
                <div className="flex items-center gap-3">
                  <img alt="Instructor profile" className="w-8 h-8 rounded-full border border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiC9-L7Xiz2ElJnQFSn9vPXCa2dxEF92MAc7yXfk6qssoyE1VkkFuHr77QpdIGZcjGo2kyqYR8TP9N0Sl6fU0L1y-a6LLSqKzVkrNVCs4a9dqfu7o-YisMD3W4-2mOiXguWI19ed3GO6jKl2T1zRhthOrCm3seGF4JDGBCZ9eRDDy_N3sqVxsYTVLCPlgYFJOIsRMf_lD95VDhdFNK7eigxMXLS8nNLF3LX_i0L2QHbjQo8Je6zP-GQ31aCylbcKB7ejEUghE4gbE"/>
                  <span className="text-xs font-medium">Prof. Aris Vo</span>
                </div>
              </div>
              <div className="flex-none w-80 bg-surface-container rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary">deployed_code</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-2">Spatial Architectures</h4>
                <p className="text-on-surface-variant text-sm mb-6">Designing interfaces that breathe. Explore the 4D grid system.</p>
                <div className="flex items-center gap-3">
                  <img alt="Instructor profile" className="w-8 h-8 rounded-full border border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDubgFWWDWtw8I9FFPSG8TePZn4kI6rd6aQpkdgDeXrxaOvR4OIGiixehh2-SzX7hkjEPWMEtvLraP5ZugrcYqk2NbNjzPOgjRQ43UJBaR-DMMoBUQgEdzR7igbM3xy7szEHPoUpO0hEzveia0DZmBCnCtNlN44AbIEsweFQiS784dUxIzQx9s7tocVRKnGyIgmCo7NZ565FBM9Sbobdz0uxrErCdJ4PTKVrJO98EV1N6e8RQ4XDR4IVn4FEfrvLyuriM5B8tO7l4o"/>
                  <span className="text-xs font-medium">Lina G.</span>
                </div>
              </div>
              <div className="flex-none w-80 bg-surface-container rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-tertiary">diamond</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-2">The Premium Lens</h4>
                <p className="text-on-surface-variant text-sm mb-6">Understanding the psychology behind luxury digital experiences.</p>
                <div className="flex items-center gap-3">
                  <img alt="Instructor profile" className="w-8 h-8 rounded-full border border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdeEX5hliRjdbpZZPYefoAOxjvT7ugfYPmRo4Xr1ZmYJCVo06XpLrq7R2NlINRfgMRMs19_9-m2g205TaEbtisrNlB-6hBQfsFiFd-3TCHxtqdP-Y9qV7kk1Vu4yZOGms03t7hrxH2GgrOoAemFSaghTWrDn7V2f4kWCN6DSSyMy-G2BCM1LppNIksuFeEnB1EWv3qq7_xvmoPToBTInQZNaIZNsZaM-RQS63zfJ1FpzqEBb_O3I6McJoSOcrtodNM4qwiJCMQ5OM"/>
                  <span className="text-xs font-medium">Samir S.</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Certificates Grid */}
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="mb-12">
            <h2 className="font-headline text-2xl font-bold mb-6">Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 py-8 text-center text-outline">Loading certificates...</div>
              ) : certificates.length === 0 ? (
                <div className="col-span-2 py-8 text-center bg-surface-container-low rounded-xl">
                  <p className="text-on-surface-variant mb-2">You haven't earned any certificates yet.</p>
                  <p className="text-xs text-outline">Complete a course to earn your first certificate!</p>
                </div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 bg-surface-container-lowest rounded-lg flex-none flex items-center justify-center border border-white shadow-sm bg-[linear-gradient(135deg,#ffba49_0%,#ffddb1_50%,#ffba49_100%)]">
                      <span className="material-symbols-outlined text-4xl text-on-tertiary-container">verified</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-headline font-bold text-lg mb-1">{cert.courses?.title || 'Course Completed'}</h4>
                      <p className="text-on-surface-variant text-xs mb-4">Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      <div className="flex gap-2">
                        <Link href="/certificates" className="px-4 py-2 bg-on-background text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:-translate-y-0.5 transition-transform active:scale-95">
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
                        </Link>
                        <a
                          href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.courses?.title || 'Course Certificate')}&organizationName=${encodeURIComponent('Ø¬Ø§Ù…Ø¹Ø© ÙØ§ÙŠØ±ÙŠØ± Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-outline text-on-surface-variant text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-surface-container-high hover:-translate-y-0.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">share</span> LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Contextual FAB (Dashboard) */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring", stiffness: 200 }} className="fixed bottom-8 right-8 z-50">
        <Link href="/courses" className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-3xl">add</span>
          <span className="absolute right-full mr-4 bg-on-background text-white text-xs font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Join New Lesson</span>
        </Link>
      </motion.div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center font-bold text-primary">Loading Dashboard...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}

