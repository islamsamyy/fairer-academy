'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const navLinks = [
    { href: '/', label: t('nav.home'), icon: 'home' },
    { href: '/courses', label: t('nav.programs'), icon: 'school' },
    { href: '/blog', label: t('nav.blog'), icon: 'article' },
    { href: '/bidjobs', label: t('nav.bidjobs'), icon: 'work' },
    { href: '/scholarships', label: t('nav.scholarships'), icon: 'auto_awesome' },
    { href: '/support', label: t('nav.support'), icon: 'support_agent' },
    { href: '/about', label: t('nav.about'), icon: 'info' },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch avatar from profiles table (reflects uploads without requiring re-login)
  useEffect(() => {
    if (!user) { setAvatarUrl(null); return; }
    let active = true;
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setAvatarUrl(data?.avatar_url ?? null);
      });
    return () => { active = false; };
  }, [user, pathname]); // re-fetch on every navigation so settings changes reflect immediately

  // Unread notification count
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let active = true;
    async function loadUnread() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);
      if (active) setUnread(count || 0);
    }
    loadUnread();
    return () => { active = false; };
  }, [user, pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-outline-variant/10'
            : 'bg-white/70 backdrop-blur-md'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 sm:px-8 h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 sm:gap-8">
            <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-all group">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-400/10 border border-primary/15 group-hover:border-primary/40 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="جامعة فايرير السعودية"
                  width={36}
                  height={36}
                  className="relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(0,200,255,0.6)]"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading text-base font-black tracking-tight text-slate-900">
                  جامعة فايرير <span className="text-primary">السعودية</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase hidden sm:block">FAiRER Academy</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex gap-1 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all outline-none ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-slate-500 hover:text-primary hover:bg-surface-container'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 text-slate-400 hover:text-primary hover:bg-surface-container rounded-xl transition-all outline-none"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </Link>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-primary hover:bg-surface-container rounded-xl transition-all outline-none"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-slate-400 hover:text-primary hover:bg-surface-container rounded-xl transition-all outline-none relative"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {cart.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && (
              <Link
                href="/dashboard/notifications"
                className="p-2 text-slate-400 hover:text-primary hover:bg-surface-container rounded-xl transition-all outline-none relative"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}

            {/* Profile / Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className={`hidden sm:flex px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all outline-none ${
                    isActive('/dashboard') ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-primary hover:bg-surface-container'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/profile"
                  className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container/30 hover:border-primary transition-colors outline-none flex-shrink-0"
                >
                  {avatarUrl ? (
                    <img alt="Profile" className="w-full h-full object-cover" src={avatarUrl} />
                  ) : (
                    <div className="w-full h-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-xl transition-all outline-none"
                  title={t('nav.signOut')}
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:flex px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors outline-none"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all outline-none"
                >
                  {t('nav.joinNow')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-primary hover:bg-surface-container rounded-xl transition-all outline-none ml-1"
            >
              <span className="material-symbols-outlined text-xl">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-outline-variant/10 shadow-xl animate-in slide-in-from-top-2">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all outline-none ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-slate-500 hover:text-primary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container rounded-xl transition-all outline-none text-sm font-bold"
              >
                <span className="material-symbols-outlined text-lg">language</span>
                {language === 'en' ? 'العربية' : t('nav.langToggle')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-16" />
    </>
  );
}
