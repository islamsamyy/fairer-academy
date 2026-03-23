'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

type Message = { role: 'user' | 'assistant'; content: string };

const initialMessages: Message[] = [
  { role: 'assistant', content: 'Hello! I\'m your AI learning mentor at Fairer Academy. I can help you with course recommendations, study strategies, or answer questions about your curriculum. What would you like to explore today?' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const quickPrompts = [
    'Recommend a course for me',
    'Help me plan my study schedule',
    'Explain Neural Architecture concepts',
    'What certificate should I pursue?',
  ];

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: msg },
      { role: 'assistant', content: 'That\'s a great question! Based on your current progress in the Neural Architecture track, I\'d recommend focusing on Module 5 before moving to applied projects. Would you like me to create a personalized study plan for the next two weeks?' },
    ]);
    setInput('');
  };

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
              <h1 className="font-headline font-bold text-on-surface text-sm">AI Learning Mentor</h1>
              <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-500 hover:text-primary hover:bg-surface-container rounded-full transition-all outline-none">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </nav>

      {/* Messages */}
      <div className="flex-1 pt-24 pb-40 px-4 sm:px-8 max-w-3xl mx-auto w-full overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white border border-outline-variant/10 shadow-sm text-on-surface rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-8 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-4 py-2.5 bg-white rounded-xl border border-outline-variant/20 text-sm text-on-surface-variant hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all outline-none"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 p-4 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button className="p-2 text-outline hover:text-primary rounded-full transition-colors outline-none">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input
            className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
            placeholder="Ask your AI mentor anything..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={() => handleSend()}
            className="p-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
