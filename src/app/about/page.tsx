'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = to / 80;
    const t = setInterval(() => {
      v += step;
      if (v >= to) { setVal(to); clearInterval(t); } else setVal(Math.floor(v));
    }, 20);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const values = [
  { icon: 'star', label: 'Excellence', body: 'We hold every course to the standard of the best institutions in the world.', color: 'from-amber-400 to-orange-500' },
  { icon: 'diversity_3', label: 'Inclusion', body: 'Education is a right, not a privilege. We make quality learning accessible to all.', color: 'from-primary to-cyan-500' },
  { icon: 'verified', label: 'Integrity', body: 'Every certificate, every credential, every instructor — verified and trusted.', color: 'from-emerald-400 to-teal-500' },
  { icon: 'rocket_launch', label: 'Innovation', body: 'We build the tools and experiences that put Saudi learners ahead of the curve.', color: 'from-violet-500 to-purple-700' },
];

const team = [
  { name: 'Dr. Abdullah Al-Faisal', role: 'Founder & CEO', avatar: '👨‍💼', bio: 'Former Stanford professor, 20 years in EdTech' },
  { name: 'Eng. Reem Al-Shammari', role: 'Chief Academic Officer', avatar: '👩‍🔬', bio: 'MIT graduate, curriculum design expert' },
  { name: 'Dr. Khalid Al-Mutairi', role: 'Head of Technology', avatar: '👨‍💻', bio: 'Ex-Google, 15 years in platform engineering' },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative blob-bg mesh-gradient pt-32 pb-24 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-[80px] animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-400/15 rounded-full blur-[60px] animate-blob-delay pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              {t('about.tag')}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-heading font-black tracking-tighter text-on-background mb-6 leading-tight">
              {t('about.h1')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
              {t('about.intro')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section className="px-6 sm:px-8 py-16 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: 28000, suffix: '+', label: 'Learners enrolled', icon: 'groups', color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { to: 320, suffix: '+', label: 'Expert instructors', icon: 'school', color: 'text-violet-600', bg: 'bg-violet-50' },
            { to: 480, suffix: '+', label: 'Courses available', icon: 'menu_book', color: 'text-primary', bg: 'bg-primary/5' },
            { to: 94, suffix: '%', label: 'Graduate employment', icon: 'work', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-glow rounded-2xl p-6 text-center card-hover-glow"
            >
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
              <p className={`text-4xl font-heading font-black ${s.color}`}><Counter to={s.to} suffix={s.suffix} /></p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MISSION & ACADEMY ── */}
      <section className="px-6 sm:px-8 py-16 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-glow p-10 rounded-3xl card-hover-glow"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-primary text-2xl">target</span>
          </div>
          <h2 className="text-2xl font-heading font-black text-on-background mb-4">{t('about.missionTitle')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('about.missionBody')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-glow p-10 rounded-3xl card-hover-glow"
        >
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-secondary text-2xl">account_balance</span>
          </div>
          <h2 className="text-2xl font-heading font-black text-on-background mb-4">{t('about.academyTitle')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('about.academyBody')}</p>
        </motion.div>
      </section>

      {/* ── OUR VALUES ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
          <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">What We Stand For</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight text-on-background">Our Core Values</motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-glow rounded-2xl p-7 text-center card-hover-glow"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <span className="material-symbols-outlined text-white text-2xl">{v.icon}</span>
              </div>
              <h3 className="font-heading font-black text-on-background text-lg mb-3">{v.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── VISION 2030 ── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 my-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,104,123,0.25),transparent_70%)] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white/70 font-mono text-xs font-bold tracking-widest uppercase mb-4">
              🇸🇦 Vision 2030 Partner
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-black text-white tracking-tighter leading-tight mb-4">
              Powering Saudi Arabia's <span className="gradient-text">Knowledge Economy</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              جامعة فايرير السعودية is proud to be aligned with Vision 2030 goals — building the next generation of Saudi talent.
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: 'school', title: 'Quality Education', body: 'World-class curriculum built with Saudi context at its core.' },
              { icon: 'work', title: 'Job Readiness', body: '94% of graduates find employment within 6 months of completing their track.' },
              { icon: 'public', title: 'Global Standards', body: 'Internationally recognized certificates that open doors worldwide.' },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-dark rounded-2xl p-7 card-hover-glow"
              >
                <span className="material-symbols-outlined text-secondary text-3xl mb-4 block">{p.icon}</span>
                <h3 className="font-heading font-black text-white text-xl mb-3">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP TEAM ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
          <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">The People Behind It</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight text-on-background">Leadership Team</motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="glass-glow rounded-3xl p-8 text-center card-hover-glow"
            >
              <div className="text-6xl mb-4 animate-float" style={{ animationDelay: `${i * 0.6}s` }}>{member.avatar}</div>
              <h3 className="font-heading font-black text-xl text-on-background mb-1">{member.name}</h3>
              <p className="text-xs font-mono text-primary font-bold uppercase tracking-widest mb-3">{member.role}</p>
              <p className="text-muted-foreground text-sm">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/8 to-secondary/8 p-16 rounded-[3rem] border border-primary/10 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.08),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-heading font-black text-on-background tracking-tight">{t('about.ctaTitle')}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Start your learning journey today and become part of a growing Saudi success story.</p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/courses" className="px-10 py-4 bg-primary text-white rounded-2xl font-heading font-black hover:scale-105 transition-transform shadow-xl shadow-primary/25">{t('about.ctaExplore')}</Link>
              <Link href="/support/contact" className="px-10 py-4 glass-glow rounded-2xl font-heading font-black hover:bg-white transition-all">{t('about.ctaContact')}</Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
