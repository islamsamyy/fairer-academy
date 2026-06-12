'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

type Message = { role: 'user' | 'assistant'; content: string };

const initialMessages: Message[] = [
  { role: 'assistant', content: "Hi! I'm the جامعة فايرير السعودية assistant. I can recommend courses, check your progress, explain certificates, or help you find your way around. What do you need?" },
];

/** Data-aware rule-based assistant. Pulls real data from Supabase to answer. */
async function generateReply(text: string): Promise<string> {
  const q = text.toLowerCase();
  const { data: { user } } = await supabase.auth.getUser();

  // Course recommendation
  if (/recommend|suggest|which course|what (course|should i)|learn/.test(q)) {
    let query = supabase.from('courses').select('id, title, category, price, level').eq('is_published', true).limit(4);
    // crude topic match
    const topics = ['design', 'engineering', 'ai', 'machine', 'quantum', 'security', 'ui', 'data'];
    const hit = topics.find(t => q.includes(t));
    if (hit) query = query.ilike('title', `%${hit}%`);
    const { data } = await query;
    if (data && data.length) {
      const list = data.map(c => `• ${c.title} — ${c.price === 0 ? 'Free' : `$${c.price}`} (${c.level})`).join('\n');
      return `Here are some courses you might like:\n\n${list}\n\nBrowse the full catalog at /courses to enroll.`;
    }
    return "I couldn't find a matching course right now — browse everything at /courses.";
  }

  // Progress / my courses
  if (/my progress|my course|how am i|continue|enrolled|dashboard/.test(q)) {
    if (!user) return "Sign in and I can show your progress. You can log in at /login.";
    const { data } = await supabase
      .from('enrollments')
      .select('progress_percentage, courses(title)')
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false, nullsFirst: false })
      .limit(5);
    if (data && data.length) {
      const list = data.map((e: any) => `• ${e.courses?.title}: ${Math.round(e.progress_percentage || 0)}% complete`).join('\n');
      return `Your active courses:\n\n${list}\n\nJump back in from your dashboard at /dashboard.`;
    }
    return "You're not enrolled in any courses yet. Find one at /courses and start learning!";
  }

  // Certificates
  if (/certificate|certification|diploma/.test(q)) {
    return "Certificates are awarded automatically when you complete 100% of a course's lessons. You can view and download them as a PNG from /certificates.";
  }

  // Password / account
  if (/password|reset|forgot|log ?in|sign ?in|account/.test(q)) {
    return "To reset your password, use the 'Forgot password' link on /login (or /forgot-password). To update your profile or change your password while signed in, go to /settings.";
  }

  // Billing / refund
  if (/refund|money back|cancel|billing|payment|invoice|charge/.test(q)) {
    return "We offer a 30-day money-back guarantee on paid courses. You can see your orders at /dashboard/orders, or contact our team at /support/contact to request a refund.";
  }

  // Quizzes
  if (/quiz|test|exam|assessment|score/.test(q)) {
    return "Some lessons include a quiz right below the video. Answer the questions and submit to get scored instantly — your best score is saved. A passing score is set by the instructor.";
  }

  // Scholarships
  if (/scholarship|financial|funding|grant/.test(q)) {
    return "Check active scholarships and apply at /scholarships. Each lists the award, seats, and deadline.";
  }

  // Navigation / general help
  if (/how do i|where|find|navigate|help|support/.test(q)) {
    return "Here's the map:\n• Courses: /courses\n• Your dashboard: /dashboard\n• Certificates: /certificates\n• Orders: /dashboard/orders\n• Settings: /settings\n• Contact a human: /support/contact";
  }

  // Greeting
  if (/^(hi|hello|hey|salam|مرحبا|السلام)/.test(q)) {
    return "Hello! 👋 Ask me to recommend a course, check your progress, or explain how certificates work.";
  }

  return "I'm a focused assistant for جامعة فايرير السعودية. Try asking me to: recommend a course, show your progress, explain certificates, or help with billing. For anything else, our team is at /support/contact.";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Recommend a course for me',
    'Show my progress',
    'How do certificates work?',
    'How do I get a refund?',
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || thinking) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setThinking(true);
    try {
      const reply = await generateReply(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again or contact us at /support/contact.' }]);
    } finally {
      setThinking(false);
    }
  };

  // Render text with clickable internal links
  const renderContent = (content: string) =>
    content.split(/(\s|\n)/).map((tok, i) => {
      if (tok.startsWith('/') && tok.length > 1) {
        return <Link key={i} href={tok} className="text-primary underline font-medium">{tok}</Link>;
      }
      return <React.Fragment key={i}>{tok}</React.Fragment>;
    });

  return (
    <div className="bg-surface font-body text-on-background min-h-screen flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-surface-container-highest/20 flex justify-between items-center px-4 sm:px-8 h-16">
        <div className="flex items-center gap-4">
          <Link href="/support" className="p-2 text-slate-500 hover:text-primary hover:bg-surface-container rounded-full transition-all outline-none">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-on-surface text-sm">Academy Assistant</h1>
              <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 pt-24 pb-40 px-4 sm:px-8 max-w-3xl mx-auto w-full overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-outline-variant/10 shadow-sm text-on-surface rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
              </div>
              <div className="bg-white border border-outline-variant/10 shadow-sm rounded-2xl rounded-bl-sm p-4 flex gap-1">
                {[0, 1, 2].map(d => <span key={d} className="w-2 h-2 bg-outline/40 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            </div>
          )}

          {messages.length <= 1 && !thinking && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-8 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button key={prompt} onClick={() => handleSend(prompt)} className="px-4 py-2.5 bg-white rounded-xl border border-outline-variant/20 text-sm text-on-surface-variant hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all outline-none">
                  {prompt}
                </button>
              ))}
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 p-4 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
            placeholder="Ask the assistant anything..."
            type="text" value={input}
            disabled={thinking}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !thinking && handleSend()}
          />
          <button onClick={() => handleSend()} disabled={thinking} className="p-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all outline-none disabled:opacity-50">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
