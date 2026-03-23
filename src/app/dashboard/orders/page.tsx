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

const orders = [
  { id: 'ORD-2026-0042', date: 'Mar 18, 2026', courses: ['Architecting Sentience: AI Core'], total: 899, status: 'completed', paymentMethod: 'Visa •••• 4242' },
  { id: 'ORD-2026-0038', date: 'Mar 10, 2026', courses: ['Decentralized Logic Theory', 'Cybernetic Systems Security'], total: 1890, status: 'completed', paymentMethod: 'Visa •••• 4242' },
  { id: 'ORD-2026-0021', date: 'Feb 22, 2026', courses: ['Global Connectivity Governance'], total: 420, status: 'refunded', paymentMethod: 'PayPal' },
  { id: 'ORD-2025-0194', date: 'Dec 15, 2025', courses: ['Minimalist UI Logics'], total: 350, status: 'completed', paymentMethod: 'Stripe •••• 1881' },
];

export default function OrdersPage() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen">

      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Order History</h1>
          <p className="text-on-surface-variant mt-2">Track your course enrollments and payment receipts</p>
        </motion.header>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {orders.map((order) => (
            <motion.div key={order.id} variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">receipt</span>
                  </div>
                  <div>
                    <p className="font-bold font-mono text-on-surface text-sm">{order.id}</p>
                    <p className="text-xs text-outline">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                    order.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-xl font-headline font-bold text-on-surface">${order.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="pl-13 space-y-2">
                {order.courses.map((course, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-outline">school</span>
                    <span>{course}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-outline mt-2">
                  <span className="material-symbols-outlined text-sm">credit_card</span>
                  <span>{order.paymentMethod}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant/10">
                <button className="text-xs font-bold text-primary hover:underline outline-none flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download Invoice
                </button>
                {order.status === 'completed' && (
                  <button className="text-xs font-bold text-on-surface-variant hover:text-on-surface outline-none flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">help</span>
                    Get Help
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
