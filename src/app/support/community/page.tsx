'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function CommunityPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // new thread modal
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [posting, setPosting] = useState(false);

  async function loadThreads() {
    const { data } = await supabase
      .from('forum_threads')
      .select('*, profiles:user_id (full_name, avatar_url), forum_replies(count), forum_thread_votes(count)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) setThreads(data);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      await loadThreads();
      if (user) {
        const { data: votes } = await supabase.from('forum_thread_votes').select('thread_id').eq('user_id', user.id);
        if (votes) setVotedIds(new Set(votes.map((v: any) => v.thread_id)));
      }
      setLoading(false);
    }
    init();
  }, []);

  const toggleVote = async (threadId: string) => {
    if (!userId) { router.push('/login?redirect=/support/community'); return; }
    const has = votedIds.has(threadId);
    // optimistic
    setVotedIds(prev => { const n = new Set(prev); has ? n.delete(threadId) : n.add(threadId); return n; });
    setThreads(ts => ts.map(t => t.id === threadId
      ? { ...t, forum_thread_votes: [{ count: (t.forum_thread_votes?.[0]?.count || 0) + (has ? -1 : 1) }] }
      : t));
    if (has) await supabase.from('forum_thread_votes').delete().eq('thread_id', threadId).eq('user_id', userId);
    else await supabase.from('forum_thread_votes').insert({ thread_id: threadId, user_id: userId });
  };

  const createThread = async () => {
    if (!userId) { router.push('/login?redirect=/support/community'); return; }
    if (!title.trim()) return;
    setPosting(true);
    const { error } = await supabase.from('forum_threads').insert({
      user_id: userId, title, body,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
    });
    setPosting(false);
    if (error) { alert(error.message); return; }
    setShowNew(false); setTitle(''); setBody(''); setTags('');
    await loadThreads();
  };

  const filtered = threads.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.body || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Community Forum</h1>
            <p className="text-on-surface-variant mt-2">Connect and grow with fellow learners</p>
          </div>
          <button onClick={() => userId ? setShowNew(true) : router.push('/login?redirect=/support/community')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none">
            <span className="material-symbols-outlined text-[18px]">add</span>New Thread
          </button>
        </motion.header>

        <div className="flex items-center bg-white rounded-xl border border-outline-variant/10 px-4 py-3 mb-8">
          <span className="material-symbols-outlined text-outline mr-3">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none text-sm w-full outline-none placeholder:text-outline" placeholder="Search threads..." type="text" />
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">forum</span>
            <p className="text-on-surface-variant mb-4">{search ? `No threads match "${search}"` : 'No threads yet. Start the conversation!'}</p>
            {!search && userId && <button onClick={() => setShowNew(true)} className="text-primary font-bold hover:underline">Create the first thread →</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => {
              const votes = t.forum_thread_votes?.[0]?.count || 0;
              const replies = t.forum_replies?.[0]?.count || 0;
              const voted = votedIds.has(t.id);
              return (
                <div key={t.id} className="bg-white rounded-2xl p-5 border border-outline-variant/10 hover:shadow-md transition-shadow group">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center min-w-[44px] text-center">
                      <button onClick={() => toggleVote(t.id)} className={`outline-none transition-colors ${voted ? 'text-primary' : 'text-outline hover:text-primary'}`}>
                        <span className="material-symbols-outlined" style={voted ? { fontVariationSettings: "'FILL' 1" } : undefined}>arrow_drop_up</span>
                      </button>
                      <span className="text-sm font-bold font-mono text-on-surface">{votes}</span>
                    </div>
                    <Link href={`/support/community/${t.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        {t.pinned && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>}
                        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{t.title}</h3>
                      </div>
                      {t.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {t.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-outline">
                        <span className="font-medium">{t.profiles?.full_name || 'Member'}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">chat_bubble</span>{replies}</span>
                        <span>{timeAgo(t.created_at)}</span>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Thread Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-5">Start a new thread</h2>
            <div className="space-y-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What's on your mind?" rows={5} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated, e.g. Projects, Motivation)" className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <div className="flex gap-3">
                <button onClick={createThread} disabled={posting || !title.trim()} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-50">{posting ? 'Posting…' : 'Post Thread'}</button>
                <button onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
