'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type Q = {
  id?: string;
  localId: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: 'a' | 'b' | 'c' | 'd';
  order_index: number;
  isNew: boolean;
  dirty: boolean;
};

const OPTS: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];

function QuizEditorContent() {
  const { id: courseId } = useParams();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson');
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [lessonTitle, setLessonTitle] = useState('');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState('Lesson Quiz');
  const [passScore, setPassScore] = useState(70);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!course || (course.instructor_id !== user.id && profile?.role !== 'admin')) {
        setDenied(true); setLoading(false); return;
      }

      if (lessonId) {
        const { data: lesson } = await supabase.from('lessons').select('title').eq('id', lessonId).single();
        setLessonTitle(lesson?.title || '');
      }

      // load existing quiz for this lesson
      let q = supabase.from('quizzes').select('*').eq('course_id', courseId);
      q = lessonId ? q.eq('lesson_id', lessonId) : q.is('lesson_id', null);
      const { data: quiz } = await q.maybeSingle();

      if (quiz) {
        setQuizId(quiz.id);
        setTitle(quiz.title);
        setPassScore(quiz.pass_score);
        const { data: qs } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quiz.id).order('order_index');
        setQuestions((qs || []).map((row: any, i: number) => ({
          id: row.id, localId: row.id, question_text: row.question_text,
          option_a: row.option_a, option_b: row.option_b, option_c: row.option_c || '', option_d: row.option_d || '',
          correct: row.correct, order_index: row.order_index ?? i, isNew: false, dirty: false,
        })));
      }
      setLoading(false);
    }
    load();
  }, [courseId, lessonId, router]);

  const addQ = () => setQuestions(qs => [...qs, {
    localId: crypto.randomUUID(), question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct: 'a', order_index: qs.length, isNew: true, dirty: true,
  }]);
  const patchQ = (lid: string, patch: Partial<Q>) =>
    setQuestions(qs => qs.map(q => q.localId === lid ? { ...q, ...patch, dirty: true } : q));
  const removeQ = (lid: string) => setQuestions(qs => {
    const t = qs.find(q => q.localId === lid);
    if (t?.id) setDeletedIds(d => [...d, t.id!]);
    return qs.filter(q => q.localId !== lid);
  });

  const save = async () => {
    if (questions.length === 0) { setMsg('Add at least one question'); return; }
    if (questions.some(q => !q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim())) {
      setMsg('Each question needs text and at least options A & B'); return;
    }
    setSaving(true);
    setMsg('');
    try {
      let qid = quizId;
      if (!qid) {
        const { data, error } = await supabase.from('quizzes').insert({
          course_id: courseId, lesson_id: lessonId || null, title, pass_score: passScore,
        }).select().single();
        if (error) throw error;
        qid = data.id;
        setQuizId(qid);
      } else {
        const { error } = await supabase.from('quizzes').update({ title, pass_score: passScore }).eq('id', qid);
        if (error) throw error;
      }

      if (deletedIds.length) {
        const { error } = await supabase.from('quiz_questions').delete().in('id', deletedIds);
        if (error) throw error;
        setDeletedIds([]);
      }

      const newRows = questions.filter(q => q.isNew).map((q, i) => ({
        quiz_id: qid, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
        option_c: q.option_c || null, option_d: q.option_d || null, correct: q.correct, order_index: q.order_index ?? i,
      }));
      if (newRows.length) {
        const { error } = await supabase.from('quiz_questions').insert(newRows);
        if (error) throw error;
      }
      for (const q of questions.filter(q => !q.isNew && q.dirty)) {
        const { error } = await supabase.from('quiz_questions').update({
          question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
          option_c: q.option_c || null, option_d: q.option_d || null, correct: q.correct, order_index: q.order_index,
        }).eq('id', q.id);
        if (error) throw error;
      }
      setMsg('Quiz saved ✓');
      setTimeout(() => router.push(`/courses/${courseId}/edit`), 800);
    } catch (err: any) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async () => {
    if (!quizId || !confirm('Delete this entire quiz?')) return;
    setSaving(true);
    await supabase.from('quizzes').delete().eq('id', quizId);
    router.push(`/courses/${courseId}/edit`);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading quiz editor…</div>;
  if (denied) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-6xl text-outline/30">lock</span>
      <p className="text-on-surface-variant">You can't edit this quiz.</p>
      <Link href="/dashboard" className="text-primary font-bold hover:underline">Back</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface font-body pb-32">
      <header className="fixed top-0 w-full z-50 h-16 bg-white border-b border-outline-variant/10 flex items-center px-6 gap-4">
        <Link href={`/courses/${courseId}/edit`} className="text-sm text-outline hover:text-on-surface flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to course
        </Link>
        <h1 className="font-bold text-on-surface truncate flex-1">Quiz{lessonTitle ? `: ${lessonTitle}` : ''}</h1>
        {quizId && <button onClick={deleteQuiz} className="text-sm text-error hover:underline font-medium">Delete quiz</button>}
      </header>

      <main className="pt-24 max-w-3xl mx-auto px-4 sm:px-8 space-y-6">
        <section className="bg-white rounded-2xl border border-outline-variant/10 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Quiz Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Pass Score (%)</label>
            <input type="number" min="0" max="100" value={passScore} onChange={e => setPassScore(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </section>

        {questions.map((q, idx) => (
          <div key={q.localId} className="bg-white rounded-2xl border border-outline-variant/10 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
              <input value={q.question_text} onChange={e => patchQ(q.localId, { question_text: e.target.value })} placeholder="Question text…" className="flex-1 bg-transparent text-sm font-bold text-on-surface placeholder:text-outline focus:outline-none" />
              <button onClick={() => removeQ(q.localId)} className="text-outline hover:text-error"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OPTS.map(opt => (
                <label key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${q.correct === opt ? 'border-emerald-400 bg-emerald-50' : 'border-outline-variant/20'}`}>
                  <input type="radio" name={`correct-${q.localId}`} checked={q.correct === opt} onChange={() => patchQ(q.localId, { correct: opt })} className="accent-emerald-500" />
                  <span className="text-xs font-bold uppercase text-outline">{opt}</span>
                  <input
                    value={(q as any)[`option_${opt}`]}
                    onChange={e => patchQ(q.localId, { [`option_${opt}`]: e.target.value } as any)}
                    placeholder={opt === 'c' || opt === 'd' ? 'Option (optional)' : 'Option'}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-outline">Select the radio next to the correct answer (highlighted green).</p>
          </div>
        ))}

        <button onClick={addQ} className="w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl text-primary font-bold text-sm hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add_circle</span> Add Question
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-outline-variant/10 px-6 py-4 flex items-center justify-between">
        {msg ? <span className={`text-sm font-bold ${msg.startsWith('Error') || msg.startsWith('Add') || msg.startsWith('Each') ? 'text-error' : 'text-emerald-600'}`}>{msg}</span> : <span className="text-xs text-outline">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>}
        <button onClick={save} disabled={saving} className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 flex items-center gap-2">
          {saving ? <><span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> Saving…</> : <><span className="material-symbols-outlined text-sm">save</span> Save Quiz</>}
        </button>
      </div>
    </div>
  );
}

export default function QuizEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Loading…</div>}>
      <QuizEditorContent />
    </Suspense>
  );
}
