'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type Lesson = {
  id: string;
  title: string;
  description: string;
  videoFile: File | null;
  videoPreview: string;
  uploading: boolean;
  uploaded: boolean;
  video_url: string;
  duration_seconds: number;
  is_free: boolean;
};

const STEPS = ['Course Info', 'Curriculum', 'Media', 'Publish'];

const categories = ['Design & Theory', 'Advanced Engineering', 'Digital Humanities', 'Ethereal Arts'];
const levels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function CourseCreateView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('0');
  const [whatYouLearn, setWhatYouLearn] = useState('');
  const [requirements, setRequirements] = useState('');

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login');
      else setUser(user);
    });
  }, [router]);

  const addLesson = () => {
    setLessons([...lessons, {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      videoFile: null,
      videoPreview: '',
      uploading: false,
      uploaded: false,
      video_url: '',
      duration_seconds: 0,
      is_free: lessons.length === 0,
    }]);
  };

  const updateLesson = (id: string, patch: Partial<Lesson>) => {
    setLessons(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  const removeLesson = (id: string) => {
    setLessons(ls => ls.filter(l => l.id !== id));
  };

  const handleVideoSelect = (lessonId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    updateLesson(lessonId, { videoFile: file, videoPreview: preview, uploaded: false, video_url: '' });
  };

  const uploadVideo = async (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson?.videoFile || !user) return;
    updateLesson(lessonId, { uploading: true });
    try {
      const ext = lesson.videoFile.name.split('.').pop();
      const path = `${user.id}/${lessonId}.${ext}`;
      const { error } = await supabase.storage
        .from('course-videos')
        .upload(path, lesson.videoFile, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('course-videos').getPublicUrl(path);
      updateLesson(lessonId, { uploading: false, uploaded: true, video_url: publicUrl });
    } catch (err: any) {
      updateLesson(lessonId, { uploading: false });
      alert('Video upload failed: ' + err.message);
    }
  };

  const handleThumbnailSelect = async (file: File) => {
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    if (!user) return;
    setUploadingThumbnail(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/thumb-${Date.now()}.${ext}`;
      await supabase.storage.from('course-thumbnails').upload(path, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('course-thumbnails').getPublicUrl(path);
      setThumbnailUrl(publicUrl);
    } catch (err: any) {
      alert('Thumbnail upload failed: ' + err.message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handlePublish = async (isDraft = false) => {
    if (!user) return;
    if (!title.trim() || !description.trim()) { setError('Title and description are required.'); return; }
    setPublishing(true);
    setError(null);
    try {
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .insert({
          title,
          description,
          category,
          level,
          price: parseFloat(price) || 0,
          instructor_id: user.id,
          is_published: !isDraft,
          thumbnail_url: thumbnailUrl || null,
          total_duration_minutes: Math.ceil(
            lessons.reduce((s, l) => s + (l.duration_seconds || 0), 0) / 60
          ),
        })
        .select()
        .single();
      if (courseErr) throw courseErr;

      if (lessons.length > 0) {
        const lessonRows = lessons.map((l, idx) => ({
          course_id: courseData.id,
          title: l.title || `Lesson ${idx + 1}`,
          description: l.description,
          video_url: l.video_url || null,
          order_index: idx,
          is_free: l.is_free,
          duration_seconds: l.duration_seconds || 0,
        }));
        const { error: lessonErr } = await supabase.from('lessons').insert(lessonRows);
        if (lessonErr) throw lessonErr;
      }

      router.push(`/dashboard/instructor?created=${courseData.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const canProceed = [
    title.trim().length > 0 && description.trim().length > 0,
    lessons.length > 0,
    true,
    true,
  ];

  return (
    <div className="min-h-screen bg-surface font-body">
      <header className="fixed top-0 w-full z-50 h-16 bg-white border-b border-outline-variant/10 flex items-center px-6 gap-6">
        <Link href="/dashboard/instructor" className="text-sm text-outline hover:text-on-surface transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </Link>
        <div className="flex-1 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  i === step ? 'bg-primary text-white' :
                  i < step ? 'bg-emerald-100 text-emerald-700 cursor-pointer' :
                  'bg-surface-container text-outline'
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {i < step
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : <span>{i + 1}</span>}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-outline-variant/30" />}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={() => handlePublish(true)}
          disabled={publishing}
          className="text-sm text-outline hover:text-on-surface font-medium"
        >
          Save Draft
        </button>
      </header>

      <main className="pt-20 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-on-surface mb-1">Course Details</h1>
                <p className="text-on-surface-variant text-sm">Tell students what they'll learn</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Course Title *</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Complete React & TypeScript Masterclass"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your course in detail..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Level</label>
                    <select value={level} onChange={e => setLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white">
                      {Object.entries(levels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 py-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-on-surface mb-1">Curriculum</h1>
                <p className="text-on-surface-variant text-sm">Add lessons and upload their videos</p>
              </div>
              <div className="space-y-4">
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-3 bg-surface-container-low/50 border-b border-outline-variant/10">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <input
                        value={lesson.title}
                        onChange={e => updateLesson(lesson.id, { title: e.target.value })}
                        placeholder="Lesson title..."
                        className="flex-1 bg-transparent text-sm font-bold text-on-surface placeholder:text-outline focus:outline-none"
                      />
                      <button onClick={() => removeLesson(lesson.id)} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      {lesson.videoPreview ? (
                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                          <video src={lesson.videoPreview} className="w-full h-full object-contain" controls />
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/40 cursor-pointer">
                          <span className="material-symbols-outlined text-3xl text-outline mb-2">video_file</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleVideoSelect(lesson.id, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addLesson}
                  className="w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl text-primary font-bold text-sm hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Lesson
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-on-surface mb-1">Course Media</h1>
                <p className="text-on-surface-variant text-sm">Upload a thumbnail</p>
              </div>
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="relative w-full aspect-video max-h-80 rounded-2xl border-2 border-dashed border-outline-variant/30 cursor-pointer overflow-hidden group"
              >
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                    {thumbnailUrl && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">Saved</div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <span className="material-symbols-outlined text-5xl text-outline">image</span>
                    <span className="text-sm text-outline font-medium">Click to upload</span>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleThumbnailSelect(e.target.files[0])}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-on-surface mb-1">Review & Publish</h1>
              </div>
              {error && (
                <div className="p-4 bg-error/10 text-error rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => handlePublish(false)}
                  disabled={publishing}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-bold disabled:opacity-60"
                >
                  {publishing ? 'Publishing...' : 'Publish Course'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-outline-variant/10 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm font-bold disabled:opacity-30"
          >
            Previous
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => {
                if (!canProceed[step]) {
                  setError(step === 0 ? 'Please fill in title and description.' : 'Please add at least one lesson.');
                  return;
                }
                setError(null);
                setStep(s => s + 1);
              }}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
