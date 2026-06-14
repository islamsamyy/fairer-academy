"use client";

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useRef, useEffect, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { count, ref };
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { count, ref } = useCounter(value);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const categories = [
  { icon: 'code', label: 'Technology', color: 'from-cyan-500 to-blue-600', count: '142 courses' },
  { icon: 'business_center', label: 'Business', color: 'from-violet-500 to-purple-700', count: '98 courses' },
  { icon: 'palette', label: 'Design', color: 'from-pink-500 to-rose-600', count: '76 courses' },
  { icon: 'translate', label: 'Languages', color: 'from-amber-500 to-orange-600', count: '54 courses' },
  { icon: 'leaderboard', label: 'Leadership', color: 'from-emerald-500 to-teal-600', count: '41 courses' },
  { icon: 'analytics', label: 'Data Science', color: 'from-indigo-500 to-blue-700', count: '63 courses' },
];

const testimonials = [
  { name: 'Sara Al-Harbi', role: 'Software Engineer @ STC', avatar: '👩‍💻', quote: 'I landed my dream job 3 months after completing the Full-Stack track. The quality rivals any international platform.', xp: 4820, badge: '🏆 Top Graduate' },
  { name: 'Mohammed Al-Qahtani', role: 'Product Designer @ Noon', avatar: '👨‍🎨', quote: 'The UI/UX course was taught by real industry professionals. My portfolio went from zero to hired in 8 weeks.', xp: 3650, badge: '🎨 Design Pro' },
  { name: 'Fatima Al-Zahrani', role: 'Data Analyst @ Aramco', avatar: '👩‍🔬', quote: 'Arabic-first content made it so much easier. I went through 3 data courses and each felt world-class.', xp: 5100, badge: '📊 Data Star' },
  { name: 'Omar Al-Dosari', role: 'Entrepreneur', avatar: '🧑‍💼', quote: 'The business + legal track gave me everything I needed to launch my startup. Highly recommend the mentorship add-on.', xp: 2900, badge: '🚀 Founder' },
];

const leaderboard = [
  { rank: 1, name: 'Fatima Z.', xp: 9840, streak: 62, badge: '🥇', avatar: '👩‍🔬' },
  { rank: 2, name: 'Mohammed Q.', xp: 8720, streak: 48, badge: '🥈', avatar: '👨‍💻' },
  { rank: 3, name: 'Sara H.', xp: 7950, streak: 41, badge: '🥉', avatar: '👩‍🎨' },
  { rank: 4, name: 'Ali K.', xp: 7200, streak: 35, badge: '⭐', avatar: '🧑‍🏫' },
  { rank: 5, name: 'Nora S.', xp: 6800, streak: 30, badge: '⭐', avatar: '👩‍💼' },
];

const instructors = [
  { name: 'Dr. Khalid Al-Mutairi', subject: 'Computer Science', courses: 12, students: '18K', rating: 4.9, avatar: '👨‍🏫' },
  { name: 'Eng. Reem Al-Shammari', subject: 'Data Engineering', courses: 8, students: '12K', rating: 4.8, avatar: '👩‍🔬' },
  { name: 'Dr. Bandar Al-Otaibi', subject: 'Business & Strategy', courses: 15, students: '24K', rating: 4.95, avatar: '🧑‍💼' },
];

const tickerItems = [
  '🟢 1,243 students online now',
  '📚 47 courses completed today',
  '🎓 3 new scholarships available',
  '🔥 New: AI & Machine Learning track',
  '⭐ 98% satisfaction rate this month',
  '🏆 Top learner streak: 62 days',
  '🌍 Students from 28 countries',
  '🚀 Vision 2030 certified platform',
];

