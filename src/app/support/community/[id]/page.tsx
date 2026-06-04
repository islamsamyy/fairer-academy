'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ThreadPage() {
  const { id } = useParams();
  const router = useRouter();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);

  async function loadReplies() {
    const { data } = await supabase
      .from('forum_replies')
      .select('*, profiles:user_id (full_name, avatar_url)')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });
    if (data) setReplies(data);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      const { data: t } = await supabase
        .from('forum_threads')
        .select('*, profiles:user_id (full_name, avatar_url)')
        .eq('id', id).maybeSingle();
      setThread(t);
      await loadReplies();
      setLoading(false);
    }
    init();
  }, [id]);

  const postReply = async () => {
    if (!userId) { router.push(`/login?redirect=/support/community/${id}`); return; }
    if (!reply.trim()) return;
    setPosting(true);
    const { error } = await supabase.from('forum_replies').insert({ thread_id: id, user_id: userId, body: reply });
    setPosting(false);
    if (error) { alert(error.message); return; }
    setReply('');
    await loadReplies();
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading thread…</div>;
  if (!thread) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-6xl text-outline/30">forum</span>
      <p className="text-on-surface-variant">Thread not found.</p>
      <Link href="/support/community" className="text-primary font-bold hover:underline">Back to forum</Link>
    </div>
  );

  const Avatar = ({ p }: { p: any }) => p?.avatar_url
    ? <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
    : <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{(p?.full_name || '?').charAt(0).toUpperCase()}</div>;

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-3xl mx-auto px-4 sm:px-8">
        <Link href="/support/community" className="text-sm text-outline hover:text-on-surface flex items-center gap-1 mb-6">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to forum
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-outline-variant/10 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar p={thread.profiles} />
            <div>
              <p className="font-bold text-sm text-on-surface">{thread.profiles?.full_name || 'Member'}</p>
              <p className="text-xs text-outline">{timeAgo(thread.created_at)}</p>
            </div>
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">{thread.title}</h1>
          {thread.body && <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{thread.body}</p>}
          {thread.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {thread.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          )}
        </motion.div>

        <h2 className="font-bold text-on-surface mb-4">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h2>

        <div className="space-y-3 mb-8">
          {replies.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-2">
                <Avatar p={r.profiles} />
                <div>
                  <p className="font-bold text-sm text-on-surface">{r.profiles?.full_name || 'Member'}</p>
                  <p className="text-xs text-outline">{timeAgo(r.created_at)}</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap pl-12">{r.body}</p>
            </div>
          ))}
          {replies.length === 0 && <p className="text-on-surface-variant text-sm">No replies yet. Be the first to respond!</p>}
        </div>

        {/* Reply composer */}
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/10 sticky bottom-4 shadow-lg">
          {userId ? (
            <>
              <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Write a reply…" className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3" />
              <div className="flex justify-end">
                <button onClick={postReply} disabled={posting || !reply.trim()} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">{posting ? 'Posting…' : 'Reply'}</button>
              </div>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-2">
              <Link href={`/login?redirect=/support/community/${id}`} className="text-primary font-bold hover:underline">Sign in</Link> to join the discussion.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
