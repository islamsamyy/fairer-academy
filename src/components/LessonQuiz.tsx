'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Props = { lessonId: string; userId: string | null };

export default function LessonQuiz({ lessonId, userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setResult(null);
      setAnswers({});
      setStarted(false);

      const { data: quizData } = await supabase
        .from('quizzes').select('*').eq('lesson_id', lessonId).maybeSingle();
      if (!active) return;

      if (!quizData) { setQuiz(null); setLoading(false); return; }
      setQuiz(quizData);

      const { data: qs } = await supabase
        .from('quiz_questions').select('*').eq('quiz_id', quizData.id).order('order_index');
      if (!active) return;
      setQuestions(qs || []);

      // existing best submission?
      if (userId) {
        const { data: subs } = await supabase
          .from('quiz_submissions').select('score, passed')
          .eq('quiz_id', quizData.id).eq('user_id', userId)
          .order('score', { ascending: false }).limit(1);
        if (active && subs && subs.length) setResult({ score: subs[0].score, passed: subs[0].passed });
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [lessonId, userId]);

  const submit = async () => {
    if (!quiz || !userId) return;
    setSubmitting(true);
    const total = questions.length;
    const correct = questions.filter(q => answers[q.id] === q.correct).length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    const passed = score >= (quiz.pass_score ?? 70);
    await supabase.from('quiz_submissions').insert({
      quiz_id: quiz.id, user_id: userId, score, passed, answers,
    });
    setResult({ score, passed });
    setStarted(false);
    setSubmitting(false);
  };

  if (loading) return null;
  if (!quiz) return null;

  return (
    <div className="bg-white rounded-2xl border border-surface-container-highest/50 p-6 sm:p-8 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined">quiz</span>
        </span>
        <div>
          <h3 className="font-headline font-bold text-on-surface">{quiz.title}</h3>
          <p className="text-xs text-outline">{questions.length} question{questions.length !== 1 ? 's' : ''} · pass {quiz.pass_score}%</p>
        </div>
      </div>

      {/* Result banner */}
      {result && !started && (
        <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          <span className="material-symbols-outlined">{result.passed ? 'verified' : 'replay'}</span>
          <div className="flex-1">
            <p className="font-bold text-sm">{result.passed ? 'Passed' : 'Keep trying'} — your best score: {result.score}%</p>
            <p className="text-xs opacity-80">{result.passed ? 'Great work!' : `You need ${quiz.pass_score}% to pass.`}</p>
          </div>
        </div>
      )}

      {!started ? (
        <button
          onClick={() => { setStarted(true); setAnswers({}); }}
          disabled={!userId}
          className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {result ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id}>
              <p className="font-bold text-sm text-on-surface mb-3">{idx + 1}. {q.question_text}</p>
              <div className="space-y-2">
                {(['a', 'b', 'c', 'd'] as const).map(opt => {
                  const label = q[`option_${opt}`];
                  if (!label) return null;
                  const selected = answers[q.id] === opt;
                  return (
                    <label key={opt} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${selected ? 'border-secondary bg-secondary/5' : 'border-outline-variant/20 hover:bg-surface-container-low'}`}>
                      <input type="radio" name={q.id} checked={selected} onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))} className="accent-secondary" />
                      <span className="text-sm text-on-surface">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-secondary-container text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Submitting…' : 'Submit Answers'}
            </button>
            <button onClick={() => setStarted(false)} className="px-6 py-3 rounded-xl bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high">
              Cancel
            </button>
          </div>
          {Object.keys(answers).length < questions.length && (
            <p className="text-xs text-outline">Answer all questions to submit.</p>
          )}
        </div>
      )}
    </div>
  );
}
