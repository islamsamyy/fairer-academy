'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { t } = useLanguage();
  const { cart, removeFromCart, subtotal } = useCart();
  const savings = cart.length * 50; // Simple mock savings logic for now

  if (cart.length === 0) {
    return (
      <div className="bg-surface font-body text-on-background min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-outline">shopping_basket</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{t('cart.empty')}</h1>
          <p className="text-on-surface-variant max-w-sm mx-auto">Explore our world-class courses and start your journey from learning to earning.</p>
          <Link href="/courses" className="inline-block px-10 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
            {t('cart.exploreCourses')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-6xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">{t('cart.title')}</h1>
          <p className="text-on-surface-variant mt-2">{cart.length} {cart.length === 1 ? t('cart.course') : t('cart.courses')} in your knowledge basket</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div key={item.id} variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/10 flex flex-col sm:flex-row gap-4 sm:gap-6 group hover:shadow-md transition-shadow">
                <div className="w-full sm:w-40 h-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.image_url} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">Academy Program</span>
                    <h3 className="font-headline font-bold text-on-surface text-lg mt-1">{item.title}</h3>
                    <p className="text-xs text-outline mt-1">By {item.instructor}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-destructive font-bold hover:underline outline-none"
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-headline font-bold text-on-surface">${item.price}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-outline-variant/10 sticky top-24">
              <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{t('cart.subtotal')}</span>
                  <span className="font-bold font-mono text-on-surface">${subtotal}</span>
                </div>
                <div className="border-t border-outline-variant/20 pt-4 flex justify-between">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="text-2xl font-headline font-bold text-on-surface">${subtotal}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold text-center shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all">
                {t('cart.checkout')}
              </Link>

              <div className="mt-6 flex items-center gap-2 justify-center text-xs text-outline">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
