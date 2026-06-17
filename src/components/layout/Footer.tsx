'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const quickLinks = [
  { href: '/courses', labelKey: 'nav.programs' },
  { href: '/blog', labelKey: 'nav.blog' },
  { href: '/scholarships', labelKey: 'nav.scholarships' },
  { href: '/bidjobs', labelKey: 'nav.bidjobs' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/support', labelKey: 'nav.support' },
];

const legalLinks = [
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/terms', label: 'الشروط والأحكام' },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-white border-t border-white/5 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
              <Image
                src="/logo.png"
                alt="جامعة فايرير السعودية"
                width={48}
                height={48}
                className="drop-shadow-[0_0_12px_rgba(0,200,255,0.5)] group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-heading font-black text-lg leading-tight">
                جامعة فايرير<br />
                <span className="text-primary">السعودية</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
              منصة تعليمية متكاملة معتمدة من وزارة الثقافة، تُقدّم برامج الدبلوم والماجستير في علم الأنباط السعودي.
            </p>
            <div className="space-y-1">
              <p className="text-xs font-mono text-primary/70">رقم الرخصة: 212001000270</p>
              <p className="text-xs font-mono text-white/30">تبوك، المملكة العربية السعودية</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-5">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-primary text-sm transition-colors duration-200">
                    {t(l.labelKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-5">البرامج الأكاديمية</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="hover:text-primary transition-colors cursor-default">دبلوم علم الأنباط السعودي</li>
              <li className="hover:text-primary transition-colors cursor-default">ماجستير علم الأنباط السعودي</li>
              <li className="hover:text-primary transition-colors cursor-default">دكتوراه علم الأنباط (قريباً)</li>
              <li className="hover:text-primary transition-colors cursor-default">برامج التدريب الميداني</li>
            </ul>
          </div>

          {/* Legal + Contact */}
          <div>
            <h4 className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-5">قانوني</h4>
            <ul className="space-y-3 mb-6">
              {legalLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-primary text-sm transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-3">تواصل معنا</h4>
            <Link href="/support/contact" className="text-white/50 hover:text-primary text-sm transition-colors duration-200 block">
              {t('nav.support')}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="logo"
              width={28}
              height={28}
              className="opacity-20"
            />
            <p className="text-white/30 text-xs font-mono">
              © 2026 أكاديمية فايرير للتدريب والتعليم العالي. جميع الحقوق محفوظة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-white/30">منصة نشطة ومعتمدة — 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
