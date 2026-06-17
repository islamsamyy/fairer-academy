'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';
import { ReactNode, useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LanguageProvider>
      <CartProvider>
        {mounted && <HeaderWrapper />}
        {children}
        {mounted && <Footer />}
      </CartProvider>
    </LanguageProvider>
  );
}
