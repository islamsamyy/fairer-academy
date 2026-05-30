'use client';

import React, { useState } from 'react';
import { motion , Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch role from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const role = profile?.role || 'student';

        // Redirect based on role
        if (role === 'instructor') {
          router.push('/dashboard/instructor');
        } else if (role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-background min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-fixed/30 via-surface to-surface"></div>
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
        className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-container/5 rounded-full blur-[100px]"
      />

      {/* Decorative Floating Shapes */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-12 w-24 h-24 bg-gradient-to-br from-tertiary-container/20 to-transparent rounded-full blur-2xl z-0"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 -left-12 w-32 h-32 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl z-0"
      />

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[480px] px-6 py-12">
        {/* Brand Header (Asymmetric Layout) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 pl-4"
        >
          <Link href="/" className="flex items-center gap-3 mb-4 inline-flex">
            <Image
              src="/logo.png"
              alt="Fairer Logo"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              Fairer
            </h1>
          </Link>
          <div className="space-y-1">
            <p className="text-4xl font-headline font-bold text-on-background tracking-tighter">
              {t('login.welcomeBack')}
            </p>
            <p className="text-on-surface-variant font-medium">
              {t('login.subtitle')}
            </p>
          </div>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-effect rounded-3xl p-8 shadow-[0_12px_40px_rgba(23,28,33,0.04)] ghost-border border-white/40"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-medium mb-4"
              >
                {error}
              </motion.div>
            )}

            {/* Email Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                className="block font-label text-sm font-semibold text-on-surface-variant pl-1 uppercase tracking-wider"
                htmlFor="email"
              >
                {t('login.emailLabel')}
              </label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low border-0 rounded-xl px-5 py-4 text-on-background placeholder:text-outline/50 focus:ring-2 focus:ring-primary-container/40 focus:bg-surface-container-lowest transition-all duration-300 outline-none hover:bg-surface-container/80"
                  id="email"
                  name="email"
                  placeholder={t('login.emailPlaceholder')}
                  type="email"
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="block font-label text-sm font-semibold text-on-surface-variant uppercase tracking-wider"
                  htmlFor="password"
                >
                  {t('login.passwordLabel')}
                </label>
                <a
                  className="text-xs font-mono font-bold text-secondary hover:text-secondary-container transition-colors uppercase tracking-widest"
                  href="#"
                >
                  {t('login.forgotPassword')}
                </a>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low border-0 rounded-xl px-5 py-4 text-on-background placeholder:text-outline/50 focus:ring-2 focus:ring-primary-container/40 focus:bg-surface-container-lowest transition-all duration-300 outline-none hover:bg-surface-container/80"
                  id="password"
                  name="password"
                  placeholder={t('login.passwordPlaceholder')}
                  type="password"
                  required
                />
              </div>
            </motion.div>

            {/* Sign In Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/20 neon-glow-primary transition-all duration-200 flex items-center justify-center gap-2 outline-none group disabled:opacity-70"
              type="submit"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
              {!loading && (
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-transparent text-outline font-mono uppercase tracking-[0.2em] backdrop-blur-sm">
                {t('login.orWith')}
              </span>
            </div>
          </motion.div>

          {/* Social Logins */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-surface-container-lowest ghost-border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-all duration-300 active:scale-95 outline-none hover:shadow-sm">
              <img
                alt="Google colorful logo icon"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1ka0KffEyV3sff7WY39PIr7WntUozAKwuS6sBA97MC9bQmRRjnxsac1thX4lyue3pTwchVPU08hz4wQnhvnQfIpAuoaqUe5rA3ATh0w-VJqfgrryMhXUYUNynJ5D9FBkvZG2ROKnLG_5LM9C4GN39OEVeqhGldws3cnOD4fAOJETXhclwwrxjI35YSa0Y3X27FonoxoDCrcksfPM5tZHOlr6sUzYcgjvoPo6Tk1dCfG19jLSKgH_gHxnB3lYOf26AJ9bl4RLHzX8"
              />
              <span className="text-sm font-semibold text-on-surface">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-surface-container-lowest ghost-border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-all duration-300 active:scale-95 outline-none hover:shadow-sm">
              <span
                className="material-symbols-outlined text-on-surface"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                terminal
              </span>
              <span className="text-sm font-semibold text-on-surface">GitHub</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Footer Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <p className="text-on-surface-variant font-medium">
            {t('login.newHere')}{' '}
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-primary font-bold hover:text-primary-container transition-all duration-200 group ml-1"
            >
              {t('login.joinAcademy')}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                east
              </span>
            </Link>
          </p>
        </motion.div>

        {/* System Status Decorative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 flex justify-center gap-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
              v4.0.2 Stable
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" style={{ animationDelay: '500ms' }}></div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
              Secure Node
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
