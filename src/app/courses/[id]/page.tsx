'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState<any>(null);
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch Course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseData) {
        setCourse(courseData);

        // Fetch Instructor Profile
        const { data: instData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', courseData.instructor_id)
          .single();
        setInstructor(instData);

        // Check Enrollment
        if (user) {
          const { data: enrollData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('student_id', user.id)
            .eq('course_id', id)
            .single();
          setIsEnrolled(!!enrollData);
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!course) return;
    addToCart({
      id: course.id,
      title: course.title,
      price: course.price,
      instructor: instructor?.full_name || 'Expert Instructor',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cwUxhpbUTCHKzLUd9Wvw9Rcz4SrP8uF5i9okP9KOy5z4BQGqQcXutFTTN3QI74bdUt-cGXvfBu0YaieHp8PdxKU2vmheYd8KNhLJYCx8uS20a6o80afpMqpClg3n1xhIrErPBORiKG3HefpGaiO_gTszEDMPJwDnnWtRWhBSKipDx-Oby8QfNFNstqFwvjGwPVnU3DLLMlko-xJDG8ChQS8psE0ep5p-mPjdKZIpLZLzBG6w1139pd69l-DL2qMR5CiQknZxCSM',
    });
    router.push('/cart');
  };

  const handleEnrollFree = async () => {
    if (!course) return;
    if (!user) {
      router.push(`/login?redirectTo=/courses/${course.id}`);
      return;
    }
    setEnrolling(true);
    try {
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: course.id,
        });
      if (enrollError) throw enrollError;
      setIsEnrolled(true);
    } catch (err) {
      console.error(err);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'info' },
    { id: 'curriculum', label: 'Curriculum', icon: 'menu_book' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'qa', label: 'Q&A', icon: 'forum' },
  ];

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Loading Luminous Data...</div>;
  if (!course) return <div className="min-h-screen bg-surface flex items-center justify-center text-outline">Course Not Found</div>;

  const curriculum = [
    {
      title: 'Module 1: Foundations',
      lessons: [
        { title: 'Introduction', duration: '10:00', completed: false },
      ],
    },
  ];

  const reviews = [
    { name: 'Academy Member', rating: 5, comment: 'Exceptional content.', date: 'Recently', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAltYcGa5n9JfH7TnQoKDFbYEXqpEgMBPxf36-KwNB1Lsmqj_lo4tHLz4qjMJ43l4IQd9Jb85Fftt-kMZ1cI7Aa-T7Ih3NF446DWdBFw3Eiw_OhmDhAzZB9iO3832Z2SR0Nvd_osoGkASsLzZT3TaodUdyFwyveNfpkU0q_GFivZDdZu9i7wLkD-giWljXrOV7LGLN24MaROT_hGmAheA8tLbkScQ_JSQyAZTXrZReMTcMpjjQXAkLXL1CzCLS8lxhCTQJLSv3mkIk' },
  ];

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      {/* TopNavBar */}

      <main className="pt-0 min-h-screen">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-80 sm:h-96 overflow-hidden"
        >
          <img
            alt="Course Hero"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-cwUxhpbUTCHKzLUd9Wvw9Rcz4SrP8uF5i9okP9KOy5z4BQGqQcXutFTTN3QI74bdUt-cGXvfBu0YaieHp8PdxKU2vmheYd8KNhLJYCx8uS20a6o80afpMqpClg3n1xhIrErPBORiKG3HefpGaiO_gTszEDMPJwDnnWtRWhBSKipDx-Oby8QfNFNstqFwvjGwPVnU3DLLMlko-xJDG8ChQS8psE0ep5p-mPjdKZIpLZLzBG6w1139pd69l-DL2qMR5CiQknZxCSM"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
            <span className="inline-block bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-on-background mb-2">
              {course.title}
            </h1>
            <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl">
              {course.description.substring(0, 150)}...
            </p>
          </div>
        </motion.section>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-24">
          {/* Course Meta Bar */}
          <motion.div
            variants={containerVariants} initial="hidden" animate="visible"
            className="flex flex-wrap items-center gap-6 py-6 border-b border-outline-variant/20"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-sm font-bold font-mono text-on-surface">4.9</span>
              <span className="text-xs text-outline">(1,247 reviews)</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">group</span>
              <span className="font-medium">8,421 students</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-medium">42 hours of content</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">update</span>
              <span className="font-medium">Updated Dec 2025</span>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all outline-none flex-1 sm:flex-none justify-center ${activeTab === tab.id
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content: Overview */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="prose max-w-none">
                    <h2 className="text-2xl font-headline font-bold text-on-surface">About This Course</h2>
                    <p className="text-on-surface-variant leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
                    <h3 className="text-xl font-headline font-bold text-on-surface mb-6">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Master the core fundamentals of the subject.',
                        'Build real-world projects to showcase your skills.',
                        'Learn the latest industry tools and techniques.',
                        'Get direct feedback from expert instructors.',
                        'Join a global community of ambitious learners.',
                        'Earn a certificate of completion to boost your career.'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold text-on-surface">Who This Course Is For</h3>
                    <p className="text-on-surface-variant leading-relaxed text-sm">
                      This course is designed for ambitious learners ready to take their skills to the next level. Whether you're a complete beginner looking for a fair start or a professional aiming to master global standards, this curriculum bridges the gap between where you are and where you want to be.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: 'workspace_premium', label: 'Certificate', value: 'Included' },
                      { icon: 'translate', label: 'Language', value: 'English' },
                      { icon: 'signal_cellular_alt', label: 'Level', value: course.level },
                      { icon: 'devices', label: 'Access', value: 'Lifetime' },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-surface-container-low rounded-xl text-center border border-outline-variant/10">
                        <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{item.icon}</span>
                        <p className="text-[10px] text-outline uppercase tracking-widest font-mono mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-on-surface">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab Content: Curriculum */}
              {activeTab === 'curriculum' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {curriculum.map((module, mi) => (
                    <div key={mi} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                      <div className="p-5 bg-surface-container-low/50 flex items-center justify-between">
                        <h3 className="font-headline font-bold text-on-surface text-sm">{module.title}</h3>
                        <span className="text-xs text-outline font-mono">{module.lessons.length} lessons</span>
                      </div>
                      <div className="divide-y divide-outline-variant/10">
                        {module.lessons.map((lesson, li) => (
                          <div key={li} className="flex items-center gap-4 p-4 hover:bg-surface-container-low/30 transition-colors cursor-pointer group">
                            <span className={`material-symbols-outlined text-xl ${lesson.completed ? 'text-emerald-500' : 'text-outline'}`} style={lesson.completed ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                              {lesson.completed ? 'check_circle' : 'play_circle'}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{lesson.title}</p>
                            </div>
                            <span className="text-xs text-outline font-mono">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tab Content: Reviews */}
              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {reviews.map((review, ri) => (
                    <div key={ri} className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4">
                        <img alt={review.name} className="w-10 h-10 rounded-full object-cover border border-surface-container-highest" src={review.avatar} />
                        <div className="flex-1">
                          <p className="font-bold text-on-surface text-sm">{review.name}</p>
                          <p className="text-xs text-outline">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Tab Content: Q&A */}
              {activeTab === 'qa' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-outline">search</span>
                    <input className="bg-transparent border-none text-sm w-full outline-none placeholder:text-outline" placeholder="Search questions..." type="text" />
                  </div>
                  {[
                    { q: 'How does Luminous Logic differ from traditional Design Thinking?', answers: 12, votes: 34 },
                    { q: 'Can the neural mesh framework be applied to mobile-first interfaces?', answers: 8, votes: 21 },
                    { q: 'What prerequisites should I complete before Module 3?', answers: 5, votes: 15 },
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex items-start gap-4 hover:shadow-sm transition-shadow cursor-pointer group">
                      <div className="flex flex-col items-center gap-1 text-center min-w-[50px]">
                        <span className="text-lg font-bold font-mono text-primary">{item.votes}</span>
                        <span className="text-[10px] text-outline uppercase font-mono">votes</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors mb-2">{item.q}</p>
                        <span className="text-xs text-outline font-mono">{item.answers} answers</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sticky Enrollment Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="sticky top-24 space-y-6"
              >
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-outline-variant/10">
                  <div className="mb-6">
                    <span className="text-[10px] text-outline uppercase font-mono block mb-1">Tuition</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-bold text-on-surface">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      {course.price > 0 && (
                        <span className="text-lg text-outline line-through">${(course.price * 1.6).toFixed(0)}</span>
                      )}
                    </div>
                    {course.price > 0 && (
                      <span className="text-xs text-primary font-bold">Launch Price — Limited seats</span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Link href={`/courses/lesson?id=${course.id}`} className="block w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95 transition-all mb-3 text-sm">
                      Go to Learning Environment
                    </Link>
                  ) : course.price === 0 ? (
                    <button
                      onClick={handleEnrollFree}
                      disabled={enrolling}
                      className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-center shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 active:scale-95 transition-all mb-3 text-sm disabled:opacity-50"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="block w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold text-center shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all mb-3 text-sm"
                    >
                      {isInCart(course.id) ? 'In Cart — Checkout Now' : 'Enroll Now'}
                    </button>
                  )}
                  <div className="mt-6 space-y-3">
                    {[
                      { icon: 'all_inclusive', text: 'Lifetime access' },
                      { icon: 'workspace_premium', text: 'Certificate of completion' },
                      { icon: 'download', text: 'Downloadable resources' },
                      { icon: 'smartphone', text: 'Access on mobile & desktop' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Instructor
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <img alt={instructor?.full_name} className="w-14 h-14 rounded-full object-cover border border-surface-container-highest" src={instructor?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDJg-K5jIgJ7mG_N3jT1kwDBPjfyu7dNuGE_HIA6ZbdhDrh_bgf5lDI_bYEfYwgXQPtXkxXLFFHOEXMdqVXFg09o0CWWcDXJvts1EOR0HeZWILvTJiqL_qsqqcCzJbnimn3gj6_TqPPATN7-e4IctzX9CskXF-YA2PiYi-N2MLToQF-B9g_tBEd_dmEMOKCIeqVe4fiNmNV1XtwAHrFh4XPjR5r9N1sijsfGBpXodKYSWPKpYMzsWIomRvoQ5gjGTafeB0Ksyk40Is"} />
                    <div>
                      <h4 className="font-headline font-bold text-on-surface">{instructor?.full_name || 'Academic Advisor'}</h4>
                      <p className="text-xs text-primary font-medium">{instructor?.role === 'instructor' ? 'Lead Faculty' : 'Course Director'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">Specializing in the intersection of neural networks and aesthetic theory for over 12 years.</p>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold font-headline text-on-surface">4.9</p>
                      <p className="text-[10px] text-outline uppercase font-mono">Rating</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-headline text-on-surface">14</p>
                      <p className="text-[10px] text-outline uppercase font-mono">Courses</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-headline text-on-surface">34k</p>
                      <p className="text-[10px] text-outline uppercase font-mono">Students</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
