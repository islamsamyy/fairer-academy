'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence , Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

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

export default function CourseCreationPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Design & Theory');
  const [level, setLevel] = useState('Beginner (Initiate)');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    });
  }, [router]);

  const handlePublish = async () => {
    if (!user) return;
    if (!title || !description) {
      setError('Please provide a title and description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: publishError } = await supabase
        .from('courses')
        .insert([
          {
            title,
            description,
            category,
            level,
            price: parseFloat(price),
            instructor_id: user.id,
            is_published: true, // Auto-publish for now
          },
        ])
        .select()
        .single();

      if (publishError) throw publishError;

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push('/dashboard/instructor');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to publish course.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="bg-background font-body text-on-background min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopNavBar */}

      <main className="pt-20 min-h-screen flex">
        {/* Progress Sidebar */}
        <aside className="hidden lg:flex h-[calc(100vh-5rem)] w-72 flex-col sticky top-20 left-0 bg-surface-container-lowest dark:bg-slate-950/50 p-6 gap-y-2 border-r border-surface-container-highest/30 z-10">
          <div className="mb-8 px-2">
            <h2 className="font-headline text-lg font-bold text-on-surface">Course Builder</h2>
            <p className="text-xs text-outline font-mono uppercase tracking-widest mt-1">
              Project #8229
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 shadow-sm rounded-xl font-['Inter'] text-sm font-medium transition-transform transform translate-x-2 border border-surface-container-highest/20 cursor-default">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <span>Step 1: Basic Info</span>
            </div>
            <div className="flex items-center gap-3 p-4 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 rounded-xl font-['Inter'] text-sm font-medium cursor-pointer group">
              <span className="material-symbols-outlined group-hover:text-cyan-600 transition-colors">account_tree</span>
              <span className="group-hover:text-cyan-600 transition-colors">Step 2: Curriculum</span>
            </div>
            <div className="flex items-center gap-3 p-4 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 rounded-xl font-['Inter'] text-sm font-medium cursor-pointer group">
              <span className="material-symbols-outlined group-hover:text-cyan-600 transition-colors">payments</span>
              <span className="group-hover:text-cyan-600 transition-colors">Step 3: Pricing</span>
            </div>
            <div className="flex items-center gap-3 p-4 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 rounded-xl font-['Inter'] text-sm font-medium cursor-pointer group">
              <span className="material-symbols-outlined group-hover:text-cyan-600 transition-colors">verified</span>
              <span className="group-hover:text-cyan-600 transition-colors">Step 4: Review</span>
            </div>
          </div>
          <div className="mt-auto p-4 bg-surface-container-low rounded-xl border border-transparent hover:border-surface-container-highest transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-on-surface-variant">Overall Progress</span>
              <span className="text-xs font-mono text-primary font-bold">25%</span>
            </div>
            <div className="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '25%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full"
              ></motion.div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 p-6 sm:p-12 max-w-5xl mx-auto overflow-y-auto w-full">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background mb-4">
              Initialize Your Wisdom
            </h1>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              Let's define the fundamental essence of your course. This information will form the
              digital storefront of your educational sanctuary.
            </p>
          </motion.header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 pb-24"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            {/* Course Identity Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <h3 className="font-headline font-semibold text-lg text-on-surface">Course Identity</h3>
                <p className="text-sm text-outline mt-2 leading-relaxed">
                  The title and subtitle are the first interaction points for your future scholars.
                </p>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant ml-1">
                    Course Title
                  </label>
                  <input
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant hover:bg-surface-container outline-none"
                    placeholder="e.g., Quantum Architecture in Modern Web"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant ml-1">
                    Price ($)
                  </label>
                  <input
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface placeholder:text-outline-variant hover:bg-surface-container outline-none"
                    placeholder="e.g., 49.99"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">
                      Category
                    </label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface hover:bg-surface-container outline-none appearance-none cursor-pointer"
                      >
                        <option>Design & Theory</option>
                        <option>Advanced Engineering</option>
                        <option>Digital Humanities</option>
                        <option>Ethereal Arts</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant ml-1">
                      Instructional Level
                    </label>
                    <div className="relative">
                      <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all text-on-surface hover:bg-surface-container outline-none appearance-none cursor-pointer"
                      >
                        <option>Beginner (Initiate)</option>
                        <option>Intermediate (Scholar)</option>
                        <option>Advanced (Master)</option>
                        <option>Elite (Legendary)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Media Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <h3 className="font-headline font-semibold text-lg text-on-surface">Visual Vessel</h3>
                <p className="text-sm text-outline mt-2 leading-relaxed">
                  Upload a high-fidelity thumbnail. This image represents the aesthetic soul of your
                  content.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="relative group">
                  <div className="w-full aspect-video rounded-2xl bg-surface-container-low border border-dashed border-outline/30 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-surface-container transition-all group-active:scale-[0.99] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container/20 group-hover:opacity-100 opacity-0 transition-opacity"></div>
                    <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-container/40 transition-all z-10">
                      <span className="material-symbols-outlined text-primary text-3xl">
                        cloud_upload
                      </span>
                    </div>
                    <h4 className="font-medium text-on-surface z-10">
                      Drag and drop your thumbnail here
                    </h4>
                    <p className="text-xs text-outline mt-2 z-10">
                      PNG, JPG or WebP (16:9 ratio recommended). Max 5MB.
                    </p>
                    <button className="mt-6 px-6 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors z-10 outline-none">
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <h3 className="font-headline font-semibold text-lg text-on-surface">
                  Detailed Discourse
                </h3>
                <p className="text-sm text-outline mt-2 leading-relaxed">
                  Provide a comprehensive breakdown using Markdown formatting for structured elegance.
                </p>
              </div>
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-transparent transition-all">
                <div className="flex items-center justify-between px-6 py-3 bg-surface-container-lowest border-b border-outline-variant/10">
                  <div className="flex gap-4">
                    <button className="text-primary transition-colors font-mono text-sm font-bold border-b border-primary pb-0.5 outline-none">
                      Write
                    </button>
                    <button className="text-outline hover:text-primary transition-colors font-mono text-sm outline-none">
                      Preview
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-primary transition-colors hover:scale-110">
                      format_bold
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-primary transition-colors hover:scale-110">
                      format_italic
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-primary transition-colors hover:scale-110">
                      link
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-primary transition-colors hover:scale-110">
                      list
                    </span>
                  </div>
                </div>
                <textarea
                  className="w-full p-6 bg-transparent border-none focus:ring-0 text-on-surface leading-relaxed font-body placeholder:text-outline-variant/70 resize-y min-h-[250px] outline-none"
                  placeholder="Type your course description here... Use # for headers, ** for bold."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div className="px-6 py-3 bg-surface-container-low/50 flex justify-between items-center border-t border-outline-variant/10">
                  <span className="text-[10px] font-mono text-outline uppercase tracking-tighter">
                    Markdown Support Enabled
                  </span>
                  <span className="text-[10px] font-mono text-outline font-medium">0 / 2500</span>
                </div>
              </div>
            </motion.div>

            {/* Action Footer */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col-reverse sm:flex-row items-center justify-between pt-8 border-t border-outline-variant/20 gap-4"
            >
              <button
                onClick={handleSaveDraft}
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-outline font-headline font-bold hover:text-on-surface hover:bg-surface-container transition-all outline-none"
              >
                Save Draft
              </button>
              <div className="flex gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl bg-surface-container text-on-surface-variant font-headline font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2 outline-none hover:text-on-surface">
                  Cancel
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 sm:px-10 py-3 rounded-xl bg-gradient-to-r text-white font-headline font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group from-[#00D9FF] to-[#009fb8] hover:shadow-primary/40 active:scale-95 outline-none filter hover:brightness-110 disabled:opacity-70"
                >
                  {loading ? 'Publishing...' : 'Publish Course'}
                  {!loading && (
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      publish
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-8 right-8 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/20 z-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5"></div>
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant relative z-10 shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-on-surface">Progress Saved</p>
              <p className="text-xs text-outline font-medium">Your course core is safely stored.</p>
            </div>
            {/* Progress bar for toast dismiss */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-secondary w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
