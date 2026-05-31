'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'courses' | 'reviews';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  instructor: 'bg-blue-100 text-blue-700',
  student: 'bg-emerald-100 text-emerald-700',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Overview data
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, reviews: 0 });

  // Users tab
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Courses tab
  const [courses, setCourses] = useState<any[]>([]);
  const [courseFilter, setCourseFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Reviews tab
  const [reviews, setReviews] = useState<any[]>([]);

  const loadOverview = useCallback(async () => {
    const [
      { count: userCount },
      { count: courseCount },
      { count: enrollCount },
      { count: reviewCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
    ]);
    setStats({
      users: userCount || 0,
      courses: courseCount || 0,
      enrollments: enrollCount || 0,
      reviews: reviewCount || 0,
    });
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setUsers(data);
  }, []);

  const loadCourses = useCallback(async () => {
    const { data } = await supabase
      .from('courses')
      .select(`*, profiles:instructor_id (full_name)`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setCourses(data);
  }, []);

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`*, profiles:user_id (full_name), courses:course_id (title)`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setReviews(data);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { router.push('/dashboard'); return; }
      await Promise.all([loadOverview(), loadUsers(), loadCourses(), loadReviews()]);
      setLoading(false);
    }
    init();
  }, [router, loadOverview, loadUsers, loadCourses, loadReviews]);

  const changeUserRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setActionLoading(null);
  };

  const toggleCoursePublish = async (courseId: string, current: boolean) => {
    setActionLoading(courseId);
    await supabase.from('courses').update({ is_published: !current }).eq('id', courseId);
    setCourses(cs => cs.map(c => c.id === courseId ? { ...c, is_published: !current } : c));
    setActionLoading(null);
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    setActionLoading(courseId);
    await supabase.from('courses').delete().eq('id', courseId);
    setCourses(cs => cs.filter(c => c.id !== courseId));
    setActionLoading(null);
    await loadOverview();
  };

  const deleteReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    await supabase.from('reviews').delete().eq('id', reviewId);
    setReviews(rs => rs.filter(r => r.id !== reviewId));
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-primary font-bold animate-pulse">Loading Admin Console...</div>
    </div>
  );

  const filteredCourses = courses.filter(c =>
    courseFilter === 'all' ? true :
    courseFilter === 'published' ? c.is_published :
    !c.is_published
  );

  const filteredUsers = userSearch
    ? users.filter(u => u.full_name?.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  const NAV: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'users', icon: 'group', label: `Users (${stats.users})` },
    { id: 'courses', icon: 'library_books', label: `Courses (${stats.courses})` },
    { id: 'reviews', icon: 'reviews', label: `Reviews (${stats.reviews})` },
  ];

  return (
    <div className="bg-[#f8fafc] font-body text-on-background min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-[#0d1b2a] text-white flex flex-col py-6 px-4 z-40">
        <div className="px-2 mb-8">
          <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">Admin Console</p>
          <h2 className="text-lg font-bold text-white">Fairer Academy</h2>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === n.id ? 'bg-primary text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-xs font-medium transition-colors mt-4"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to App
        </Link>
      </aside>

      {/* Main */}
      <main className="ml-56 min-h-screen p-8">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-8">Platform Overview</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Users', value: stats.users, icon: 'group', color: 'text-blue-600 bg-blue-50' },
                { label: 'Courses', value: stats.courses, icon: 'library_books', color: 'text-primary bg-primary/10' },
                { label: 'Enrollments', value: stats.enrollments, icon: 'school', color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Reviews', value: stats.reviews, icon: 'star', color: 'text-amber-600 bg-amber-50' },
              ].map(s => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                  </div>
                  <p className="text-3xl font-bold text-on-surface font-mono">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-outline mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Users preview */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-on-surface">Recent Users</h2>
                <button onClick={() => setTab('users')} className="text-xs text-primary font-bold hover:underline">View all</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left pb-3">Name</th>
                    <th className="text-left pb-3">Role</th>
                    <th className="text-left pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.slice(0, 8).map(u => (
                    <tr key={u.id}>
                      <td className="py-3 font-medium">{u.full_name || '—'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-outline text-xs font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">User</th>
                    <th className="text-left px-6 py-3">Role</th>
                    <th className="text-left px-6 py-3">Joined</th>
                    <th className="text-left px-6 py-3">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {(u.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{u.full_name || '—'}</p>
                            <p className="text-xs text-outline font-mono">{u.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-outline text-xs font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          disabled={actionLoading === u.id}
                          onChange={e => changeUserRole(u.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        >
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-outline">No users found</div>
              )}
            </div>
          </div>
        )}

        {/* ── Courses ── */}
        {tab === 'courses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-on-surface">Course Management</h1>
              <div className="flex gap-2">
                {(['all', 'published', 'draft'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setCourseFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      courseFilter === f ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-outline hover:text-on-surface'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-left px-6 py-3">Instructor</th>
                    <th className="text-left px-6 py-3">Price</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCourses.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-on-surface line-clamp-1 max-w-xs">{c.title}</p>
                        <p className="text-xs text-outline mt-0.5">{c.category} · {c.level}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{c.profiles?.full_name || '—'}</td>
                      <td className="px-6 py-4 font-mono text-sm font-bold">
                        {c.price === 0 ? <span className="text-emerald-600">Free</span> : `$${c.price}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {c.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCoursePublish(c.id, c.is_published)}
                            disabled={actionLoading === c.id}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium"
                          >
                            {c.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link
                            href={`/courses/${c.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => deleteCourse(c.id)}
                            disabled={actionLoading === c.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-outline">No courses found</div>
              )}
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        {tab === 'reviews' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Review Moderation</h1>
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-sm text-on-surface">{r.profiles?.full_name || 'User'}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-amber-400 text-xs"
                            style={{ fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        ))}
                      </div>
                      <span className="text-xs text-outline font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-outline mb-1">on <span className="font-medium text-on-surface-variant">{r.courses?.title}</span></p>
                    {r.title && <p className="text-sm font-bold text-on-surface mb-1">{r.title}</p>}
                    <p className="text-sm text-on-surface-variant">{r.comment}</p>
                  </div>
                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={actionLoading === r.id}
                    className="flex-shrink-0 p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete review"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12 text-outline">No reviews yet</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
