'use client';

import { motion , Variants } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Profile() {
  const { t } = useLanguage();
  return (
    <div className="bg-surface font-body text-on-background min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}

      <div className="flex pt-20 min-h-screen max-w-screen-2xl mx-auto">
        {/* SideNavBar */}
        <aside className="hidden lg:flex h-[calc(100vh-80px)] w-72 flex-col sticky top-20 left-0 bg-slate-50 px-6 py-8 gap-y-2">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-container">
              <img alt="Student avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP7PsWzCVsERIRB3_d2KgIcCBopVJ5BjHW8dsHnrdW5HTSXC9NmCETbsu-7I5uZK6LeiqvUCjj-0gsA08mKIyX0Kvcpc7qNtiRibBolyfaPjy5rD_puxOP8lJX_DzMM1g1d6kiv30WXCClcnOAnqN-qds2ew6yfIzIG5SOYlGY6h_bjTXl2mhOGAGHausnL8cclT5Etpv0DMYeX6juNrF_RLoNVeBdfL7n3LN37Cdl5oeXAnYsgTN67kmpPskpSlz44ndpHpb3zCU"/>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface">Alex Rivers</h3>
              <p className="text-xs font-mono uppercase tracking-wider text-primary">Elite Scholar</p>
            </div>
          </div>
          <nav className="flex flex-col gap-y-1">
            <a className="flex items-center gap-3 p-3 font-body text-sm font-medium bg-white text-cyan-600 shadow-sm rounded-xl translate-x-1 active:scale-95 transition-transform" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              My Profile
            </a>
            <a className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">auto_stories</span>
              Learning Path
            </a>
            <a className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">military_tech</span>
              Achievements
            </a>
            <a className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">payments</span>
              Billing
            </a>
            <a className="flex items-center gap-3 p-3 font-body text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">shield</span>
              Security
            </a>
          </nav>
          <div className="mt-auto mb-10">
            <button className="w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-bold text-sm hover:shadow-[0_0_15px_rgba(0,217,255,0.15)] transition-all active:scale-95">
              Upgrade to Pro
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 space-y-12 pb-24 lg:pb-10">
          {/* User Header Stats Hero */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-2xl bg-surface-container-low p-8 flex flex-col md:flex-row justify-between items-end md:items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="z-10 space-y-2">
              <h1 className="text-4xl font-headline font-bold tracking-tighter text-on-surface">{t('profile.title') || 'Student Profile'}</h1>
              <p className="text-outline max-w-md">Welcome back, Alex. Your journey through the Quantum Computing track is currently at 74% completion.</p>
            </div>
            <div className="flex gap-8 z-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-start">
              <div className="text-center">
                <p className="text-3xl font-headline font-bold text-on-surface">12</p>
                <p className="text-xs font-mono uppercase text-outline">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-headline font-bold text-on-surface">148</p>
                <p className="text-xs font-mono uppercase text-outline">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-headline font-bold text-on-surface">24</p>
                <p className="text-xs font-mono uppercase text-outline">Badges</p>
              </div>
            </div>
          </motion.section>

          {/* Content Tabs */}
          <section className="space-y-8">
            <div className="flex gap-x-8 border-b border-outline-variant/30">
              <button className="pb-4 text-cyan-600 border-b-2 border-cyan-500 font-headline font-bold tracking-tight">Learning Path</button>
              <button className="pb-4 text-slate-500 hover:text-cyan-500 transition-colors font-headline font-bold tracking-tight">Achievements</button>
            </div>

            {/* Learning Path Grid */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Card 1 */}
              <motion.div variants={fadeUpVariant} className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_24px_rgba(23,28,33,0.06)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">model_training</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-secondary-container/10 text-secondary font-mono text-[10px] uppercase tracking-widest rounded-full font-bold">In Progress</span>
                    <span className="text-xs text-outline font-mono">Module 4 of 8</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Neural Architecture Design</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                      <span>Progress</span>
                      <span>45%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-primary rounded-full"></motion.div>
                    </div>
                  </div>
                  <button className="pt-2 text-primary font-mono text-sm font-bold flex items-center gap-2 group">
                    CONTINUE LESSON
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </motion.div>

              {/* Progress Card 2 */}
              <motion.div variants={fadeUpVariant} className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_24px_rgba(23,28,33,0.06)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">token</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-primary-container/20 text-on-primary-container font-mono text-[10px] uppercase tracking-widest rounded-full font-bold">New Module</span>
                    <span className="text-xs text-outline font-mono">Module 1 of 5</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Quantum Cryptography Basics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                      <span>Progress</span>
                      <span>12%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "12%" }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-primary rounded-full"></motion.div>
                    </div>
                  </div>
                  <button className="pt-2 text-primary font-mono text-sm font-bold flex items-center gap-2 group">
                    START LEARNING
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Mastery Achievements (Bento Style) */}
          <section className="space-y-8 pt-6">
            <div className="flex justify-between items-end border-t border-outline-variant/10 pt-8">
              <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">{t('profile.recentAchievements') || 'Recent Achievements'}</h2>
              <a className="text-sm font-mono text-primary font-bold hover:underline" href="#">{t('profile.viewAllBadges') || 'VIEW ALL BADGES'}</a>
            </div>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Achievement Badge 1 */}
              <motion.div variants={fadeUpVariant} className="group relative aspect-square bg-surface-container-lowest rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_12px_24px_rgba(23,28,33,0.06)] hover:bg-white transition-all">
                <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,#ffba49_0%,#ffddb1_50%,#ffba49_100%)] bg-[length:200%_200%] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-tertiary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                </div>
                <p className="font-headline font-bold text-sm text-on-surface">Early Bird</p>
                <p className="text-[10px] font-mono text-outline mt-1">10 DAYS STREAK</p>
              </motion.div>

              {/* Achievement Badge 2 */}
              <motion.div variants={fadeUpVariant} className="group relative aspect-square bg-surface-container-lowest rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_12px_24px_rgba(23,28,33,0.06)] hover:bg-white transition-all">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <p className="font-headline font-bold text-sm text-on-surface">Rapid Learner</p>
                <p className="text-[10px] font-mono text-outline mt-1">5 MODULES / WEEK</p>
              </motion.div>

              {/* Achievement Badge 3 */}
              <motion.div variants={fadeUpVariant} className="group relative aspect-square bg-surface-container-lowest rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_12px_24px_rgba(23,28,33,0.06)] hover:bg-white transition-all">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
                </div>
                <p className="font-headline font-bold text-sm text-on-surface">Syntactic Sage</p>
                <p className="text-[10px] font-mono text-outline mt-1">NO CODE ERRORS</p>
              </motion.div>

              {/* Achievement Badge 4 */}
              <motion.div variants={fadeUpVariant} className="group relative aspect-square bg-surface-container-lowest rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_12px_24px_rgba(23,28,33,0.06)] hover:bg-white transition-all">
                <div className="w-16 h-16 rounded-full bg-tertiary-fixed-dim flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-tertiary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <p className="font-headline font-bold text-sm text-on-surface">Alpha Tester</p>
                <p className="text-[10px] font-mono text-outline mt-1">BETA PARTICIPANT</p>
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 z-50 flex justify-around p-4 shadow-lg shadow-black/5">
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="text-[10px] font-medium">Courses</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-medium font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
