'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data);
      }
      setLoading(false);
    }

    fetchNotifications();
  }, [router]);

  const filters = [
    { id: 'all', label: 'All', icon: 'inbox' },
    { id: 'unread', label: 'Unread', icon: 'mark_email_unread' },
    { id: 'info', label: 'Info', icon: 'info' },
    { id: 'course', label: 'Courses', icon: 'school' },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">Loading notifications...</div>;
  }

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-8 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Notifications</h1>
            <p className="text-on-surface-variant mt-1">{notifications.filter((n) => !n.is_read).length} unread notifications</p>
          </div>
          <button
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
              }
            }}
            className="text-sm font-bold text-primary hover:underline outline-none"
          >
            Mark all as read
          </button>
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
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">notifications_none</span>
              <p className="text-on-surface-variant font-medium">No notifications yet</p>
            </div>
          ) : (
            filtered.map((n) => (
            <motion.div
              key={n.id}
              variants={itemVariants}
              onClick={async () => {
                await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
                setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
                if (n.link) router.push(n.link);
              }}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${
                n.is_read
                  ? 'bg-white border-outline-variant/10 hover:bg-surface-container-low/50'
                  : 'bg-primary/[0.03] border-primary/10 hover:bg-primary/[0.06] shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[20px] ${
                n.is_read ? 'bg-surface-container text-outline' : 'bg-primary/10 text-primary'
              }`}>
                <span className="material-symbols-outlined">{n.type === 'info' ? 'notifications' : n.type === 'course' ? 'school' : 'mail'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${n.is_read ? 'text-on-surface-variant' : 'text-on-surface'}`}>{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-outline mt-1 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-outline font-mono mt-2">
                  {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  );
}
