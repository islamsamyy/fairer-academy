'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const CATEGORIES = ['All', 'General', 'Technology', 'Business', 'Design', 'Career', 'Announcement'];

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from('blogs')
        .select('id, title, slug, excerpt, cover_url, category, tags, views, created_at, profiles:author_id(full_name, avatar_url)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (category !== 'All') q = q.eq('category', category);
      if (search) q = q.ilike('title', `%${search}%`);
      const { data } = await q;
      setPosts(data || []);
      setLoading(false);
    }
    load();
  }, [category, search]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="relative blob-bg mesh-gradient pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-[80px] animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-400/15 rounded-full blur-[60px] animate-blob-delay pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center mb-12">
            <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <Image src="/logo.png" alt="جامعة فايرير السعودية" width={64} height={64} className="drop-shadow-[0_0_20px_rgba(0,200,255,0.55)] animate-float" />
            </motion.div>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              جامعة فايرير السعودية
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-heading font-black tracking-tighter text-on-background leading-tight mb-4">
              The <span className="gradient-text">Blog</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground max-w-xl mx-auto font-light">
              Insights, tutorials, announcements and stories from our team and community.
            </motion.p>
          </motion.div>

          {/* Search + filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full pl-11 pr-4 py-3.5 glass-glow rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-white/50"
              />
            </div>
          </motion.div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${category === c ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'glass-glow text-muted-foreground hover:text-on-background'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-screen-xl mx-auto px-6 sm:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 rounded-3xl skeleton-shimmer" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4 block">article</span>
            <p className="text-muted-foreground font-medium text-lg">No articles found.</p>
            {search && <button onClick={() => setSearch('')} className="mt-4 text-primary font-bold hover:underline">Clear search</button>}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && !search && category === 'All' && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <Link href={`/blog/${featured.slug}`} className="group block glass-glow rounded-[2rem] overflow-hidden card-hover-glow">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="aspect-video lg:aspect-auto lg:min-h-[360px] bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      {featured.cover_url ? (
                        <img src={featured.cover_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-7xl opacity-30">article</span>
                        </div>
                      )}
                    </div>
                    <div className="p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">{featured.category}</span>
                        <span className="text-xs text-muted-foreground font-mono">{new Date(featured.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h2 className="text-3xl font-heading font-black text-on-background group-hover:text-primary transition-colors leading-tight mb-4">{featured.title}</h2>
                      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {(featured.profiles?.full_name || 'A').charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-on-background">{featured.profiles?.full_name || 'Admin'}</span>
                        </div>
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          {featured.views.toLocaleString()} views
                        </span>
                        <span className="ml-auto text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(search || category !== 'All' ? posts : rest).map((post, i) => (
                <motion.div key={post.id} variants={fadeUp} whileHover={{ y: -6 }}>
                  <Link href={`/blog/${post.slug}`} className="group block glass-glow rounded-3xl overflow-hidden h-full card-hover-glow">
                    <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      {post.cover_url ? (
                        <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-5xl opacity-20">article</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h3 className="font-heading font-black text-lg text-on-background group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <span className="text-xs text-muted-foreground">{post.profiles?.full_name || 'Admin'}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          {post.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
}
