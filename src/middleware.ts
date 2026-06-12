import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Role-based access rules:
 *
 * /dashboard/admin/**       - admin only
 * /dashboard/instructor/**  - instructor or admin
 * /dashboard/**             - any authenticated user (student/instructor/admin)
 * /courses/create           - instructor or admin
 * /courses/*\/edit      - instructor or admin
 * /profile, /settings   - any authenticated user
 * /login, /signup       - unauthenticated only (redirect logged-in users)
 */

type Role = 'student' | 'instructor' | 'admin';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // ── 1. Guest trying to access protected route → send to login ──
  const requiresAuth =
    path.startsWith('/dashboard') ||
    path.startsWith('/profile') ||
    path.startsWith('/settings') ||
    path.startsWith('/courses/create') ||
    /^\/courses\/[^/]+\/edit/.test(path) ||
    /^\/courses\/[^/]+\/quiz/.test(path) ||
    path.startsWith('/certificates') ||
    path.startsWith('/checkout') ||
    path.startsWith('/cart');

  if (!session && requiresAuth) {
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // ── 2. Logged-in user hitting auth pages → send to their dashboard ──
  if (session && (path === '/login' || path === '/signup')) {
    // Fetch role from DB using the get_my_role() function
    const { data: roleData } = await supabase.rpc('get_my_role');
    const role = (roleData as Role) || 'student';
    url.pathname = roleToDashboard(role);
    url.searchParams.delete('redirectTo');
    return NextResponse.redirect(url);
  }

  // ── 3. Role-based route guards (only for authenticated requests) ──
  if (session && requiresAuth) {
    const { data: roleData } = await supabase.rpc('get_my_role');
    const role = (roleData as Role) || 'student';

    // Admin dashboard: admin only
    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      url.pathname = roleToDashboard(role);
      return NextResponse.redirect(url);
    }

    // Instructor dashboard: instructor or admin only
    if (path.startsWith('/dashboard/instructor') && role === 'student') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Course create/edit/quiz: instructor or admin only
    const isInstructorRoute =
      path.startsWith('/courses/create') ||
      /^\/courses\/[^/]+\/edit/.test(path) ||
      /^\/courses\/[^/]+\/quiz/.test(path);

    if (isInstructorRoute && role === 'student') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Student dashboard: students only — instructors and admins go to their own dashboard
    if (path === '/dashboard' && role !== 'student') {
      url.pathname = roleToDashboard(role);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

function roleToDashboard(role: Role): string {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'instructor') return '/dashboard/instructor';
  return '/dashboard';
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/courses/create',
    '/courses/:id/edit',
    '/courses/:id/quiz',
    '/certificates',
    '/checkout',
    '/cart',
    '/login',
    '/signup',
  ],
};
