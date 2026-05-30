'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import HeaderWrapper from './HeaderWrapper';
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
      </CartProvider>
    </LanguageProvider>
  );
}
