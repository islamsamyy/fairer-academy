'use client';

import Link from 'next/link';

interface Props {
  requiredRole?: string;
  currentRole?: string;
}

export default function AccessDenied({ requiredRole, currentRole }: Props) {
  const dashboardHref =
    currentRole === 'admin' ? '/dashboard/admin' :
    currentRole === 'instructor' ? '/dashboard/instructor' :
    '/dashboard';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-red-500 text-4xl">lock</span>
        </div>
        <h1 className="text-3xl font-heading font-black text-on-background mb-3 tracking-tight">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-2">
          This page requires the <span className="font-bold text-primary">{requiredRole}</span> role.
        </p>
        {currentRole && (
          <p className="text-sm text-muted-foreground mb-8">
            You are signed in as <span className="font-bold capitalize">{currentRole}</span>.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={dashboardHref}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-outline-variant rounded-xl font-bold hover:bg-surface-container transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
