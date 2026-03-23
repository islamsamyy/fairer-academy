'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const certs = [
  { id: 1, title: 'Neural Architecture Design', instructor: 'Dr. Julian Vane', date: 'Mar 15, 2026', grade: 'A+', credentialId: 'FAIR-NAD-2026-0042', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cwUxhpbUTCHKzLUd9Wvw9Rcz4SrP8uF5i9okP9KOy5z4BQGqQcXutFTTN3QI74bdUt-cGXvfBu0YaieHp8PdxKU2vmheYd8KNhLJYCx8uS20a6o80afpMqpClg3n1xhIrErPBORiKG3HefpGaiO_gTszEDMPJwDnnWtRWhBSKipDx-Oby8QfNFNstqFwvjGwPVnU3DLLMlko-xJDG8ChQS8psE0ep5p-mPjdKZIpLZLzBG6w1139pd69l-DL2qMR5CiQknZxCSM' },
  { id: 2, title: 'Minimalist UI Logics', instructor: 'Prof. Aris Vo', date: 'Dec 20, 2025', grade: 'A', credentialId: 'FAIR-MUL-2025-0194', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm44B-0WzJZyUj79TOlQnuAODozlbWVzLEtaxMTBjK73VEoSNvlmcywLiC292jTYYoymoTySqVEJmIQnZdX20P_fVK9oBaDqge2Cn6X0Z2uiHQBQi0hKhUAoRJ1sYIC4IO5PkyHyBd0kyxUVHef6uuilnrXDA_h_ul8pXhS26DTPqvkDhllEkYaN9RN8v3RyiwALRE6TEs5U5s_4AY3tyJ5NTVZAYx9MNKYgahFJraHjNoY4yWWwRnG0TqVgfkoVb4M4uk2e3gcsk' },
];

export default function CertificatesPage() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">My Certificates</h1>
          <p className="text-on-surface-variant mt-2">Your verified credentials and achievements</p>
        </motion.header>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <motion.div key={cert.id} variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-lg transition-shadow group">
              <div className="relative h-40 overflow-hidden">
                <img alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={cert.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full">{cert.grade}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline font-bold text-on-surface text-lg mb-1">{cert.title}</h3>
                <p className="text-xs text-outline mb-4">By {cert.instructor} • {cert.date}</p>
                <div className="flex items-center gap-2 text-xs text-outline font-mono mb-4 bg-surface-container-low px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-sm text-primary">verified</span>
                  {cert.credentialId}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl text-sm font-bold active:scale-95 transition-all outline-none">
                    <span className="material-symbols-outlined text-[16px]">download</span>PDF
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-outline-variant/20 text-on-surface-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-colors outline-none">
                    <span className="material-symbols-outlined text-[16px]">share</span>Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
