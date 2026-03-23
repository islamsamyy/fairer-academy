'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/courses', label: 'Programs', icon: 'school' },
  { href: '/bidjobs', label: 'BidJobs', icon: 'work' },
  { href: '/scholarships', label: 'Scholarships', icon: 'auto_awesome' },
  { href: '/support', label: 'Support', icon: 'support_agent' },
  { href: '/about', label: 'About', icon: 'info' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            <Link href="/" className="flex items-center gap-3 active:scale-95 transition-all group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Fairer Academy Logo"
                  width={42}
                  height={42}
                  className="relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                />
              </div>
              <span className="font-heading text-2xl font-black tracking-tighter text-slate-900 flex items-center">
                Fairer<span className="text-primary">.</span>
              </span>
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
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
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
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container/30 hover:border-primary transition-colors outline-none flex-shrink-0"
                >
                  <img
                    alt="Profile"
                    className="w-full h-full object-cover"
                    src={user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBcu6owJHHRi88QAp4CqlGAV77UYcS5vz4jU8flShpDhkF7Fj8TjRRE1OqUB8vaQ4ZlEN9WNNDKg4BshOvMZSkxLtAULXvdbDY-G5Wgn7lovivQG9aJtM6AwUbnoomTpHUukLHu4H3dLsuHZO4xgmrCZOpppl6n2wgReD05O9UcxiJDTQ3557CXmWOASP73lKUrPTXkAM31wQqZ9v_zWuVMY7FZsO9jXLmMxaLf3nPmibNS9_GbIz9o-YYzlLund-rnUNO6QETGF-M"}
                  />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-xl transition-all outline-none"
                  title="Sign Out"
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
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all outline-none"
                >
                  Join Now
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
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-16" />
    </>
  );
}
