"use client";

import { motion , Variants } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <>

      <main className="mesh-gradient min-h-screen pt-8 overflow-x-hidden">
        <motion.section 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative px-8 pt-20 pb-32 max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-16"
        >
          <motion.div variants={fadeUpVariant} className="w-full md:w-1/2 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('home.badge')}
            </div>
            <h1 className="text-6xl lg:text-8xl font-heading font-bold leading-[0.9] tracking-tighter text-on-background">
              {t('home.h1Line1')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container">{t('home.h1Line2')}</span> <br/>
              {t('home.h1Line3')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-light">
              {t('home.heroBody')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-4 bg-primary text-white rounded-xl font-heading font-bold uppercase tracking-widest hover:bg-primary/90 premium-shadow transition-all group">
                {t('home.explorePaths')}
                <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="px-8 py-4 glass-card border border-white/50 text-on-background rounded-xl font-heading font-bold uppercase tracking-widest hover:bg-white transition-all">
                {t('home.theVision')}
              </button>
            </div>
          </motion.div>
          <motion.div variants={fadeUpVariant} className="w-full md:w-1/2 relative">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden premium-shadow transform rotate-3 hover:rotate-0 transition-transform duration-700 border-8 border-white shadow-2xl">
              <img alt="Faireer Future Visualization" className="w-full h-full object-cover scale-110" src="/hero-v2.png"/>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]"></div>
            </div>
            {/* New Interactive Hover Card */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="absolute -bottom-10 -left-10 glass-card p-6 rounded-2xl premium-shadow border border-white/60 max-w-[280px] z-20 hover:-translate-y-2 transition-transform duration-500">
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
                  <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} transition={{ delay: 1.2, duration: 2 }} className="h-full bg-gradient-to-r from-primary to-secondary"></motion.div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-muted-foreground font-mono font-bold uppercase">{t('home.floatingLabel')}</p>
                  <p className="text-[10px] text-primary font-mono font-black">88%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* New: Global Impact Numbers (Interactive) */}
        <section className="px-8 py-12 max-w-screen-2xl mx-auto border-y border-outline-variant/10 bg-white/30 backdrop-blur-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: t('home.stat1Label'), value: t('home.stat1Value'), icon: 'groups' },
              { label: t('home.stat2Label'), value: t('home.stat2Value'), icon: 'psychology' },
              { label: t('home.stat3Label'), value: t('home.stat3Value'), icon: 'auto_awesome' },
              { label: t('home.stat4Label'), value: t('home.stat4Value'), icon: 'work' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-2 group cursor-default"
              >
                <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                </div>
                <h4 className="text-3xl font-heading font-black tracking-tight text-on-background">{stat.value}</h4>
                <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-8 py-24 max-w-screen-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-16">
            <motion.h2 variants={fadeUpVariant} className="text-4xl font-heading font-bold tracking-tight text-on-background">{t('home.whySectionTitle')}</motion.h2>
            <motion.div variants={fadeUpVariant} className="h-1 w-20 bg-primary mt-4"></motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={fadeUpVariant} className="glass-card p-10 rounded-[2rem] premium-shadow border border-white/50 hover:bg-white/90 transition-all cursor-default">
              <span className="material-symbols-outlined text-4xl text-primary mb-6">payments</span>
              <h3 className="text-2xl font-heading font-bold mb-4">{t('home.why1Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('home.why1Body')}</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-10 rounded-[2rem] premium-shadow border border-white/50 hover:bg-white/90 transition-all cursor-default">
              <span className="material-symbols-outlined text-4xl text-secondary mb-6">school</span>
              <h3 className="text-2xl font-heading font-bold mb-4">{t('home.why2Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('home.why2Body')}</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-10 rounded-[2rem] premium-shadow border border-white/50 hover:bg-white/90 transition-all cursor-default">
              <span className="material-symbols-outlined text-4xl text-cyan-500 mb-6">schedule</span>
              <h3 className="text-2xl font-heading font-bold mb-4">{t('home.why3Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('home.why3Body')}</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-10 rounded-[2rem] premium-shadow border border-white/50 hover:bg-white/90 transition-all cursor-default">
              <span className="material-symbols-outlined text-4xl text-accent mb-6">rocket_launch</span>
              <h3 className="text-2xl font-heading font-bold mb-4">{t('home.why4Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('home.why4Body')}</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-10 rounded-[2rem] premium-shadow border border-white/50 hover:bg-white/90 transition-all cursor-default">
              <span className="material-symbols-outlined text-4xl text-yellow-600 mb-6">all_inclusive</span>
              <h3 className="text-2xl font-heading font-bold mb-4">{t('home.why5Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('home.why5Body')}</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-10 rounded-[2rem] premium-shadow border border-white/50 hover:bg-white/90 transition-all cursor-default">
              <span className="material-symbols-outlined text-4xl text-primary mb-6">verified_user</span>
              <h3 className="text-2xl font-heading font-bold mb-4">{t('home.why6Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t('home.why6Body')}</p>
            </motion.div>
          </motion.div>
        </section>

        {/* New: Ecosystem Synergy / BidJobs Connection */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-screen-2xl mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-mono text-[10px] font-bold tracking-widest uppercase">
                {t('home.ecoTagline')}
              </div>
              <h2 className="text-5xl lg:text-7xl font-heading font-black leading-[0.9] tracking-tighter text-on-background">
                {t('home.ecoH2Line1')} <br/><span className="text-primary">{t('home.ecoH2Line2')}</span>
              </h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
                {t('home.ecoBody')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="p-6 rounded-2xl bg-white border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl">verified</span>
                  <h4 className="font-heading font-bold mb-2">{t('home.ecoCard1Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('home.ecoCard1Body')}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                  <span className="material-symbols-outlined text-secondary mb-4 text-3xl">fast_forward</span>
                  <h4 className="font-heading font-bold mb-2">{t('home.ecoCard2Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('home.ecoCard2Body')}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full lg:w-1/2 relative">
               <div className="glass-card p-1 rounded-[3rem] border border-white/40 shadow-2xl skew-y-1">
                  <div className="bg-slate-900 rounded-[2.8rem] p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col h-full">
                       <div className="flex justify-between items-center mb-16">
                          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                          <div className="px-5 py-1.5 rounded-full border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase font-bold">{t('home.sdkLabel')}</div>
                       </div>
                       <div className="space-y-6">
                          <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse"></div>
                          <div className="h-12 w-4/5 bg-white/5 rounded-xl animate-pulse"></div>
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

        <section className="py-24 px-8 max-w-screen-2xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeUpVariant} className="text-4xl font-heading font-bold text-on-background tracking-tighter">{t('home.stepsTitle')}</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group text-center space-y-4">
              <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-sm border border-primary/10">
                <span className="material-symbols-outlined text-4xl">search</span>
              </div>
              <h3 className="text-xl font-heading font-black">{t('home.step1Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">{t('home.step1Body')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group text-center space-y-4">
              <div className="w-20 h-20 bg-secondary/5 text-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-secondary/10">
                <span className="material-symbols-outlined text-4xl">play_circle</span>
              </div>
              <h3 className="text-xl font-heading font-black">{t('home.step2Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">{t('home.step2Body')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="group text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:-rotate-12 transition-transform duration-500 shadow-sm border border-emerald-100">
                <span className="material-symbols-outlined text-4xl">emoji_events</span>
              </div>
              <h3 className="text-xl font-heading font-black">{t('home.step3Title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">{t('home.step3Body')}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-8 max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-16 items-center border-t border-outline-variant/10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
             <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-3xl aspect-video flex items-center justify-center p-12 group">
                <div className="absolute inset-0 bg-primary/10 opacity-50 blur-2xl"></div>
                <div className="text-center space-y-4 relative z-10 transition-transform duration-700 group-hover:scale-110">
                  <div className="text-5xl lg:text-7xl font-heading font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">{t('home.ksaH2')}</div>
                  <div className="text-xl font-heading text-primary font-bold tracking-[0.2em] uppercase">{t('home.ksaSubheading')}</div>
                </div>
             </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-8">
            <motion.h2 variants={fadeUpVariant} className="text-4xl lg:text-5xl font-heading font-black text-on-background tracking-tighter leading-tight">{t('home.ksaTitle')}</motion.h2>
            <motion.div variants={fadeUpVariant} className="space-y-6 text-muted-foreground text-lg">
              <p className="leading-relaxed font-light">{t('home.ksaBody')}</p>
              <div className="p-8 bg-white/50 backdrop-blur-md rounded-2xl border border-primary/10 flex gap-6 items-center shadow-lg hover:shadow-primary/5 transition-shadow">
                <span className="text-5xl font-heading font-black text-primary opacity-20">ع</span>
                <p className="text-sm font-medium leading-relaxed italic">{t('home.ksaQuote')}</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="py-32 px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-4xl mx-auto text-center space-y-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="mx-auto w-24 h-24 bg-primary/5 rounded-[30%] flex items-center justify-center mb-4 active:rotate-180 transition-transform duration-700">
               <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
            </motion.div>
            <motion.h2 variants={fadeUpVariant} className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-on-background leading-none">{t('home.ctaTitle')}</motion.h2>
            <motion.p variants={fadeUpVariant} className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              {t('home.ctaBody')}
            </motion.p>
            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Link href="/courses" className="px-12 py-5 bg-primary text-white rounded-2xl font-heading font-black text-lg tracking-widest uppercase hover:bg-primary shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center">
                {t('home.ctaJoin')}
              </Link>
              <Link href="/support/contact" className="px-12 py-5 glass-card border-2 border-primary/20 text-on-background rounded-2xl font-heading font-black text-lg tracking-widest uppercase hover:bg-white hover:border-primary transition-all flex items-center justify-center">
                {t('home.ctaAdvisor')}
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="w-full rounded-t-[3rem] mt-20 bg-slate-900 text-white border-t border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-10 relative z-10">
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
              <Link href="/" className="flex items-center gap-4 group">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] group-hover:scale-110 transition-transform" />
                <span className="text-3xl font-heading font-black tracking-tighter">Fairer<span className="text-primary">.</span></span>
              </Link>
              {/* NELC Entity Verification Badge */}
              <iframe
                src="https://services.futurex.sa/entity-badge?code=AcTfbCBySVsZYteq"
                width="250"
                height="60"
                referrerPolicy="unsafe-url"
                style={{ border: "none" }}
                title="NELC Verified Entity"
              ></iframe>
            </div>
            <p className="font-sans text-xs tracking-widest text-white/40 max-w-xs uppercase leading-relaxed font-bold">
              {t('home.footerCopy')}
            </p>
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
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-xl">public</span>
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:bg-white/10 transition-all">
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
