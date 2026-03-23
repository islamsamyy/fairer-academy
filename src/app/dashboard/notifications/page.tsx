'use client';

import React, { useState } from 'react';
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

const notifications = [
  { id: 1, type: 'course', icon: 'school', title: 'New module available', desc: 'Module 5 of "Neural Architecture Design" is now unlocked.', time: '2 min ago', read: false },
  { id: 2, type: 'achievement', icon: 'military_tech', title: 'Badge earned!', desc: 'You received the "Rapid Learner" badge for completing 5 modules this week.', time: '1 hour ago', read: false },
  { id: 3, type: 'system', icon: 'info', title: 'Maintenance scheduled', desc: 'Platform maintenance on March 25, 2026 from 2:00 AM to 4:00 AM UTC.', time: '3 hours ago', read: false },
  { id: 4, type: 'course', icon: 'comment', title: 'Instructor replied', desc: 'Dr. Julian Vane replied to your question in "Cybernetic Systems Security".', time: '5 hours ago', read: true },
  { id: 5, type: 'payment', icon: 'receipt_long', title: 'Payment confirmed', desc: 'Your enrollment in "Decentralized Logic Theory" has been confirmed. Receipt sent to your email.', time: '1 day ago', read: true },
  { id: 6, type: 'course', icon: 'event', title: 'Live session reminder', desc: 'Live Q&A with Prof. Aris Vo starts in 24 hours. Add it to your calendar.', time: '1 day ago', read: true },
  { id: 7, type: 'achievement', icon: 'emoji_events', title: 'Certificate ready', desc: 'Your certificate for "Visual Hierarchy Specialist" is ready to download.', time: '2 days ago', read: true },
  { id: 8, type: 'system', icon: 'campaign', title: 'New feature: AI Mentor', desc: 'Try our new AI-powered learning mentor in the Support Hub.', time: '3 days ago', read: true },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all', label: 'All', icon: 'inbox' },
    { id: 'unread', label: 'Unread', icon: 'mark_email_unread' },
    { id: 'course', label: 'Courses', icon: 'school' },
    { id: 'system', label: 'System', icon: 'settings' },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-8 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Notifications</h1>
            <p className="text-on-surface-variant mt-1">{notifications.filter((n) => !n.read).length} unread notifications</p>
          </div>
          <button className="text-sm font-bold text-primary hover:underline outline-none">Mark all as read</button>
        </motion.header>

        {/* Filters */}
        <div className="flex gap-2 mb-8 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all outline-none whitespace-nowrap ${
                filter === f.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((n) => (
            <motion.div
              key={n.id}
              variants={itemVariants}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${
                n.read
                  ? 'bg-white border-outline-variant/10 hover:bg-surface-container-low/50'
                  : 'bg-primary/[0.03] border-primary/10 hover:bg-primary/[0.06] shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.read ? 'bg-surface-container text-outline' : 'bg-primary/10 text-primary'
              }`}>
                <span className="material-symbols-outlined">{n.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${n.read ? 'text-on-surface-variant' : 'text-on-surface'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-outline mt-1 line-clamp-2">{n.desc}</p>
                <p className="text-[10px] text-outline font-mono mt-2">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
