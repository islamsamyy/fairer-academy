'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?redirect=/checkout');
      } else {
        setUser(user);
      }
    });
  }, [router]);

  const handleCompletePayment = async () => {
    if (!user || cart.length === 0) return;

    setIsProcessing(true);
    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: subtotal,
          status: 'completed'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Enrollments
      const enrollments = cart.map(item => ({
        student_id: user.id,
        course_id: item.id
      }));

      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert(enrollments);

      if (enrollError) throw enrollError;

      // 3. Clear Cart & Success
      clearCart();
      router.push('/dashboard?checkout=success');
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-surface font-body text-on-background min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <Link href="/courses" className="text-primary font-bold underline">Go to Programs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">Checkout</h1>
          <p className="text-on-surface-variant mt-2">Complete your enrollment to unlock your courses</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Student Information
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Signed in as</p>
                  <p className="text-sm font-medium text-on-surface">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                Payment Simulation
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">Enter any card details to simulate a successful payment in development mode.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Card Number</label>
                  <input className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="4242 4242 4242 4242" type="text" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="MM/YY" type="text" />
                  <input className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="CVC" type="text" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-outline-variant/10 sticky top-24">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-outline-variant/10 last:border-0 text-left">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">school</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">{item.title}</p>
                      <p className="text-[10px] text-outline mt-0.5">{item.instructor}</p>
                    </div>
                    <p className="text-sm font-bold font-mono text-on-surface">${item.price}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t border-outline-variant/20">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-bold font-mono text-on-surface">${subtotal}</span>
                </div>
                <div className="border-t border-outline-variant/20 pt-4 flex justify-between">
                  <span className="font-bold text-on-surface text-lg">Total</span>
                  <span className="text-2xl font-headline font-bold text-on-surface">${subtotal}</span>
                </div>
              </div>

              <button 
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full mt-6 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none disabled:opacity-70"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Complete Enrollment
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center gap-2 justify-center text-xs text-outline">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Secure SSL Encrypted Connection</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
