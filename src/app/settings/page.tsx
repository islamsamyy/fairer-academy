'use client';

import React, { useState } from 'react';
import { motion , Variants } from 'framer-motion';
import Link from 'next/link';
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

export default function SettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  return (
    <div className="bg-surface font-body text-on-background antialiased min-h-screen">
      {/* SideNavBar Shell */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#f7f9ff] dark:bg-slate-950 font-['Inter'] text-sm py-8 px-4 z-40">
        <div className="mb-10 px-2">
          <Link href="/" className="flex items-center gap-3">
            <img
              alt="Fairer Logo"
              className="h-10 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/ADBb0ui2HQlH4wehKDIFaKTzAAckSSlEp01ZDpqHBp-Yp3Xye2uSD5tyyoDtonRUNNrmktf17V6fxm089lUSM3btWWjMN8bKck3QfY8__gPG3swJlkvPSQEtEp6RbYKD4vLTGiZgAzYe3S9tDSNnVFN_JK1jOCv3NCscNRt1YMj5y4rFn-RKfw1XFcA9rSaBS4OJw6NFTLiFD7WPj2PgNr1mkIdjmPLAzA0t1sGxB4LXmNEKL15HOLWPpHzzkBoINpSkbdMeRKKNDepbwA"
            />
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Fairer
            </span>
          </Link>
        </div>
        
        <div className="mt-auto pt-6 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest shrink-0">
            <img
              alt="User Profile Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuClXGJ9QHSp0gUgZqhFJzVf6lgpWLH39o2USiF5qydl0AfcnsdM1shiMPYIQ9rGX5GlYox9dBDStePa_qkB5FJK8KgHHAjQ9V-QTL6r1R8aBq-tES_O9U5Mbk3LYrorY-4ViCaIfeWi-JNZLi_3rQW3pEz60J4QbJRJbme0XgbAAXBVTG6Wo0DRUCgrhzD-vhdxHjCnbWrTOKRP8UQOyASnake2aubBNGedtKjB65UqbbvTht_0pvBOslL1X9BRMPSLdFdWruskLvI"
            />
          </div>
          <div>
            <p className="font-bold text-on-background leading-none">Alex Rivera</p>
            <p className="text-xs text-outline mt-1">Premium Member</p>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 min-h-screen pb-32">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-6 md:px-12 border-b border-surface-container-highest/20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-3xl font-headline font-bold tracking-tight text-on-background"
            >
              {t('settings.title')}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-4"
            >
              <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline" data-icon="notifications">
                  notifications
                </span>
              </button>
              <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline" data-icon="account_circle">
                  account_circle
                </span>
              </button>
            </motion.div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-10 md:px-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8"
          >
            {/* 1. Profile Section */}
            <motion.section
              variants={itemVariants}
              className="bg-surface-container-lowest rounded-xl p-8 ghost-border shadow-[0_12px_24px_rgba(23,28,33,0.03)]"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" data-icon="person">
                    person
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold">Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-3">
                  <div className="relative group cursor-pointer w-32 h-32 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-lg border-2 border-transparent hover:border-primary/30 transition-all duration-300">
                    <img
                      alt="User profile avatar close up"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWinLjXu0jbi1B-kJc2tpedjvt9Jee10pkBPX1IMwXEMElS_SQb8bE7x1PLbWsU7n-spFcZ7uv-7VoQJrXumgYs1_wsa1V6bkc7EywyEkdWxD_KspdCYA8XvvaRrRumI8Y6t8nIwNj77UP5mvP0sKrX2LtUuBW0i7xD-VzezrpwFs2ICX17uur02eNePsRhl-SmtJVbL8tdJwQyvs9Va7Ic1tQ0zKjeUP8BEKxyNjoQjgOLEVPqz_Se_DgYwPoN0i-qXL64Mx3DuA"
                    />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity duration-300">
                      <span className="material-symbols-outlined text-white" data-icon="photo_camera">
                        photo_camera
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest text-outline mt-4 text-center md:text-left">
                    Click to upload
                  </p>
                </div>
                <div className="md:col-span-9 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface hover:bg-surface-container outline-none"
                        type="text"
                        defaultValue="Alex Rivera"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface hover:bg-surface-container outline-none"
                        type="email"
                        defaultValue="alex.rivera@ethereal.edu"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">
                      Bio
                    </label>
                    <textarea
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface hover:bg-surface-container resize-y outline-none"
                      rows={3}
                      defaultValue="Architecting digital futures at Ethereal Academy. Passionate about luminous logic and user-centric flows."
                    ></textarea>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 2. Security Section */}
            <motion.section
              variants={itemVariants}
              className="bg-surface-container-lowest rounded-xl p-8 ghost-border shadow-[0_12px_24px_rgba(23,28,33,0.03)]"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary" data-icon="lock">
                    lock
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold">Security</h3>
              </div>
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-transparent hover:border-surface-container-highest transition-colors">
                  <div>
                    <h4 className="font-bold text-on-surface">Password</h4>
                    <p className="text-sm text-outline mt-1">Last changed 4 months ago</p>
                  </div>
                  <button className="px-6 py-2 rounded-lg bg-white border border-outline-variant text-sm font-bold hover:bg-surface-container hover:shadow-sm transition-all active:scale-95 duration-200">
                    Change Password
                  </button>
                </div>
                <div className="flex items-center justify-between px-4">
                  <div>
                    <h4 className="font-bold text-on-surface">Two-Factor Authentication</h4>
                    <p className="text-sm text-outline mt-1 max-w-sm">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </motion.section>

            {/* 3. Notifications Section */}
            <motion.section
              variants={itemVariants}
              className="bg-surface-container-lowest rounded-xl p-8 ghost-border shadow-[0_12px_24px_rgba(23,28,33,0.03)]"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary" data-icon="notifications_active">
                    notifications_active
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold">Notifications</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2 border-b border-surface-container-high/30">
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Email Alerts</h4>
                    <p className="text-xs text-outline mt-0.5">Receive weekly course progress summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailAlertsEnabled}
                      onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Push Notifications</h4>
                    <p className="text-xs text-outline mt-0.5">Get instant updates on course mentions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={pushNotificationsEnabled}
                      onChange={(e) => setPushNotificationsEnabled(e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </motion.section>

            {/* 4. Preferences Section */}
            <motion.section
              variants={itemVariants}
              className="bg-surface-container-lowest rounded-xl p-8 ghost-border shadow-[0_12px_24px_rgba(23,28,33,0.03)]"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-outline" data-icon="tune">
                    tune
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold">Preferences</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">
                    Language
                  </label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none outline-none hover:bg-surface-container cursor-pointer">
                      <option>English (US)</option>
                      <option>Spanish (LatAm)</option>
                      <option>French (FR)</option>
                      <option>Japanese (JP)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface">
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">
                    Interface Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary/10 border-2 border-primary text-primary text-sm font-bold transition-transform active:scale-95 duration-200">
                      <span className="material-symbols-outlined text-sm" data-icon="light_mode">
                        light_mode
                      </span>
                      Light
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-surface-container-low text-outline border-2 border-transparent text-sm font-bold hover:bg-surface-container-high transition-transform active:scale-95 duration-200 hover:text-on-surface">
                      <span className="material-symbols-outlined text-sm" data-icon="dark_mode">
                        dark_mode
                      </span>
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Footer Action */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-surface-container-highest"
            >
              <div className="flex items-center gap-2 text-error text-sm font-medium">
                <span className="material-symbols-outlined text-base" data-icon="delete_forever">
                  delete_forever
                </span>
                <button className="hover:underline transition-colors focus:outline-none">
                  Delete account and data
                </button>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-8 py-4 rounded-xl font-headline font-bold text-outline hover:bg-surface-container hover:text-on-surface transition-all active:scale-95 duration-200 outline-none">
                  Cancel
                </button>
                <button className="flex-1 md:flex-none px-12 py-4 rounded-xl font-headline font-bold bg-gradient-to-br from-primary to-primary-container text-white shadow-lg neon-glow active:scale-95 duration-200 hover:shadow-primary/30 outline-none transform transition-transform filter hover:brightness-110">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-50 rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.03)] border-t border-surface-container-highest/20">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-2 hover:text-cyan-500 transition-transform active:scale-90 duration-150"
        >
          <span className="material-symbols-outlined" data-icon="home">
            home
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest mt-1">
            Home
          </span>
        </Link>
        <Link
          href="/courses"
          className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-2 hover:text-cyan-500 transition-transform active:scale-90 duration-150"
        >
          <span className="material-symbols-outlined" data-icon="menu_book">
            menu_book
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest mt-1">
            Learn
          </span>
        </Link>
        <Link
          href="/settings"
          className="flex flex-col items-center justify-center bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 rounded-2xl px-4 py-2 transition-transform active:scale-90 duration-150"
        >
          <span className="material-symbols-outlined" data-icon="settings">
            settings
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest mt-1">
            Settings
          </span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-2 hover:text-cyan-500 transition-transform active:scale-90 duration-150"
        >
          <span className="material-symbols-outlined" data-icon="person">
            person
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest mt-1">
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
