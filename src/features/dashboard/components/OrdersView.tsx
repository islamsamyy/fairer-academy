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

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function OrdersView() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [freeEnrollments, setFreeEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: orderData } = await supabase
        .from('orders')
        .select(`*, courses:course_id (id, title, thumbnail_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);

      // Free enrollments don't create orders — show them too
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select(`*, courses:course_id (id, title, price, thumbnail_url)`)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      if (enrollData) {
        const paidCourseIds = new Set((orderData || []).map((o: any) => o.course_id));
        setFreeEnrollments(enrollData.filter((e: any) => !paidCourseIds.has(e.course_id) && (e.courses?.price === 0)));
      }

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold animate-pulse">Loading orders…</div>;
  }

  const hasAny = orders.length > 0 || freeEnrollments.length > 0;

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Order History</h1>
          <p className="text-on-surface-variant mt-2">Track your course enrollments and payment receipts</p>
        </motion.header>

        {!hasAny ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">receipt_long</span>
            <p className="text-on-surface-variant mb-4">No orders yet.</p>
            <Link href="/courses" className="text-primary font-bold hover:underline">Browse courses →</Link>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {orders.map((order) => (
              <motion.div key={order.id} variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">receipt</span>
                    </div>
                    <div>
                      <p className="font-bold font-mono text-on-surface text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-outline">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                      {order.status}
                    </span>
                    <span className="text-xl font-headline font-bold text-on-surface">${Number(order.amount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`/courses/${order.courses?.id}`} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm text-outline">school</span>
                    <span>{order.courses?.title || 'Course'}</span>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-outline mt-2">
                    <span className="material-symbols-outlined text-sm">paid</span>
                    <span>{order.currency || 'USD'} · {order.status === 'completed' ? 'Paid' : order.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {freeEnrollments.map((e) => (
              <motion.div key={e.id} variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-600">redeem</span>
                    </div>
                    <div>
                      <p className="font-bold font-mono text-on-surface text-sm">FREE ENROLLMENT</p>
                      <p className="text-xs text-outline">{new Date(e.enrolled_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Free</span>
                </div>
                <Link href={`/courses/${e.courses?.id}`} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm text-outline">school</span>
                  <span>{e.courses?.title || 'Course'}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
