import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-surface font-body text-on-background min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <span className="text-[120px] sm:text-[160px] font-headline font-bold text-primary/10 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-6xl sm:text-7xl">explore_off</span>
          </div>
        </div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-on-background mb-3">Page Not Found</h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">The page you&apos;re looking for has drifted beyond our reach. It may have been moved, renamed, or may never have existed.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Go Home
          </Link>
          <Link href="/courses" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 text-on-surface rounded-xl font-bold hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">school</span>
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
