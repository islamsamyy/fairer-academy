'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type Lesson = {
  id?: string;            // db id if existing
  localId: string;        // stable key
  title: string;
  description: string;
  video_url: string;
  duration_seconds: number;
  is_free: boolean;
  order_index: number;
  videoFile: File | null;
  videoPreview: string;
  uploading: boolean;
  isNew: boolean;
  dirty: boolean;
};

const categories = ['Design & Theory', 'Advanced Engineering', 'Digital Humanities', 'Ethereal Arts'];
const levels = ['beginner', 'intermediate', 'advanced'];

export default function CourseEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const thumbRef = useRef<HTMLInputElement>(null);

  // course fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('0');
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: course } = await supabase.from('courses').select('*').eq('id', id).single();
      if (!course) { setDenied(true); setLoading(false); return; }

      // permission: owner or admin
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const isOwner = course.instructor_id === user.id;
      const isAdmin = profile?.role === 'admin';
      if (!isOwner && !isAdmin) { setDenied(true); setLoading(false); return; }

      setTitle(course.title || '');
      setDescription(course.description || '');
      setCategory(course.category || categories[0]);
      setLevel(course.level || 'beginner');
      setPrice(String(course.price ?? 0));
      setIsPublished(!!course.is_published);
      setThumbnailUrl(course.thumbnail_url || '');

      const { data: lessonRows } = await supabase
        .from('lessons').select('*').eq('course_id', id).order('order_index', { ascending: true });
      setLessons((lessonRows || []).map((l: any, i: number) => ({
        id: l.id,
        localId: l.id,
        title: l.title || '',
        description: l.description || '',
        video_url: l.video_url || '',
        duration_seconds: l.duration_seconds || 0,
        is_free: l.is_free || false,
        order_index: l.order_index ?? i,
        videoFile: null,
        videoPreview: '',
        uploading: false,
        isNew: false,
        dirty: false,
      })));
      setLoading(false);
    }
    load();
  }, [id, router]);

  const patchLesson = (localId: string, patch: Partial<Lesson>) =>
    setLessons(ls => ls.map(l => l.localId === localId ? { ...l, ...patch, dirty: true } : l));

  const addLesson = () => setLessons(ls => [...ls, {
    localId: crypto.randomUUID(), title: '', description: '', video_url: '', duration_seconds: 0,
    is_free: ls.length === 0, order_index: ls.length, videoFile: null, videoPreview: '',
    uploading: false, isNew: true, dirty: true,
  }]);

  const removeLesson = (localId: string) => {
    setLessons(ls => {
      const target = ls.find(l => l.localId === localId);
      if (target?.id) setDeletedLessonIds(d => [...d, target.id!]);
      return ls.filter(l => l.localId !== localId).map((l, i) => ({ ...l, order_index: i }));
    });
  };

  const move = (localId: string, dir: -1 | 1) => {
    setLessons(ls => {
      const idx = ls.findIndex(l => l.localId === localId);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= ls.length) return ls;
      const copy = [...ls];
      [copy[idx], copy[swap]] = [copy[swap], copy[idx]];
      return copy.map((l, i) => ({ ...l, order_index: i, dirty: true }));
    });
  };

  const uploadVideo = async (localId: string, file: File) => {
    if (!user) return;
    patchLesson(localId, { videoFile: file, videoPreview: URL.createObjectURL(file), uploading: true });
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${localId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('course-videos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('course-videos').getPublicUrl(path);
      patchLesson(localId, { video_url: publicUrl, uploading: false });
    } catch (err: any) {
      patchLesson(localId, { uploading: false });
      alert('Video upload failed: ' + err.message);
    }
  };

  const uploadThumb = async (file: File) => {
    if (!user) return;
    setUploadingThumb(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/thumb-${id}-${Date.now()}.${ext}`;
      await supabase.storage.from('course-thumbnails').upload(path, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('course-thumbnails').getPublicUrl(path);
      setThumbnailUrl(publicUrl);
    } catch (err: any) {
      alert('Thumbnail upload failed: ' + err.message);
    } finally {
      setUploadingThumb(false);
    }
  };

  const save = async () => {
    if (!title.trim()) { setMsg('Title is required'); return; }
    setSaving(true);
    setMsg('');
    try {
      // 1. Update course
      const { error: cErr } = await supabase.from('courses').update({
        title, description, category, level,
        price: parseFloat(price) || 0,
        is_published: isPublished,
        thumbnail_url: thumbnailUrl || null,
        total_duration_minutes: Math.ceil(lessons.reduce((s, l) => s + (l.duration_seconds || 0), 0) / 60),
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (cErr) throw cErr;

      // 2. Delete removed lessons
      if (deletedLessonIds.length) {
        const { error } = await supabase.from('lessons').delete().in('id', deletedLessonIds);
        if (error) throw error;
      }

      // 3. Upsert new/changed lessons
      const newRows = lessons.filter(l => l.isNew).map(l => ({
        course_id: id, title: l.title || 'Untitled lesson', description: l.description,
        video_url: l.video_url || null, duration_seconds: l.duration_seconds || 0,
        order_index: l.order_index, is_free: l.is_free,
      }));
      if (newRows.length) {
        const { error } = await supabase.from('lessons').insert(newRows);
        if (error) throw error;
      }
      const updates = lessons.filter(l => !l.isNew && l.dirty);
      for (const l of updates) {
        const { error } = await supabase.from('lessons').update({
          title: l.title || 'Untitled lesson', description: l.description,
          video_url: l.video_url || null, duration_seconds: l.duration_seconds || 0,
          order_index: l.order_index, is_free: l.is_free, updated_at: new Date().toISOString(),
        }).eq('id', l.id);
        if (error) throw error;
      }

      setMsg('Saved ✓');
      setDeletedLessonIds([]);
      setTimeout(() => router.refresh(), 300);
    } catch (err: any) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading editor…</div>;
  if (denied) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-6xl text-outline/30">lock</span>
      <p className="text-on-surface-variant">You don't have permission to edit this course.</p>
      <Link href="/dashboard" className="text-primary font-bold hover:underline">Back to dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface font-body pb-32">
      <header className="fixed top-0 w-full z-50 h-16 bg-white border-b border-outline-variant/10 flex items-center px-6 gap-4">
        <Link href="/dashboard/admin" className="text-sm text-outline hover:text-on-surface flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </Link>
        <h1 className="font-bold text-on-surface truncate flex-1">Edit: {title || 'Untitled'}</h1>
        <Link href={`/courses/${id}`} className="text-sm text-outline hover:text-primary hidden sm:flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">visibility</span> Preview
        </Link>
      </header>

      <main className="pt-24 max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Details */}
        <section className="bg-white rounded-2xl border border-outline-variant/10 p-6 space-y-5">
          <h2 className="font-headline font-bold text-lg text-on-surface">Course Details</h2>
          <div>
            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm bg-white capitalize focus:outline-none focus:ring-2 focus:ring-primary/20">
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Price (USD)</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded" />
              Published (visible to students)
            </label>
            <div className="flex items-center gap-3">
              <div onClick={() => thumbRef.current?.click()} className="w-28 h-16 rounded-lg overflow-hidden bg-surface-container border border-outline-variant/20 cursor-pointer flex items-center justify-center hover:border-primary/40">
                {thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover" alt="" /> : <span className="material-symbols-outlined text-outline">image</span>}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Thumbnail</p>
                <button onClick={() => thumbRef.current?.click()} className="text-xs text-primary font-medium hover:underline">{uploadingThumb ? 'Uploading…' : 'Change'}</button>
              </div>
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadThumb(e.target.files[0])} />
            </div>
          </div>
        </section>

        {/* Lessons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-lg text-on-surface">Lessons ({lessons.length})</h2>
          </div>
          {lessons.map((l, idx) => (
            <div key={l.localId} className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low/50 border-b border-outline-variant/10">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                <input value={l.title} onChange={e => patchLesson(l.localId, { title: e.target.value })} placeholder="Lesson title…" className="flex-1 bg-transparent text-sm font-bold text-on-surface placeholder:text-outline focus:outline-none" />
                <label className="flex items-center gap-1 text-xs text-outline cursor-pointer">
                  <input type="checkbox" checked={l.is_free} onChange={e => patchLesson(l.localId, { is_free: e.target.checked })} className="rounded" /> Free
                </label>
                <button onClick={() => move(l.localId, -1)} disabled={idx === 0} className="text-outline hover:text-primary disabled:opacity-30"><span className="material-symbols-outlined text-sm">arrow_upward</span></button>
                <button onClick={() => move(l.localId, 1)} disabled={idx === lessons.length - 1} className="text-outline hover:text-primary disabled:opacity-30"><span className="material-symbols-outlined text-sm">arrow_downward</span></button>
                <button onClick={() => removeLesson(l.localId)} className="text-outline hover:text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
              <div className="p-4 space-y-3">
                <textarea value={l.description} onChange={e => patchLesson(l.localId, { description: e.target.value })} placeholder="Lesson description…" rows={2} className="w-full px-3 py-2 text-sm border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <div className="flex items-center gap-3 flex-wrap">
                  {l.video_url ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-[14px]">check_circle</span> Video set</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-outline bg-surface-container px-3 py-1.5 rounded-full">No video</span>
                  )}
                  <label className="text-xs font-bold text-primary cursor-pointer hover:underline">
                    {l.uploading ? 'Uploading…' : (l.video_url ? 'Replace video' : 'Upload video')}
                    <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && uploadVideo(l.localId, e.target.files[0])} />
                  </label>
                  <input type="number" min="0" value={l.duration_seconds} onChange={e => patchLesson(l.localId, { duration_seconds: Number(e.target.value) })} placeholder="Duration (sec)" className="w-32 px-3 py-1.5 text-xs border border-outline-variant/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" title="Duration in seconds" />
                  {l.id ? (
                    <Link href={`/courses/${id}/quiz?lesson=${l.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline">
                      <span className="material-symbols-outlined text-[14px]">quiz</span> Manage quiz
                    </Link>
                  ) : (
                    <span className="text-xs text-outline italic">Save course to add a quiz</span>
                  )}
                </div>
                {(l.video_url || l.videoPreview) && (
                  <video src={l.videoPreview || l.video_url} controls className="w-full max-h-56 rounded-xl bg-black" />
                )}
              </div>
            </div>
          ))}
          <button onClick={addLesson} className="w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl text-primary font-bold text-sm hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add_circle</span> Add Lesson
          </button>
        </section>
      </main>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-outline-variant/10 px-6 py-4 flex items-center justify-between">
        {msg ? <span className={`text-sm font-bold ${msg.startsWith('Error') ? 'text-error' : 'text-emerald-600'}`}>{msg}</span> : <span className="text-xs text-outline">Changes are saved when you click Save.</span>}
        <button onClick={save} disabled={saving} className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-2">
          {saving ? <><span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> Saving…</> : <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
