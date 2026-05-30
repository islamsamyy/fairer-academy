'use client';

import React, { useState } from 'react';
import { motion , Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // Futuristic cubic-bezier
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const nationalId = formData.get('nationalId') as string;

    // Validate National ID format (10 digits, starts with 1 or 2)
    const idRegex = /^[12][0-9]{9}$/;
    if (!idRegex.test(nationalId)) {
      setError(t('signup.nationalIdError'));
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up the user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            national_id: nationalId,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Redirect based on role (profile is created automatically via secure DB trigger)
        if (role === 'instructor') {
          router.push('/dashboard/instructor');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-secondary-fixed via-surface to-surface-bright min-h-screen flex items-center justify-center p-6 font-body text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed overflow-hidden relative">
      <main className="w-full max-w-[480px] relative z-10">
        {/* Floating Accent Elements for Luminous Logic */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -z-10"
        />

        {/* Signup Card */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-effect rounded-xl shadow-[0_12px_40px_rgba(23,28,33,0.06)] overflow-hidden bg-white/75 backdrop-blur-[16px]"
        >
          <div className="p-8 md:p-12">
            {/* Brand Header */}
            <motion.header variants={itemVariants} className="mb-10 text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <Link href="/" className="h-12 flex items-center justify-center cursor-pointer outline-none">
                    <Image
                      src="/logo.png"
                      alt="Fairer Logo"
                      width={48}
                      height={48}
                      className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
                    />
                </Link>
              </div>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-on-background mb-2">
                Fairer
              </h1>
              <p className="text-on-surface-variant font-body">Empowering your journey with equity</p>
            </motion.header>

            <form className="space-y-6" onSubmit={handleSignup}>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-medium mb-4"
                >
                  {error}
                </motion.div>
              )}

              {/* Role Selection */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    role === 'student'
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                  }`}
                >
                  I'm a Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    role === 'instructor'
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                  }`}
                >
                  I'm an Instructor
                </button>
              </motion.div>

              {/* Full Name Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="fullName">
                  {t('signup.fullNameLabel')}
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none text-on-surface hover:bg-surface-container/80"
                    id="fullName"
                    name="fullName"
                    placeholder={t('signup.fullNamePlaceholder')}
                    type="text"
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none"
                    data-icon="person"
                  >
                    person
                  </span>
                </div>
              </motion.div>

              {/* National ID Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="nationalId">
                  {t('signup.nationalIdLabel')}
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none text-on-surface hover:bg-surface-container/80"
                    id="nationalId"
                    name="nationalId"
                    placeholder={t('signup.nationalIdPlaceholder')}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[12][0-9]{9}"
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none"
                    data-icon="id_card"
                  >
                    id_card
                  </span>
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">
                  {t('signup.emailLabel')}
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none text-on-surface hover:bg-surface-container/80"
                    id="email"
                    name="email"
                    placeholder="alex@ethereal.edu"
                    type="email"
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none"
                    data-icon="mail"
                  >
                    mail
                  </span>
                </div>
              </motion.div>

              {/* Password Input + Strength */}
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="password">
                  {t('signup.passwordLabel')}
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all duration-300 outline-none text-on-surface hover:bg-surface-container/80"
                    id="password"
                    name="password"
                    placeholder="••••••••••••"
                    type="password"
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none"
                    data-icon="lock"
                  >
                    lock
                  </span>
                </div>
                {/* Strength Indicator */}
                <div className="px-1 flex flex-col gap-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    <div className="flex-1 bg-primary rounded-full"></div>
                    <div className="flex-1 bg-primary rounded-full"></div>
                    <div className="flex-1 bg-primary rounded-full"></div>
                    <div className="flex-1 bg-surface-container-highest rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                      Strong Security
                    </span>
                    <span className="text-[10px] text-outline-variant font-medium">Min 12 chars</span>
                  </div>
                </div>
              </motion.div>

              {/* Terms Checkbox */}
              <motion.div variants={itemVariants} className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-6 shrink-0">
                  <input
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low transition-colors cursor-pointer"
                    id="terms"
                    type="checkbox"
                  />
                </div>
                <label className="text-sm text-on-surface-variant leading-relaxed" htmlFor="terms">
                  I agree to the{' '}
                  <Link href="#" className="text-primary font-semibold hover:underline outline-none">
                    Terms of Mastery
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-primary font-semibold hover:underline outline-none">
                    Privacy Protocol
                  </Link>
                  .
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full h-14 mt-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group neon-glow outline-none hover:shadow-[0_8px_24px_rgba(0,104,123,0.3)] filter hover:brightness-110 disabled:opacity-70"
                type="submit"
              >
                {loading ? t('signup.creating') : t('signup.createAccount')}
                {!loading && (
                  <span
                    className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1"
                    data-icon="arrow_forward"
                  >
                    arrow_forward
                  </span>
                )}
              </motion.button>
            </form>

            {/* Footer Link */}
            <motion.footer variants={itemVariants} className="mt-8 text-center">
              <p className="text-on-surface-variant text-sm">
                {t('signup.alreadyHave')}{' '}
                <Link
                  href="/login"
                  className="text-secondary font-bold font-mono uppercase tracking-tight hover:text-secondary-container transition-colors ml-1 outline-none"
                >
                  {t('signup.signIn')}
                </Link>
              </p>
            </motion.footer>
          </div>

          {/* Bottom Accent Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-tertiary-container opacity-40"></div>
        </motion.section>

        {/* Technical Metadata Decoration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-between items-center px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-outline-variant"
        >
          <span>System: Stable</span>
          <span>Version 2.4.0-E</span>
          <span>Encypted Session</span>
        </motion.div>
      </main>

      {/* Visual Anchor Decorations */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="fixed top-10 left-10 hidden lg:block z-0 pointer-events-none"
      >
        <div className="flex flex-col gap-4">
          <div className="w-1 h-20 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-8 bg-secondary/30 rounded-full"></div>
          <div className="w-1 h-4 bg-tertiary-container/30 rounded-full"></div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="fixed bottom-10 right-10 hidden lg:block rotate-180 z-0 pointer-events-none"
      >
        <div className="flex flex-col gap-4">
          <div className="w-1 h-20 bg-primary/30 rounded-full"></div>
          <div className="w-1 h-8 bg-secondary/30 rounded-full"></div>
          <div className="w-1 h-4 bg-tertiary-container/30 rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
}
