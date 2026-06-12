'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

function SearchResultsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Courses' | 'Instructors' | 'Community'>('All');

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      const all: any[] = [];

      // Courses
      const { data: courseData } = await supabase
        .from('courses')
        .select(`*, profiles:instructor_id (full_name, avatar_url)`)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_published', true);
      if (courseData) {
        all.push(...courseData.map(item => ({
          id: item.id,
          type: 'course',
          href: `/courses/${item.id}`,
          title: item.title,
          desc: item.description,
          instructor: item.profiles?.full_name || 'Expert Instructor',
          price: item.price,
          image: item.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
        })));
      }

      // Instructors
      const { data: instructorData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .eq('role', 'instructor')
        .ilike('full_name', `%${query}%`);
      if (instructorData) {
        all.push(...instructorData.map(p => ({
          id: p.id,
          type: 'instructor',
          href: p.username ? `/${p.username}` : '/courses',
          title: p.full_name,
          desc: 'Instructor at جامعة فايرير السعودية',
          instructor: null,
          price: 0,
          image: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
        })));
      }

      // Community threads
      const { data: threadData } = await supabase
        .from('forum_threads')
        .select('id, title, body')
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .limit(20);
      if (threadData) {
        all.push(...threadData.map(th => ({
          id: th.id,
          type: 'community',
          href: `/support/community/${th.id}`,
          title: th.title,
          desc: th.body,
          instructor: null,
          price: 0,
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop'
        })));
      }

      setResults(all);
      setLoading(false);
    }

    fetchResults();
  }, [query]);

  const filtered = results.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Courses') return r.type === 'course';
    if (filter === 'Instructors') return r.type === 'instructor';
    return r.type === 'community';
  });

  return (
    <div className="bg-surface font-body text-on-background min-h-screen pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-on-surface-variant">
          {loading ? 'Searching...' : `${filtered.length} results for "`}
          <span className="font-bold text-on-surface">{query}</span>
          {!loading && '"'}
        </p>
      </motion.header>

      <div className="flex flex-wrap gap-2 mb-8">
        {(['All', 'Courses', 'Instructors', 'Community'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all outline-none ${filter === f ? 'bg-primary text-white' : 'bg-white border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-container-low rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-outline text-6xl mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium">{t('search.noResults')} "{query}"</p>
            <Link href="/courses" className="text-primary font-bold mt-4 inline-block hover:underline">{t('courses.h1Sub')}</Link>
          </div>
        ) : (
          filtered.map((r) => (
            <Link key={`${r.type}-${r.id}`} href={r.href}>
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 cursor-pointer group mb-4">
                <div className={`w-full sm:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 ${r.type === 'instructor' ? 'sm:w-24 sm:h-24' : ''}`}>
                  <img alt={r.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${r.type === 'instructor' ? 'rounded-full' : ''}`} src={r.image} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">{r.type}</span>
                  <h3 className="font-headline font-bold text-on-surface text-lg mt-1 group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="text-xs text-outline mt-1 line-clamp-2">{r.desc}</p>
                  <div className="flex items-center gap-4 mt-3">
                    {r.instructor && <span className="text-xs text-on-surface-variant">By {r.instructor}</span>}
                    {r.price > 0 && <span className="text-sm font-bold font-headline text-on-surface">${r.price}</span>}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </motion.div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Scanning Repository...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
