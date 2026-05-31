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
  const [lessons, setLessons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qaSearch, setQaSearch] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '' });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  const [newAnswer, setNewAnswer] = useState<Record<string, string>>({});

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

        // Fetch Lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('order_index', { ascending: true });
        if (lessonsData) setLessons(lessonsData);

        // Fetch Reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`*, profiles (full_name, avatar_url)`)
          .eq('course_id', id)
          .order('created_at', { ascending: false });
        if (reviewsData) {
          setReviews(reviewsData);
          const avgRating = reviewsData.length > 0
            ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length
            : 0;
          setAvgRating(Math.round(avgRating * 10) / 10);
        }

        // Fetch Enrollment Count
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', id);
        if (count !== null) setEnrollmentCount(count);

        // Fetch Questions
        const { data: qData } = await supabase
          .from('questions')
          .select(`*, profiles:user_id (full_name, avatar_url)`)
          .eq('course_id', id)
          .order('created_at', { ascending: false });
        if (qData) setQuestions(qData);

        // Check Enrollment
        if (user) {
          const { data: enrollData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
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
          user_id: user.id,
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i <= Math.floor(avgRating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                ))}
              </div>
              <span className="text-sm font-bold font-mono text-on-surface">{avgRating || 'N/A'}</span>
              <span className="text-xs text-outline">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">group</span>
              <span className="font-medium">{enrollmentCount.toLocaleString()} student{enrollmentCount !== 1 ? 's' : ''}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="font-medium">{Math.ceil((lessons.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / 3600))} hours of content</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">update</span>
              <span className="font-medium">Updated {new Date(course.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
                  {lessons.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-on-surface-variant">No lessons available yet</p>
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                      <div className="p-5 bg-surface-container-low/50 flex items-center justify-between">
                        <h3 className="font-headline font-bold text-on-surface text-sm">Course Lessons</h3>
                        <span className="text-xs text-outline font-mono">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-outline-variant/10">
                        {lessons.map((lesson) => (
                          <Link key={lesson.id} href={`/courses/lesson?id=${id}&lesson=${lesson.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-container-low/30 transition-colors group">
                            <span className="material-symbols-outlined text-xl text-outline">play_circle</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{lesson.title}</p>
                            </div>
                            <span className="text-xs text-outline font-mono">{formatDuration(lesson.duration_seconds || 0)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab Content: Reviews */}
              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {user && isEnrolled && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full bg-surface-container-low text-primary border-2 border-primary/20 p-4 rounded-xl font-bold hover:bg-primary/5 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                      Share Your Review
                    </button>
                  )}
                  {showReviewForm && user && isEnrolled && (
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                      <h3 className="font-bold text-on-surface text-lg">Write Your Review</h3>
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant block mb-2">Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="outline-none transition-transform hover:scale-110 active:scale-95"
                            >
                              <span
                                className="material-symbols-outlined text-3xl text-amber-500"
                                style={{ fontVariationSettings: star <= reviewForm.rating ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant block mb-2">Title</label>
                        <input
                          type="text"
                          placeholder="Summarize your experience..."
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          className="w-full p-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant block mb-2">Review</label>
                        <textarea
                          placeholder="Share your detailed feedback..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          rows={4}
                          className="w-full p-3 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            if (!reviewForm.comment.trim()) {
                              alert('Please write a review');
                              return;
                            }
                            setSubmittingReview(true);
                            try {
                              const { error } = await supabase.from('reviews').insert({
                                user_id: user.id,
                                course_id: id,
                                rating: reviewForm.rating,
                                title: reviewForm.title,
                                comment: reviewForm.comment,
                              });
                              if (error) throw error;
                              // Refresh reviews
                              const { data: newReviews } = await supabase
                                .from('reviews')
                                .select(`*, profiles (full_name, avatar_url)`)
                                .eq('course_id', id)
                                .order('created_at', { ascending: false });
                              if (newReviews) setReviews(newReviews);
                              setShowReviewForm(false);
                              setReviewForm({ rating: 5, title: '', comment: '' });
                            } catch (err) {
                              console.error(err);
                              alert('Failed to submit review');
                            } finally {
                              setSubmittingReview(false);
                            }
                          }}
                          disabled={submittingReview}
                          className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="flex-1 bg-surface-container-low text-on-surface py-2 rounded-lg font-bold hover:bg-surface-container transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {reviews.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-on-surface-variant">No reviews yet. Be the first to review this course!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                        <div className="flex items-center gap-4 mb-4">
                          <img alt={review.profiles?.full_name} className="w-10 h-10 rounded-full object-cover border border-surface-container-highest" src={review.profiles?.avatar_url || "https://via.placeholder.com/40"} />
                          <div className="flex-1">
                            <p className="font-bold text-on-surface text-sm">{review.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-outline">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: i < (review.rating || 0) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </div>
                        {review.title && <p className="font-bold text-on-surface text-sm mb-2">{review.title}</p>}
                        <p className="text-sm text-on-surface-variant leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Tab Content: Q&A */}
              {activeTab === 'qa' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Search + Ask button */}
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/10">
                      <span className="material-symbols-outlined text-outline text-sm">search</span>
                      <input
                        value={qaSearch}
                        onChange={e => setQaSearch(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none placeholder:text-outline"
                        placeholder="Search questions..."
                      />
                    </div>
                    {user && (
                      <button
                        onClick={() => setShowQuestionForm(v => !v)}
                        className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Ask
                      </button>
                    )}
                  </div>

                  {/* Ask question form */}
                  {showQuestionForm && user && (
                    <div className="bg-white rounded-2xl border border-outline-variant/10 p-5 space-y-3">
                      <h3 className="font-bold text-on-surface">Ask a Question</h3>
                      <input
                        value={newQuestion.title}
                        onChange={e => setNewQuestion(q => ({ ...q, title: e.target.value }))}
                        placeholder="Question title..."
                        className="w-full px-3 py-2 border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <textarea
                        value={newQuestion.body}
                        onChange={e => setNewQuestion(q => ({ ...q, body: e.target.value }))}
                        placeholder="Describe your question in detail (optional)..."
                        rows={3}
                        className="w-full px-3 py-2 border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={submittingQuestion || !newQuestion.title.trim()}
                          onClick={async () => {
                            setSubmittingQuestion(true);
                            const { data, error } = await supabase.from('questions').insert({
                              course_id: id,
                              user_id: user.id,
                              title: newQuestion.title,
                              body: newQuestion.body,
                            }).select(`*, profiles:user_id (full_name, avatar_url)`).single();
                            if (!error && data) {
                              setQuestions(qs => [data, ...qs]);
                              setNewQuestion({ title: '', body: '' });
                              setShowQuestionForm(false);
                            }
                            setSubmittingQuestion(false);
                          }}
                          className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                        >
                          {submittingQuestion ? 'Posting...' : 'Post Question'}
                        </button>
                        <button onClick={() => setShowQuestionForm(false)} className="flex-1 bg-surface-container-low py-2 rounded-xl text-sm font-bold">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Questions list */}
                  {questions
                    .filter(q => !qaSearch || q.title.toLowerCase().includes(qaSearch.toLowerCase()))
                    .map(q => (
                      <div key={q.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                        <button
                          className="w-full flex items-start gap-4 p-5 hover:bg-surface-container-low/40 transition-colors text-left group"
                          onClick={async () => {
                            if (expandedQuestion === q.id) { setExpandedQuestion(null); return; }
                            setExpandedQuestion(q.id);
                            if (!answers[q.id]) {
                              const { data } = await supabase
                                .from('answers')
                                .select(`*, profiles:user_id (full_name, avatar_url)`)
                                .eq('question_id', q.id)
                                .order('created_at', { ascending: true });
                              setAnswers(a => ({ ...a, [q.id]: data || [] }));
                            }
                          }}
                        >
                          <div className="flex flex-col items-center gap-1 min-w-[44px]">
                            <button
                              onClick={async e => {
                                e.stopPropagation();
                                await supabase.from('questions').update({ upvotes: q.upvotes + 1 }).eq('id', q.id);
                                setQuestions(qs => qs.map(x => x.id === q.id ? { ...x, upvotes: x.upvotes + 1 } : x));
                              }}
                              className="material-symbols-outlined text-outline hover:text-primary text-sm transition-colors"
                            >
                              arrow_upward
                            </button>
                            <span className="text-sm font-bold font-mono text-primary">{q.upvotes}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{q.title}</p>
                            {q.body && <p className="text-xs text-outline mt-1 line-clamp-1">{q.body}</p>}
                            <div className="flex items-center gap-3 mt-2 text-xs text-outline">
                              <span>{q.profiles?.full_name || 'User'}</span>
                              <span>·</span>
                              <span>{new Date(q.created_at).toLocaleDateString()}</span>
                              {q.is_answered && (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">check_circle</span> Answered
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-outline text-sm transition-transform" style={{
                            transform: expandedQuestion === q.id ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}>expand_more</span>
                        </button>

                        {expandedQuestion === q.id && (
                          <div className="border-t border-outline-variant/10 bg-white px-5 pb-5 pt-4 space-y-4">
                            {q.body && <p className="text-sm text-on-surface-variant">{q.body}</p>}
                            {(answers[q.id] || []).map((ans: any) => (
                              <div key={ans.id} className={`flex gap-3 p-3 rounded-xl ${ans.is_accepted ? 'bg-emerald-50 border border-emerald-200' : 'bg-surface-container-low'}`}>
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                  {(ans.profiles?.full_name || '?').charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-on-surface">{ans.profiles?.full_name || 'User'}</span>
                                    {ans.is_accepted && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">Best Answer</span>}
                                  </div>
                                  <p className="text-sm text-on-surface-variant">{ans.body}</p>
                                </div>
                              </div>
                            ))}
                            {(answers[q.id] || []).length === 0 && (
                              <p className="text-xs text-outline">No answers yet. Be the first!</p>
                            )}
                            {user && (
                              <div className="flex gap-2 pt-1">
                                <input
                                  value={newAnswer[q.id] || ''}
                                  onChange={e => setNewAnswer(a => ({ ...a, [q.id]: e.target.value }))}
                                  placeholder="Write an answer..."
                                  className="flex-1 px-3 py-2 border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                />
                                <button
                                  disabled={!newAnswer[q.id]?.trim()}
                                  onClick={async () => {
                                    const body = newAnswer[q.id];
                                    if (!body?.trim()) return;
                                    const { data } = await supabase.from('answers')
                                      .insert({ question_id: q.id, user_id: user.id, body })
                                      .select(`*, profiles:user_id (full_name, avatar_url)`).single();
                                    if (data) {
                                      setAnswers(a => ({ ...a, [q.id]: [...(a[q.id] || []), data] }));
                                      setNewAnswer(a => ({ ...a, [q.id]: '' }));
                                    }
                                  }}
                                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-40"
                                >
                                  Post
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                  {questions.filter(q => !qaSearch || q.title.toLowerCase().includes(qaSearch.toLowerCase())).length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-on-surface-variant text-sm">No questions yet. Ask the first one!</p>
                    </div>
                  )}
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
