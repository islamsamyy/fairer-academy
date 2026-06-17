'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles:author_id(full_name, avatar_url)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) { router.push('/blog'); return; }
      setPost(data);

      // Increment view count (best-effort)
      supabase.from('blogs').update({ views: data.views + 1 }).eq('id', data.id);

      // Fetch related posts (same category, different slug)
      const { data: rel } = await supabase
        .from('blogs')
        .select('id, title, slug, cover_url, category, created_at, excerpt')
        .eq('is_published', true)
        .eq('category', data.category)
        .neq('slug', slug)
        .limit(3);
      setRelated(rel || []);
      setLoading(false);
    }
    load();
  }, [slug, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="material-symbols-outlined text-primary text-3xl">article</span>
        </div>
        <p className="text-muted-foreground font-medium">{t('blog.loadingArticle')}</p>
      </div>
    </div>
  );

  if (!post) return null;

  return (
    <div className="min-h-screen">

      {/* Cover image hero */}
      <div className="relative h-64 sm:h-96 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {post.cover_url ? (
          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full mesh-gradient" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 pb-24 -mt-24 relative z-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
          <Link href="/" className="hover:text-primary transition-colors">{t('blog.homeLink')}</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">{t('blog.blogLink')}</Link>
          <span>/</span>
          <span className="text-on-background truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">{post.category}</span>
            {post.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">#{tag}</span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tighter text-on-background leading-tight mb-6">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-light border-l-4 border-primary pl-5">
              {post.excerpt}
            </p>
          )}

          {/* Author meta */}
          <div className="flex items-center gap-4 py-6 border-y border-outline-variant/20 mb-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt={post.profiles.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                (post.profiles?.full_name || 'A').charAt(0)
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-on-background">{post.profiles?.full_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {post.updated_at !== post.created_at && ` · Updated ${new Date(post.updated_at).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-base">visibility</span>
              <span className="font-mono">{(post.views + 1).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Content — rendered as styled prose */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {/* Share / back */}
        <div className="mt-16 flex items-center justify-between flex-wrap gap-4 py-6 border-t border-outline-variant/20">
          <Link href="/blog" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t('blog.backToBlog')}
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert(t('blog.linkCopied'));
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 glass-glow rounded-xl font-bold text-sm hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            {t('blog.share')}
          </button>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-heading font-black text-on-background mb-6">{t('blog.relatedArticles')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group block glass-glow rounded-2xl overflow-hidden card-hover-glow">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    {r.cover_url ? (
                      <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary opacity-20 text-3xl">article</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-sm text-on-background group-hover:text-primary transition-colors line-clamp-2">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Convert plain text / simple markdown-like content to HTML for display
function renderContent(raw: string): string {
  if (!raw) return '';

  // If it already looks like HTML, return as-is
  if (raw.trim().startsWith('<')) return raw;

  // Basic markdown-like rendering
  return raw
    .split('\n')
    .map(line => {
      if (line.startsWith('# '))    return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('## '))   return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('### '))  return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>`;
      if (line.startsWith('- ') || line.startsWith('* '))
        return `<li>${line.slice(2)}</li>`;
      if (line.startsWith('> '))    return `<blockquote>${line.slice(2)}</blockquote>`;
      if (line.trim() === '')       return '<br/>';
      return `<p>${line}</p>`;
    })
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/`(.+?)`/g,     '<code>$1</code>');
}
