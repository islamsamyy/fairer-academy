'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence , Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import LessonQuiz from '@/components/LessonQuiz';

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

function VideoLessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('id');
  const initialLessonId = searchParams.get('lesson');

  const [showToast, setShowToast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [instructor, setInstructor] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [shareLabel, setShareLabel] = useState('Share');

  useEffect(() => {
    async function fetchData() {
      if (!courseId) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      setCourse(courseData);

      // Fetch Lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      // Fetch Enrollment & Progress
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (enrollmentData) {
        setEnrollment(enrollmentData);
      }

      // Fetch instructor
      if (courseData?.instructor_id) {
        const { data: instData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, bio, role')
          .eq('id', courseData.instructor_id)
          .single();
        setInstructor(instData);
      }

      if (lessonsData) {
        setLessons(lessonsData);
        let selectedLesson = lessonsData[0];
        if (initialLessonId) {
          const found = lessonsData.find(l => l.id === initialLessonId);
          if (found) selectedLesson = found;
        }
        setCurrentLesson(selectedLesson);

        // Load all completed lessons for this enrollment
        if (enrollmentData) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('enrollment_id', enrollmentData.id)
            .not('completed_at', 'is', null);
          if (progressData) {
            const ids = new Set(progressData.map((p: any) => p.lesson_id));
            setCompletedLessonIds(ids);
            if (selectedLesson) setIsCompleted(ids.has(selectedLesson.id));
          }
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [courseId, initialLessonId, router]);

  // Load this lesson's saved note when lesson/user changes
  useEffect(() => {
    async function loadNote() {
      if (!user || !currentLesson?.id) { setNote(''); return; }
      const { data } = await supabase
        .from('lesson_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLesson.id)
        .maybeSingle();
      setNote(data?.content || '');
    }
    loadNote();
  }, [user, currentLesson?.id]);

  const saveNote = async () => {
    if (!user || !currentLesson?.id) return;
    setNoteSaving(true);
    await supabase.from('lesson_notes').upsert(
      { user_id: user.id, lesson_id: currentLesson.id, content: note, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' }
    );
    setNoteSaving(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) await navigator.share({ title: currentLesson?.title || 'Lesson', url });
      else { await navigator.clipboard.writeText(url); setShareLabel('Copied!'); setTimeout(() => setShareLabel('Share'), 2000); }
    } catch { /* user cancelled */ }
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Initializing Learning Environment...</div>;
  if (!course) return <div className="min-h-screen bg-surface flex items-center justify-center text-outline">Course Not Found</div>;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 h-20 bg-white/70 backdrop-blur-xl shadow-[0_12px_24px_rgba(23,28,33,0.06)] border-b border-surface-container-highest/20">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900 font-headline flex items-center gap-2 outline-none active:scale-95 transition-transform">
            <img
              alt="Fairer Logo"
              className="h-8 w-auto"
              src="https://lh3.googleusercontent.com/aida/ADBb0ui2HQlH4wehKDIFaKTzAAckSSlEp01ZDpqHBp-Yp3Xye2uSD5tyyoDtonRUNNrmktf17V6fxm089lUSM3btWWjMN8bKck3QfY8__gPG3swJlkvPSQEtEp6RbYKD4vLTGiZgAzYe3S9tDSNnVFN_JK1jOCv3NCscNRt1YMj5y4rFn-RKfw1XFcA9rSaBS4OJw6NFTLiFD7WPj2PgNr1mkIdjmPLAzA0t1sGxB4LXmNEKL15HOLWPpHzzkBoINpSkbdMeRKKNDepbwA"
            />
            <span className="text-xl font-black text-slate-900 font-headline tracking-tight hidden sm:inline-block">Fairer</span>
          </Link>
          
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 text-slate-500 hover:text-primary hover:bg-surface-container rounded-full transition-all active:scale-95 outline-none">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:text-primary hover:bg-surface-container rounded-full transition-all active:scale-95 outline-none hidden sm:block">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <Link href="/profile" className="outline-none">
            <div className="h-10 w-10 rounded-full overflow-hidden sm:ml-2 ring-2 ring-primary-container ring-offset-2 hover:ring-primary transition-colors cursor-pointer">
              <img
                alt="User profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3leGcGd1LdM7LM3RjHGIV1cGheECLnX-N_TyQJRD5682beTx5MZzrdTRwqIZaH9yzG0n-YIDghfSmrvgszwwsg0MvwyJOWhv8nOb13Kq_J-IHTkpzx5kE5zjCtmPapwvOVcyCAaeO6irK1hgljdT-CJiZPWags_0COKh7Rw6wcSVlvmbuUoreWDWkQmZGfuHk8oPhlppQDLHyZzW6R0LkeFsD97VSskyJN2k2rjfPAGdBbroVe_xprRZMVppNQKm24Ftyby8KggE"
              />
            </div>
          </Link>
        </div>
      </header>

      <main className="pt-20 min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto">
        
        {/* Main Content (Left/Center) */}
        <section className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 w-full">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
            
            {/* Breadcrumbs */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 mb-6 text-sm text-outline font-medium">
              <Link href="/courses" className="hover:text-on-surface transition-colors outline-none">Courses</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <Link href={`/courses/${course.id}`} className="hover:text-on-surface transition-colors outline-none">{course.title}</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-primary font-bold">{currentLesson?.title || 'Starting...'}</span>
            </motion.div>

            {/* Video Player */}
            <motion.div variants={itemVariants} className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl mb-10 border border-surface-container-highest/20">
              {currentLesson?.video_url ? (
                <video
                  className="w-full h-full object-contain bg-black"
                  controls
                  poster={course.thumbnail_url}
                >
                  <source src={currentLesson.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-white text-6xl mb-4 block">video_library</span>
                    <p className="text-white/60 text-sm">No video available for this lesson</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Content Details Area */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-slate-900 mb-4">{currentLesson?.title}</h2>
                  <div className="prose prose-slate max-w-none text-on-surface-variant leading-relaxed text-sm sm:text-base">
                    <p className="mb-4 font-medium">{currentLesson?.description || currentLesson?.transcript || 'No description available for this lesson.'}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={async () => {
                      if (!enrollment || !currentLesson || !user) return;
                      try {
                        // Mark lesson as completed
                        await supabase.from('lesson_progress').upsert({
                          enrollment_id: enrollment.id,
                          lesson_id: currentLesson.id,
                          completed_at: new Date().toISOString(),
                        }, { onConflict: 'enrollment_id,lesson_id' });
                        setIsCompleted(true);
                        setCompletedLessonIds(prev => new Set([...prev, currentLesson.id]));

                        // Update enrollment progress percentage
                        const { count: totalLessons } = await supabase
                          .from('lessons')
                          .select('*', { count: 'exact', head: true })
                          .eq('course_id', courseId);

                        const { count: completedLessons } = await supabase
                          .from('lesson_progress')
                          .select('*', { count: 'exact', head: true })
                          .eq('enrollment_id', enrollment.id)
                          .not('completed_at', 'is', null);

                        const progress = totalLessons ? (completedLessons || 0) / totalLessons * 100 : 0;

                        await supabase.from('enrollments').update({
                          progress_percentage: progress,
                          last_accessed_at: new Date().toISOString(),
                          completed_at: progress === 100 ? new Date().toISOString() : null,
                        }).eq('id', enrollment.id);
                        setEnrollment((e: any) => ({ ...e, progress_percentage: progress }));

                        // Auto-generate certificate if course is 100% complete
                        if (progress === 100) {
                          // Check if certificate already exists
                          const { data: existingCert } = await supabase
                            .from('certificates')
                            .select('*')
                            .eq('user_id', user.id)
                            .eq('course_id', courseId)
                            .single();

                          if (!existingCert) {
                            await supabase.from('certificates').insert({
                              user_id: user.id,
                              course_id: courseId,
                              certificate_url: `/certificates/${user.id}/${courseId}`,
                              issued_at: new Date().toISOString(),
                            });
                          }
                        }
                      } catch (err) {
                        console.error('Failed to mark complete:', err);
                        alert('Failed to mark lesson as complete');
                      }
                    }}
                    disabled={isCompleted}
                    className={`flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 outline-none group hover:-translate-y-0.5 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-primary to-primary-container text-white shadow-primary/20 hover:shadow-primary/40 active:scale-95'
                    }`}
                  >
                    <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${isCompleted ? '' : ''}`} style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {isCompleted ? 'check_circle' : 'check_circle'}
                    </span>
                    {isCompleted ? 'Completed ✓' : 'Mark Complete'}
                  </button>
                  <button onClick={() => setShowNotes(s => !s)} className={`flex-1 sm:flex-none border px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group ${showNotes ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-surface-container-highest text-on-surface hover:bg-surface-container'}`}>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">edit_note</span>
                    Notes
                  </button>
                  <button onClick={handleShare} className="flex-1 sm:flex-none sm:w-auto w-full bg-white border border-surface-container-highest text-on-surface px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group">
                    <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">share</span>
                    {shareLabel}
                  </button>
                </div>

                {/* My Notes */}
                {showNotes && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-2xl border border-surface-container-highest/50 p-6 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span> My Notes
                      </h3>
                      {noteSaved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
                    </div>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={6}
                      placeholder="Jot down your notes for this lesson… (private to you)"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex justify-end mt-3">
                      <button onClick={saveNote} disabled={noteSaving} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
                        {noteSaving ? 'Saving…' : 'Save Notes'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Lesson Quiz (renders only if the lesson has a quiz) */}
                {currentLesson?.id && <LessonQuiz lessonId={currentLesson.id} userId={user?.id ?? null} />}
              </div>

              {/* Instructor Card */}
              {instructor && (
                <div className="lg:w-80 flex-shrink-0">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-highest/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">person</span>
                      Instructor
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      {instructor.avatar_url ? (
                        <img alt={instructor.full_name} className="w-14 h-14 rounded-full object-cover border border-surface-container-highest" src={instructor.avatar_url} />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                          {(instructor.full_name || '?').charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-on-surface">{instructor.full_name}</h4>
                        <p className="text-xs text-secondary font-medium capitalize">{instructor.role}</p>
                      </div>
                    </div>
                    {instructor.bio && (
                      <p className="text-sm text-on-surface-variant leading-relaxed">{instructor.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* Sidebar (Course Outline) */}
        <aside className="w-full md:w-80 lg:w-96 bg-surface-container-low/50 border-l border-surface-container-highest/50 flex flex-col md:sticky md:top-20 z-10 md:h-[calc(100vh-5rem)]">
          <div className="p-6 md:p-8 border-b border-surface-container-highest/50 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-lg text-on-surface">{course.title}</h3>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">Lesson {lessons.findIndex(l => l.id === currentLesson?.id) + 1} / {lessons.length}</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest/50 rounded-full overflow-hidden shadow-inner flex">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-[0_0_8px_rgba(0,217,255,0.4)] transition-all duration-500"
                style={{ width: `${enrollment?.progress_percentage ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-outline font-bold mt-3 text-right">
              {Math.round(enrollment?.progress_percentage ?? 0)}% Complete
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 hide-scrollbar">
            {/* Lessons List */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-2 mb-2 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">Course Content</span>
              </div>
              
              <div className="space-y-2">
                {lessons.map((lesson) => {
                  const done = completedLessonIds.has(lesson.id);
                  const active = currentLesson?.id === lesson.id;
                  const mins = Math.floor((lesson.duration_seconds || 0) / 60);
                  const secs = (lesson.duration_seconds || 0) % 60;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        setIsCompleted(completedLessonIds.has(lesson.id));
                      }}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all group ${active ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-container-highest/30 border border-transparent'}`}
                    >
                      <span className={`material-symbols-outlined text-xl flex-shrink-0 ${done ? 'text-emerald-500' : active ? 'text-primary' : 'text-outline'}`}
                        style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {done ? 'check_circle' : active ? 'play_circle' : 'radio_button_unchecked'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight truncate ${active ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds > 0 && (
                          <span className="text-[10px] text-outline font-mono mt-0.5 block">
                            {mins}:{secs.toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Certificate progress teaser */}
            {enrollment && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary">workspace_premium</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Course Certificate</h4>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${enrollment.progress_percentage ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant">
                  {enrollment.progress_percentage >= 100
                    ? '🎉 Certificate earned! Check your certificates page.'
                    : `${Math.round(enrollment.progress_percentage ?? 0)}% — complete all lessons to earn your certificate`}
                </p>
              </div>
            )}
          </div>

          {/* Resume Lesson CTA (Sticky Bottom) */}
          <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-md border-t border-surface-container-highest/50 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] hidden md:block mt-auto z-20">
            <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-headline font-bold text-sm tracking-wide shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none group">
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">play_arrow</span>
              Resume Lesson
            </button>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-surface-container-highest/50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:hidden z-40">
        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3.5 rounded-xl font-headline font-bold text-sm tracking-wide shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 outline-none">
          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          Resume Lesson
        </button>
      </div>

      {/* Achievement Toast (Floating) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 md:bottom-8 left-4 md:left-8 flex items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-primary-container/30 max-w-[320px] sm:max-w-sm z-[100]"
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl">workspace_premium</span>
            </div>
            <div className="flex-1 pr-2">
              <h6 className="text-sm font-bold text-slate-900 leading-tight mb-1">Learning Streak Started!</h6>
              <p className="text-xs text-outline font-medium">Day 1 of your journey into the Ethereal.</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="p-1 -mr-2 -mt-2 sm:mt-0 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors outline-none shrink-0"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VideoLessonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Loading Experience...</div>}>
      <VideoLessonContent />
    </Suspense>
  );
}
