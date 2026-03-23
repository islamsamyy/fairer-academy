'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ScholarshipsPage() {
  return (
    <div className="bg-surface min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-outline-variant/10 shadow-xl shadow-primary/5 text-center"
      >
        <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
        </div>
        <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface mb-4">Scholarships & Grants</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
          Empowering the next generation of AI pioneers. Our scholarship programs for 2026-2027 are undergoing review. Join our community to be the first to apply.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 font-bold">
            <span className="material-symbols-outlined">event</span>
            Opening Fall 2026
          </div>
          <button className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
            Notify Me
          </button>
        </div>
      </motion.div>
    </div>
  );
}
