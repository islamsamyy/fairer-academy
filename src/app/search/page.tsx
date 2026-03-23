'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Search courses by title or description
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (
            full_name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_published', true);

      if (!error && data) {
        setResults(data.map(item => ({
          id: item.id,
          type: 'course',
          title: item.title,
          desc: item.description,
          instructor: item.profiles?.full_name || 'Expert Instructor',
          rating: 5.0, // Placeholder rating logic
          price: item.price,
          image: item.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
        })));
      }
      setLoading(false);
    }

    fetchResults();
  }, [query]);

  return (
    <div className="bg-surface font-body text-on-background min-h-screen pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-on-surface-variant">
          {loading ? 'Searching...' : `${results.length} results for "`}
          <span className="font-bold text-on-surface">{query}</span>
          {!loading && '"'}
        </p>
      </motion.header>

      <div className="flex flex-wrap gap-2 mb-8">
        {['All', 'Courses', 'Instructors', 'Community'].map((f, i) => (
          <button 
            key={f} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all outline-none ${i === 0 ? 'bg-primary text-white' : 'bg-white border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container'}`}
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
        ) : results.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-outline text-6xl mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium">No results found for your search.</p>
            <Link href="/courses" className="text-primary font-bold mt-4 inline-block hover:underline">Explore all courses</Link>
          </div>
        ) : (
          results.map((r, i) => (
            <Link key={r.id} href={`/courses/${r.id}`}>
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
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold font-mono">{r.rating}</span>
                    </div>
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
