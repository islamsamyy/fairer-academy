'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const threads = [
  { id: 1, title: 'Best resources for learning neural architecture from scratch?', author: 'Sarah J.', replies: 24, votes: 89, tags: ['Neural Design'], time: '4h ago', pinned: true },
  { id: 2, title: 'How to approach the Capstone Project in Module 3?', author: 'Marcus T.', replies: 18, votes: 56, tags: ['Projects'], time: '8h ago', pinned: false },
  { id: 3, title: 'Study group for Quantum Finance — anyone interested?', author: 'Aris V.', replies: 42, votes: 121, tags: ['Study Group'], time: '1d ago', pinned: false },
  { id: 4, title: 'My experience completing the Transcendent Path — AMA', author: 'Julian V.', replies: 67, votes: 203, tags: ['Discussion'], time: '2d ago', pinned: false },
  { id: 5, title: 'Tips for maintaining a consistent learning streak?', author: 'Lina G.', replies: 31, votes: 78, tags: ['Motivation'], time: '3d ago', pinned: false },
];

export default function CommunityPage() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Community Forum</h1>
            <p className="text-on-surface-variant mt-2">Connect and grow with fellow learners</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none">
            <span className="material-symbols-outlined text-[18px]">add</span>New Thread
          </button>
        </motion.header>

        <div className="flex items-center bg-white rounded-xl border border-outline-variant/10 px-4 py-3 mb-8">
          <span className="material-symbols-outlined text-outline mr-3">search</span>
          <input className="bg-transparent border-none text-sm w-full outline-none placeholder:text-outline" placeholder="Search threads..." type="text" />
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {threads.map((t) => (
            <motion.div key={t.id} variants={itemVariants} className="bg-white rounded-2xl p-5 border border-outline-variant/10 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex gap-4">
                <div className="hidden sm:flex flex-col items-center min-w-[50px] text-center">
                  <button className="text-outline hover:text-primary outline-none"><span className="material-symbols-outlined">arrow_drop_up</span></button>
                  <span className="text-sm font-bold font-mono text-on-surface">{t.votes}</span>
                  <button className="text-outline hover:text-primary outline-none"><span className="material-symbols-outlined">arrow_drop_down</span></button>
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    {t.pinned && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>}
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{t.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {t.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-outline">
                    <span className="font-medium">{t.author}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">chat_bubble</span>{t.replies}</span>
                    <span>{t.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
