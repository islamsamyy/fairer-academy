'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

const HIDDEN_ROUTES = ['/login', '/signup', '/support/chat'];

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hide = HIDDEN_ROUTES.some((route) => pathname === route);
  if (hide) return null;
  return <Header />;
}