export function HomeView() {
  const { t } = useLanguage();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <main className="min-h-screen overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative blob-bg mesh-gradient pt-8 pb-32 overflow-hidden">
          {/* Animated background blobs */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-[80px] animate-blob pointer-events-none" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-400/15 rounded-full blur-[80px] animate-blob-delay pointer-events-none" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-amber-300/15 rounded-full blur-[60px] animate-blob-slow pointer-events-none" />

          <motion.section
            initial="hidden" animate="visible" variants={stagger}
            className="relative z-10 px-6 sm:px-8 pt-20 pb-8 max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-16"
          >
            <motion.div variants={fadeUp} className="w-full md:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                {t('home.badge')}
              </div>
              <h1 className="text-6xl lg:text-8xl font-heading font-bold leading-[0.9] tracking-tighter text-on-background">
                {t('home.h1Line1')} <br/>
                <span className="gradient-text">{t('home.h1Line2')}</span> <br/>
                {t('home.h1Line3')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-light">
                {t('home.heroBody')}
              </p>
              {/* Live online count pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-strong rounded-full text-xs font-mono font-bold text-emerald-600 border border-emerald-200">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                1,243 students learning right now
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/courses" className="px-8 py-4 bg-primary text-white rounded-xl font-heading font-bold uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/25 hover:scale-105 transition-all group flex items-center gap-2">
                  {t('home.explorePaths')}
                  <span className="material-symbols-outlined align-middle group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <Link href="/about" className="px-8 py-4 glass-strong rounded-xl font-heading font-bold uppercase tracking-widest hover:bg-white transition-all">
                  {t('home.theVision')}
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="w-full md:w-1/2 relative">
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 border-8 border-white animate-glow">
                <img alt="Faireer Future Visualization" className="w-full h-full object-cover scale-110" src="/hero-v2.png" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              </div>
              {/* Floating glass card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute -bottom-10 -left-10 glass-glow p-6 rounded-2xl max-w-[280px] z-20 hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-white p-1">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-primary tracking-widest font-bold">{t('home.floatingBadge')}</p>
                    <p className="font-heading font-black text-on-background text-sm">{t('home.floatingTitle')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} transition={{ delay: 1.2, duration: 2 }} className="h-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-muted-foreground font-mono font-bold uppercase">{t('home.floatingLabel')}</p>
                    <p className="text-[10px] text-primary font-mono font-black">88%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.section>
        </section>

        {/* ── LIVE STATS TICKER ── */}
        <div className="w-full bg-slate-900 py-3 overflow-hidden border-y border-white/5">
          <div className="flex animate-ticker whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-8 text-sm font-mono text-white/70 font-bold">
                {item}
                <span className="w-1 h-1 bg-primary rounded-full mx-2" />
              </span>
            ))}
          </div>
        </div>

        {/* ── GLOBAL IMPACT STATS ── */}
        <section className="px-6 sm:px-8 py-16 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('home.stat1Label'), value: 28000, suffix: '+', icon: 'groups', color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { label: t('home.stat2Label'), value: 320, suffix: '+', icon: 'psychology', color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: t('home.stat3Label'), value: 480, suffix: '+', icon: 'auto_awesome', color: 'text-primary', bg: 'bg-primary/5' },
              { label: t('home.stat4Label'), value: 94, suffix: '%', icon: 'work', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-glow p-6 rounded-2xl text-center space-y-3 card-hover-glow cursor-default"
              >
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mx-auto`}>
                  <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                </div>
                <h4 className={`text-4xl font-heading font-black tracking-tight ${stat.color}`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </h4>
                <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SCHOLARSHIP BANNER ── */}
        <section className="px-6 sm:px-8 max-w-screen-2xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-cyan-600 to-secondary p-8 flex flex-col sm:flex-row items-center justify-between gap-6 animate-glow"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float">
                <span className="material-symbols-outlined text-white text-3xl">school</span>
              </div>
              <div>
                <p className="text-white/80 text-xs font-mono font-bold uppercase tracking-widest mb-1">Limited time offer</p>
                <h3 className="text-white text-2xl font-heading font-black">3 Full Scholarships Available</h3>
                <p className="text-white/80 text-sm mt-1">Cover your full tuition — apply before seats run out</p>
              </div>
            </div>
            <Link href="/scholarships" className="relative z-10 flex-shrink-0 px-8 py-3 bg-white text-primary font-heading font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
              Apply Now
            </Link>
          </motion.div>
        </section>

        {/* ── COURSE CATEGORIES ── */}
        <section className="px-6 sm:px-8 py-20 max-w-screen-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-10">
            <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">Explore by Category</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight text-on-background">Find Your Path</motion.h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.03 }}
              >
                <Link href={`/courses?category=${encodeURIComponent(cat.label)}`} className="block glass-glow rounded-2xl p-5 text-center group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="material-symbols-outlined text-white text-2xl">{cat.icon}</span>
                  </div>
                  <p className="font-heading font-black text-sm text-on-background">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">{cat.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── WHY SECTION ── */}
        <section className="px-6 sm:px-8 py-24 max-w-screen-2xl mx-auto blob-bg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-heading font-bold tracking-tight text-on-background">{t('home.whySectionTitle')}</motion.h2>
            <motion.div variants={fadeUp} className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mt-4 rounded-full" />
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { icon: 'payments', color: 'text-primary', key: 'why1' },
              { icon: 'school', color: 'text-secondary', key: 'why2' },
              { icon: 'schedule', color: 'text-cyan-500', key: 'why3' },
              { icon: 'rocket_launch', color: 'text-accent', key: 'why4' },
              { icon: 'all_inclusive', color: 'text-yellow-600', key: 'why5' },
              { icon: 'verified_user', color: 'text-primary', key: 'why6' },
            ].map((w) => (
              <motion.div key={w.key} variants={fadeUp} whileHover={{ y: -6 }} className="glass-glow p-10 rounded-[2rem] card-hover-glow cursor-default">
                <span className={`material-symbols-outlined text-4xl ${w.color} mb-6 block`}>{w.icon}</span>
                <h3 className="text-2xl font-heading font-bold mb-4">{t(`home.${w.key}Title`)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(`home.${w.key}Body`)}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── TESTIMONIALS CAROUSEL ── */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(0,217,255,0.08),transparent_60%)] pointer-events-none" />
          <div className="px-6 sm:px-8 max-w-screen-2xl mx-auto relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
              <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-secondary tracking-widest uppercase mb-2">Success Stories</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black text-white tracking-tight">Our Graduates Are Thriving</motion.h2>
            </motion.div>
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="glass-dark rounded-3xl p-10 max-w-2xl mx-auto text-center">
                      <div className="text-6xl mb-4">{t.avatar}</div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-mono font-bold mb-4">{t.badge}</div>
                      <p className="text-white/90 text-lg leading-relaxed italic mb-6">"{t.quote}"</p>
                      <p className="font-heading font-black text-white text-xl">{t.name}</p>
                      <p className="text-white/50 text-sm font-mono mt-1">{t.role}</p>
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full">
                        <span className="material-symbols-outlined text-yellow-400 text-sm">stars</span>
                        <span className="text-white/70 text-xs font-mono font-bold">{t.xp.toLocaleString()} XP earned</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-secondary scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── LEADERBOARD ── */}
        <section className="px-6 sm:px-8 py-24 max-w-screen-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-accent tracking-widest uppercase mb-2">Weekly Rankings</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight">Top Learners This Week</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-glow rounded-2xl p-4 flex items-center gap-4 card-hover-glow"
                >
                  <span className="text-2xl w-8 text-center">{entry.badge}</span>
                  <div className="text-3xl">{entry.avatar}</div>
                  <div className="flex-1">
                    <p className="font-heading font-black text-on-background">{entry.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(entry.xp / 10000) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 1.2 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        />
                      </div>
                      <span className="text-xs font-mono font-black text-primary">{entry.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <span className="text-lg">🔥</span>
                    <span className="text-xs font-mono font-black">{entry.streak}d</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Podium visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-glow rounded-3xl p-8 flex flex-col items-center justify-center gap-4"
            >
              <p className="text-xs font-mono font-bold text-primary tracking-widest uppercase">Earn XP by completing courses</p>
              <div className="flex items-end gap-4 mt-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="w-20 h-24 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-2xl flex items-end justify-center pb-3">
                    <span className="text-white font-mono text-xs font-black">2nd</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-float">🥇</div>
                  <div className="w-20 h-32 bg-gradient-to-b from-primary to-cyan-600 rounded-t-2xl flex items-end justify-center pb-3 shadow-lg shadow-primary/30">
                    <span className="text-white font-mono text-xs font-black">1st</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="w-20 h-16 bg-gradient-to-b from-amber-500 to-orange-600 rounded-t-2xl flex items-end justify-center pb-3">
                    <span className="text-white font-mono text-xs font-black">3rd</span>
                  </div>
                </div>
              </div>
              <Link href="/courses" className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-heading font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                Join the Competition
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── INSTRUCTOR SPOTLIGHT ── */}
        <section className="px-6 sm:px-8 py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-screen-2xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
              <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">World-Class Faculty</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight">Learn From the Best</motion.h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructors.map((inst, i) => (
                <motion.div
                  key={inst.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="glass-glow rounded-3xl p-8 text-center card-hover-glow"
                >
                  <div className="text-6xl mb-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{inst.avatar}</div>
                  <h3 className="font-heading font-black text-xl text-on-background mb-1">{inst.name}</h3>
                  <p className="text-xs font-mono text-primary font-bold uppercase tracking-widest mb-4">{inst.subject}</p>
                  <div className="flex justify-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="font-heading font-black text-2xl text-on-background">{inst.courses}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">Courses</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <p className="font-heading font-black text-2xl text-on-background">{inst.students}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">Students</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <p className="font-heading font-black text-2xl text-yellow-500">⭐{inst.rating}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">Rating</p>
                    </div>
                  </div>
                  <Link href="/courses" className="block w-full py-2.5 rounded-xl border-2 border-primary/20 text-primary font-heading font-bold text-sm hover:bg-primary hover:text-white transition-all">
                    View Courses
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ECOSYSTEM / BIDJOBS ── */}
        <section className="relative py-32 overflow-hidden blob-bg">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-mono text-[10px] font-bold tracking-widest uppercase">
                {t('home.ecoTagline')}
              </div>
              <h2 className="text-5xl lg:text-7xl font-heading font-black leading-[0.9] tracking-tighter text-on-background">
                {t('home.ecoH2Line1')} <br/><span className="gradient-text">{t('home.ecoH2Line2')}</span>
              </h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-xl">{t('home.ecoBody')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="glass-glow p-6 rounded-2xl card-hover-glow">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl block">verified</span>
                  <h4 className="font-heading font-bold mb-2">{t('home.ecoCard1Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('home.ecoCard1Body')}</p>
                </div>
                <div className="glass-glow p-6 rounded-2xl card-hover-glow">
                  <span className="material-symbols-outlined text-secondary mb-4 text-3xl block">fast_forward</span>
                  <h4 className="font-heading font-bold mb-2">{t('home.ecoCard2Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('home.ecoCard2Body')}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full lg:w-1/2 relative">
              <div className="glass-card p-1 rounded-[3rem] border border-white/40 shadow-2xl skew-y-1 animate-glow">
                <div className="bg-slate-900 rounded-[2.8rem] p-12 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-16">
                      <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                      <div className="px-5 py-1.5 rounded-full border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase font-bold">{t('home.sdkLabel')}</div>
                    </div>
                    <div className="space-y-6">
                      <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                      <div className="h-12 w-4/5 bg-white/5 rounded-xl animate-pulse" />
                      <div className="h-32 w-full bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
                        <span className="text-primary font-heading font-black text-xl tracking-tighter">{t('home.sdkStatus')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 px-6 sm:px-8 max-w-screen-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-heading font-bold text-on-background tracking-tighter">{t('home.stepsTitle')}</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {[
              { icon: 'search', color: 'from-primary to-cyan-500', delay: 0, key: 'step1' },
              { icon: 'play_circle', color: 'from-secondary to-cyan-400', delay: 0.2, key: 'step2' },
              { icon: 'emoji_events', color: 'from-emerald-500 to-teal-600', delay: 0.4, key: 'step3' },
            ].map((s, i) => (
              <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: s.delay }} className="group text-center space-y-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${s.color} text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <span className="material-symbols-outlined text-4xl">{s.icon}</span>
                </div>
                <div className="text-xs font-mono font-black text-primary tracking-widest uppercase">Step {i + 1}</div>
                <h3 className="text-xl font-heading font-black">{t(`home.${s.key}Title`)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{t(`home.${s.key}Body`)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SAUDI VISION 2030 ── */}
        <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,104,123,0.3),transparent_70%)] pointer-events-none" />
          <div className="absolute top-10 right-10 w-80 h-80 border border-white/5 rounded-full animate-rotate-slow pointer-events-none" />
          <div className="absolute top-20 right-20 w-60 h-60 border border-white/5 rounded-full animate-rotate-slow pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white/70 font-mono text-xs font-bold tracking-widest uppercase mb-4">
                🇸🇦 Saudi Vision 2030 Aligned
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-5xl lg:text-7xl font-heading font-black text-white tracking-tighter leading-tight mb-6">
                Building the <span className="gradient-text">Future</span><br />of Saudi Education
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/60 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Aligned with the Kingdom's Vision 2030 to develop human capital and create a knowledge-based economy.
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                { icon: 'diversity_3', label: 'Human Capital', body: 'Empowering Saudi youth with digital and technical skills for the economy of tomorrow.', stat: '28K+', statLabel: 'learners upskilled' },
                { icon: 'business', label: 'Economic Growth', body: 'Supporting the shift from oil dependency to a diversified knowledge economy.', stat: '94%', statLabel: 'employment rate' },
                { icon: 'public', label: 'Global Competitiveness', body: 'International-quality education delivered in Arabic, preparing graduates for global roles.', stat: '28', statLabel: 'countries represented' },
              ].map((pillar, i) => (
                <motion.div
                  key={pillar.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-dark rounded-3xl p-8 text-center card-hover-glow"
                >
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-secondary text-3xl">{pillar.icon}</span>
                  </div>
                  <h3 className="font-heading font-black text-white text-xl mb-3">{pillar.label}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">{pillar.body}</p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="gradient-text font-heading font-black text-3xl">{pillar.stat}</p>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest mt-1">{pillar.statLabel}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KSA CONTENT SECTION ── */}
        <section className="py-24 px-6 sm:px-8 max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-16 items-center border-t border-outline-variant/10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl aspect-video flex items-center justify-center p-12 group animate-glow">
              <div className="absolute inset-0 bg-primary/10 opacity-50 blur-2xl" />
              <div className="text-center space-y-4 relative z-10 transition-transform duration-700 group-hover:scale-110">
                <div className="text-5xl lg:text-7xl font-heading font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">{t('home.ksaH2')}</div>
                <div className="text-xl font-heading text-primary font-bold tracking-[0.2em] uppercase">{t('home.ksaSubheading')}</div>
              </div>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-black text-on-background tracking-tighter leading-tight">{t('home.ksaTitle')}</motion.h2>
            <motion.div variants={fadeUp} className="space-y-6 text-muted-foreground text-lg">
              <p className="leading-relaxed font-light">{t('home.ksaBody')}</p>
              <div className="p-8 glass-glow rounded-2xl flex gap-6 items-center">
                <span className="text-5xl font-heading font-black text-primary opacity-20">ع</span>
                <p className="text-sm font-medium leading-relaxed italic">{t('home.ksaQuote')}</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── MOBILE APP PROMO ── */}
        <section className="py-24 px-6 sm:px-8 max-w-screen-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/5 via-cyan-50 to-violet-50 border border-primary/10 p-12 md:p-20 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex-1 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold tracking-widest uppercase">
                📱 Available on iOS & Android
              </div>
              <h2 className="text-4xl lg:text-5xl font-heading font-black tracking-tighter text-on-background leading-tight">
                Learn Anywhere,<br /><span className="gradient-text">Anytime</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md font-light">
                Download the جامعة فايرير السعودية app and continue your learning journey on the go. Offline mode, push notifications, and more.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => alert('التطبيق قريباً — The app is coming soon!')} className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
                  <span className="material-symbols-outlined text-2xl">phone_iphone</span>
                  <div className="text-left">
                    <p className="text-[10px] text-white/60 font-mono uppercase">Coming soon on</p>
                    <p className="text-sm font-heading font-black">App Store</p>
                  </div>
                </button>
                <button onClick={() => alert('التطبيق قريباً — The app is coming soon!')} className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
                  <span className="material-symbols-outlined text-2xl">android</span>
                  <div className="text-left">
                    <p className="text-[10px] text-white/60 font-mono uppercase">Coming soon on</p>
                    <p className="text-sm font-heading font-black">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            {/* Phone mockup */}
            <div className="relative flex-shrink-0 w-48 md:w-64 animate-float">
              <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2rem] h-[400px] flex flex-col items-center justify-center gap-4 p-4">
                  <img src="/logo.png" alt="App" className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                  <p className="text-white font-heading font-black text-sm text-center">جامعة فايرير<br />السعودية</p>
                  <div className="w-full space-y-2">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-primary to-secondary rounded-full" />
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-secondary to-cyan-400 rounded-full" />
                    </div>
                  </div>
                  <p className="text-white/50 text-[10px] font-mono">88% Complete</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="py-32 px-6 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-4xl mx-auto text-center space-y-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="mx-auto w-24 h-24 bg-primary/5 rounded-[30%] flex items-center justify-center mb-4 active:rotate-180 transition-transform duration-700 animate-pulse-ring">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-on-background leading-none">{t('home.ctaTitle')}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">{t('home.ctaBody')}</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Link href="/courses" className="px-12 py-5 bg-primary text-white rounded-2xl font-heading font-black text-lg tracking-widest uppercase hover:bg-primary shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2">
                {t('home.ctaJoin')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link href="/support/contact" className="px-12 py-5 glass-glow rounded-2xl font-heading font-black text-lg tracking-widest uppercase hover:bg-white transition-all flex items-center justify-center">
                {t('home.ctaAdvisor')}
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full rounded-t-[3rem] mt-8 bg-slate-900 text-white border-t border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-10 relative z-10">
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
              <Link href="/" className="flex items-center gap-4 group">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] group-hover:scale-110 transition-transform" />
                <span className="text-3xl font-heading font-black tracking-tighter">جامعة فايرير السعودية<span className="text-primary">.</span></span>
              </Link>
              <iframe src="https://services.futurex.sa/entity-badge?code=AcTfbCBySVsZYteq" width="250" height="60" referrerPolicy="unsafe-url" style={{ border: "none" }} title="NELC Verified Entity" />
            </div>
            <p className="font-sans text-xs tracking-widest text-white/40 max-w-xs uppercase leading-relaxed font-bold">{t('home.footerCopy')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-mono tracking-widest text-primary uppercase font-black">{t('home.footerExploration')}</p>
              <Link className="text-xs font-bold text-white/60 hover:text-white transition-colors" href="/about">{t('home.footerAbout')}</Link>
              <Link className="text-xs font-bold text-white/60 hover:text-white transition-colors" href="/support">{t('home.footerHelp')}</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-mono tracking-widest text-secondary uppercase font-black">{t('home.footerEcosystem')}</p>
              <Link className="text-xs font-bold text-white/60 hover:text-white transition-colors" href="/bidjobs">{t('home.footerBidJobs')}</Link>
              <Link className="text-xs font-bold text-white/60 hover:text-white transition-colors" href="/scholarships">{t('home.footerScholarships')}</Link>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/about" aria-label="About us" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-xl">public</span>
            </Link>
            <button
              aria-label="Share this site"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'جامعة فايرير السعودية', url: window.location.origin });
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('تم نسخ الرابط! Link copied to clipboard.');
                }
              }}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
          </div>
        </div>
        <div className="px-12 py-6 border-t border-white/5 text-center">
          <p className="text-[9px] font-mono text-white/20 tracking-[0.4em] uppercase">{t('home.footerGlobal')}</p>
        </div>
      </footer>
    </>
  );
}
