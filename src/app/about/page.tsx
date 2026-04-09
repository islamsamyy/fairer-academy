'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="bg-surface min-h-[calc(100vh-64px)] py-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">Our Vision</span>
          <h1 className="text-4xl sm:text-5xl font-headline font-black tracking-tight text-on-surface mb-6">
            Pioneering Luminous Logic at <span className="text-primary">Faireer Academy</span>
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed max-w-2xl mx-auto">
            We are more than just an educational platform. We are an ecosystem designed to bridge the gap between human potential and artificial intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-lg shadow-primary/5"
          >
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">Our Mission</h2>
            <p className="text-on-surface-variant leading-relaxed">
              To democratize access to high-level AI education and provide the tools for every individual to thrive in the new era of cognitive computing.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-lg shadow-primary/5"
          >
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">The Academy</h2>
            <p className="text-on-surface-variant leading-relaxed">
              With over 50,000+ students globally, Faireer Academy is the leading institution for Neutral Architecture, Prompt Engineering, and AI Ethics.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 p-12 rounded-[40px] border border-primary/10 text-center"
        >
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-6">Ready to join the future?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">Explore Programs</button>
            <button className="px-8 py-4 bg-white border border-outline-variant text-on-surface rounded-2xl font-bold hover:bg-surface-container transition-all">Contact Us</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
