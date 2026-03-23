"use client";

import { useState, useEffect } from 'react';
import { motion , Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Disciplines');

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      let query = supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true);
      
      if (selectedCategory !== 'All Disciplines') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    }

    fetchCourses();
  }, [selectedCategory, searchQuery]);

  const categories = [
    'All Disciplines',
    'Design & Theory',
    'Advanced Engineering',
    'Digital Humanities',
    'Ethereal Arts'
  ];

  return (
    <div className="bg-background font-body text-on-surface flex flex-col h-screen overflow-hidden">
      {/* TopNavBar */}

      <div className="flex pt-20 h-full overflow-hidden">
        {/* SideNavBar / Filter Sidebar */}
        <aside className="w-72 bg-slate-50 border-r border-outline-variant/10 flex flex-col h-full overflow-y-auto no-scrollbar hidden lg:flex">
          <div className="px-8 py-8 space-y-10">
            {/* Branding Context */}
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-cyan-500 text-lg">The Academy</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Luminous Logic</p>
            </div>
            
            {/* Filters: Category */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-mono">Category</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 group cursor-pointer">
                    <input 
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="rounded-full border-outline-variant text-primary focus:ring-primary/20 bg-transparent" 
                    />
                    <span className={`text-sm font-medium transition-colors ${selectedCategory === cat ? 'text-primary' : 'text-slate-600 group-hover:text-primary'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters: Investment (Price Range) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-mono">Investment</h3>
              <div className="px-2">
                <input className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" type="range"/>
                <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-400">
                  <span>$0</span>
                  <span>$5,000+</span>
                </div>
              </div>
            </div>

            {/* Filters: Complexity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-mono">Complexity</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-white shadow-sm border border-outline-variant/5 text-primary text-sm font-medium flex items-center justify-between">
                  Foundational
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 text-slate-500 text-sm font-medium transition-all">
                  Architectural
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 text-slate-500 text-sm font-medium transition-all">
                  Transcendent
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-10">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-mono opacity-80 mb-2 uppercase tracking-tighter">Limited Offer</p>
                  <h4 className="font-heading font-bold text-lg leading-tight mb-4">Upgrade to Pro</h4>
                  <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold shadow-xl hover:scale-105 transition-transform">Get Full Access</button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-125 transition-transform">
                  <span className="material-symbols-outlined text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 bg-surface h-full overflow-y-auto px-10 py-12 no-scrollbar">
          {/* Hero Header */}
          <header className="mb-12 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 relative">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-[2px] w-8 bg-primary"></span>
                <span className="text-xs font-mono font-bold tracking-[0.2em] text-primary uppercase">Knowledge Repository</span>
              </div>
              <h1 className="text-5xl font-heading font-bold tracking-tight text-on-surface mb-6">Master the Logic of the Future.</h1>
              <p className="text-on-surface-variant leading-relaxed text-lg font-light">Explore our curated collection of high-intelligence courses designed for the visionaries of the digital age.</p>
            </motion.div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-80 group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">search</span>
                <input 
                  type="text" 
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
              <div className="hidden xl:flex items-center gap-4 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/10">
                <button className="bg-white text-primary shadow-sm p-3 rounded-xl material-symbols-outlined">grid_view</button>
                <button className="text-outline-variant p-3 rounded-xl material-symbols-outlined hover:text-primary transition-colors">list</button>
              </div>
            </div>
          </header>

          {/* Course Bento Grid */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading Shimmers
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-surface-container-low rounded-3xl animate-pulse" />
              ))
            ) : courses.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <span className="material-symbols-outlined text-outline-variant text-6xl mb-4">clinical_notes</span>
                <p className="text-on-surface-variant font-medium">No courses have been published yet. Check back soon!</p>
              </div>
            ) : (
              courses.map((course) => (
                <motion.div key={course.id} variants={fadeUpVariant} className="group bg-surface-container-lowest rounded-3xl overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-heading font-bold text-on-surface group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-1 text-tertiary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm font-bold font-mono">5.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-8 flex-1">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Tuition</span>
                        <span className="text-xl font-heading font-bold text-on-surface">${course.price}</span>
                      </div>
                      <Link href={`/courses/${course.id}`} className="bg-surface-container-low text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
                        View Course
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {courses.length > 0 && (
              /* Featured Card (Asymmetric Span) kept as a constant visual anchor */
              <motion.div variants={fadeUpVariant} className="lg:col-span-1 group bg-slate-900 rounded-3xl overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 relative">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,#00687b,transparent)]"></div>
                <div className="p-10 relative z-10 h-full flex flex-col">
                  <span className="material-symbols-outlined text-primary text-5xl mb-6">workspace_premium</span>
                  <h3 className="text-2xl font-heading font-bold text-white mb-4">The Transcendent Path</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-10">Our most rigorous certification program. A 12-month journey through the complete Luminous Logic stack.</p>
                  <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-primary text-[10px] flex items-center justify-center font-bold text-white">+82</div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Visionaries enrolled</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-2xl font-bold tracking-tight hover:opacity-90 transition-all">Apply for Cohort</button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Achievement Notification / Moment of Delight */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="mt-20 mb-20 p-8 rounded-[2rem] bg-secondary/5 border border-secondary/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 bg-tertiary-container rounded-2xl flex items-center justify-center shadow-lg shadow-tertiary/10">
                <span className="material-symbols-outlined text-on-tertiary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <div>
                <h4 className="font-heading font-bold text-on-surface text-lg">Scholarship Program Open</h4>
                <p className="text-on-surface-variant text-sm">We're awarding 50 full-ride seats to students in developing digital economies.</p>
              </div>
            </div>
            <button className="font-mono text-sm font-bold text-secondary uppercase tracking-widest hover:translate-x-2 transition-transform flex items-center gap-2 whitespace-nowrap">
              Learn Requirements
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
