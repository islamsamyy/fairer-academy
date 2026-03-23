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

const courses = [
  { title: 'Architecting Sentience: AI Core', students: 8421, rating: 4.9, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cwUxhpbUTCHKzLUd9Wvw9Rcz4SrP8uF5i9okP9KOy5z4BQGqQcXutFTTN3QI74bdUt-cGXvfBu0YaieHp8PdxKU2vmheYd8KNhLJYCx8uS20a6o80afpMqpClg3n1xhIrErPBORiKG3HefpGaiO_gTszEDMPJwDnnWtRWhBSKipDx-Oby8QfNFNstqFwvjGwPVnU3DLLMlko-xJDG8ChQS8psE0ep5p-mPjdKZIpLZLzBG6w1139pd69l-DL2qMR5CiQknZxCSM' },
  { title: 'Neural Aesthetic Workshop', students: 4200, rating: 4.8, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm44B-0WzJZyUj79TOlQnuAODozlbWVzLEtaxMTBjK73VEoSNvlmcywLiC292jTYYoymoTySqVEJmIQnZdX20P_fVK9oBaDqge2Cn6X0Z2uiHQBQi0hKhUAoRJ1sYIC4IO5PkyHyBd0kyxUVHef6uuilnrXDA_h_ul8pXhS26DTPqvkDhllEkYaN9RN8v3RyiwALRE6TEs5U5s_4AY3tyJ5NTVZAYx9MNKYgahFJraHjNoY4yWWwRnG0TqVgfkoVb4M4uk2e3gcsk' },
  { title: 'Haptic Interface Masterclass', students: 3100, rating: 4.7, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cwUxhpbUTCHKzLUd9Wvw9Rcz4SrP8uF5i9okP9KOy5z4BQGqQcXutFTTN3QI74bdUt-cGXvfBu0YaieHp8PdxKU2vmheYd8KNhLJYCx8uS20a6o80afpMqpClg3n1xhIrErPBORiKG3HefpGaiO_gTszEDMPJwDnnWtRWhBSKipDx-Oby8QfNFNstqFwvjGwPVnU3DLLMlko-xJDG8ChQS8psE0ep5p-mPjdKZIpLZLzBG6w1139pd69l-DL2qMR5CiQknZxCSM' },
];

export default function InstructorProfilePage() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-0 pb-24">
        {/* Profile Header */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-gradient-to-br from-primary/10 via-surface to-secondary/5 py-16 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8">
            <img alt="Dr. Julian Vane" className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJg-K5jIgJ7mG_N3jT1kwDBPjfyu7dNuGE_HIA6ZbdhDrh_bgf5lDI_bYEfYwgXQPtXkxXLFFHOEXMdqVXFg09o0CWWcDXJvts1EOR0HeZWILvTJiqL_qsqqcCzJbnimn3gj6_TqPPATN7-e4IctzX9CskXF-YA2PiYi-N2MLToQF-B9g_tBEd_dmEMOKCIeqVe4fiNmNV1XtwAHrFh4XPjR5r9N1sijsfGBpXodKYSWPKpYMzsWIomRvoQ5gjGTafeB0Ksyk40Is" />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-background">Dr. Julian Vane</h1>
              <p className="text-primary font-bold mt-1">Design Scientist & Neural Aesthetics Pioneer</p>
              <p className="text-on-surface-variant text-sm mt-3 max-w-lg">Bridging the gap between computational intelligence and human creativity for over 12 years. Published researcher, keynote speaker, and creator of the Luminous Logic framework.</p>
              <div className="flex flex-wrap gap-6 mt-6 justify-center sm:justify-start">
                {[
                  { value: '4.9', label: 'Rating' },
                  { value: '34,200', label: 'Students' },
                  { value: '14', label: 'Courses' },
                  { value: '1,247', label: 'Reviews' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold font-headline text-on-surface">{s.value}</p>
                    <p className="text-[10px] text-outline uppercase tracking-widest font-mono">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-10">
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Courses by Dr. Vane</h2>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <motion.div key={c.title} variants={itemVariants}>
                <Link href="/courses/1" className="bg-white rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-lg transition-shadow block group">
                  <div className="h-36 overflow-hidden">
                    <img alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={c.image} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-headline font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{c.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold font-mono">{c.rating}</span>
                      </div>
                      <span className="text-xs text-outline">{c.students.toLocaleString()} students</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
