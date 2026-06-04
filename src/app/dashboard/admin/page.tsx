'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'courses' | 'reviews' | 'scholarships' | 'broadcast' | 'support';

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

  // Scholarships tab
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [schForm, setSchForm] = useState({ title: '', description: '', amount: '', seats: '1', deadline: '' });
  const [schSaving, setSchSaving] = useState(false);

  // Support inbox tab
  const [messages, setMessages] = useState<any[]>([]);

  // Broadcast tab
  const [bcTitle, setBcTitle] = useState('');
  const [bcBody, setBcBody] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'student' | 'instructor'>('all');
  const [bcSending, setBcSending] = useState(false);
  const [bcMsg, setBcMsg] = useState('');

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

  const loadScholarships = useCallback(async () => {
    const { data } = await supabase
      .from('scholarships')
      .select('*, scholarship_applications (id)')
      .order('created_at', { ascending: false });
    if (data) setScholarships(data);
  }, []);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setMessages(data);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { router.push('/dashboard'); return; }
      await Promise.all([loadOverview(), loadUsers(), loadCourses(), loadReviews(), loadScholarships(), loadMessages()]);
      setLoading(false);
    }
    init();
  }, [router, loadOverview, loadUsers, loadCourses, loadReviews, loadScholarships, loadMessages]);

  const resolveMessage = async (id: string, current: string) => {
    const next = current === 'resolved' ? 'open' : 'resolved';
    setActionLoading(id);
    await supabase.from('support_messages').update({ status: next }).eq('id', id);
    setMessages(ms => ms.map(m => m.id === id ? { ...m, status: next } : m));
    setActionLoading(null);
  };

  const createScholarship = async () => {
    if (!schForm.title.trim()) return;
    setSchSaving(true);
    const { error } = await supabase.from('scholarships').insert({
      title: schForm.title,
      description: schForm.description,
      amount: schForm.amount ? parseFloat(schForm.amount) : null,
      seats: parseInt(schForm.seats) || 1,
      deadline: schForm.deadline || null,
      is_active: true,
    });
    if (!error) {
      setSchForm({ title: '', description: '', amount: '', seats: '1', deadline: '' });
      await loadScholarships();
    } else {
      alert(error.message);
    }
    setSchSaving(false);
  };

  const toggleScholarship = async (id: string, active: boolean) => {
    setActionLoading(id);
    await supabase.from('scholarships').update({ is_active: !active }).eq('id', id);
    setScholarships(s => s.map(x => x.id === id ? { ...x, is_active: !active } : x));
    setActionLoading(null);
  };

  const deleteScholarship = async (id: string) => {
    if (!confirm('Delete this scholarship?')) return;
    setActionLoading(id);
    await supabase.from('scholarships').delete().eq('id', id);
    setScholarships(s => s.filter(x => x.id !== id));
    setActionLoading(null);
  };

  const sendBroadcast = async () => {
    if (!bcTitle.trim()) { setBcMsg('Title is required'); return; }
    setBcSending(true);
    setBcMsg('');
    try {
      let q = supabase.from('profiles').select('id');
      if (bcTarget !== 'all') q = q.eq('role', bcTarget);
      const { data: targets, error: tErr } = await q;
      if (tErr) throw tErr;
      if (!targets || targets.length === 0) { setBcMsg('No recipients found'); setBcSending(false); return; }
      const rows = targets.map((t: any) => ({
        user_id: t.id, title: bcTitle, body: bcBody, type: 'info',
      }));
      // insert in chunks of 500
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from('notifications').insert(rows.slice(i, i + 500));
        if (error) throw error;
      }
      setBcMsg(`Sent to ${targets.length} user${targets.length !== 1 ? 's' : ''} ✓`);
      setBcTitle(''); setBcBody('');
    } catch (err: any) {
      setBcMsg('Error: ' + err.message);
    } finally {
      setBcSending(false);
    }
  };

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
    { id: 'scholarships', icon: 'school', label: `Scholarships (${scholarships.length})` },
    { id: 'support', icon: 'inbox', label: `Support (${messages.filter(m => m.status !== 'resolved').length})` },
    { id: 'broadcast', icon: 'campaign', label: 'Broadcast' },
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
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="text-2xl font-bold text-on-surface">Course Management</h1>
              <div className="flex gap-2 items-center">
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
                <Link href="/courses/create" className="ml-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span> New Course
                </Link>
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
                            href={`/courses/${c.id}/edit`}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                          >
                            Edit
                          </Link>
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

        {/* ── Scholarships ── */}
        {tab === 'scholarships' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Scholarships</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create form */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 h-fit">
                <h2 className="font-bold text-on-surface mb-4">New Scholarship</h2>
                <div className="space-y-3">
                  <input value={schForm.title} onChange={e => setSchForm({ ...schForm, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <textarea value={schForm.description} onChange={e => setSchForm({ ...schForm, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={schForm.amount} onChange={e => setSchForm({ ...schForm, amount: e.target.value })} type="number" placeholder="Amount ($)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input value={schForm.seats} onChange={e => setSchForm({ ...schForm, seats: e.target.value })} type="number" min="1" placeholder="Seats" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs text-outline font-bold uppercase">Deadline</label>
                    <input value={schForm.deadline} onChange={e => setSchForm({ ...schForm, deadline: e.target.value })} type="date" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1" />
                  </div>
                  <button onClick={createScholarship} disabled={schSaving || !schForm.title.trim()} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
                    {schSaving ? 'Creating…' : 'Create Scholarship'}
                  </button>
                </div>
              </div>
              {/* List */}
              <div className="lg:col-span-2 space-y-3">
                {scholarships.length === 0 ? (
                  <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">No scholarships yet</div>
                ) : scholarships.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-on-surface">{s.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">{s.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-outline font-mono">
                          {s.amount != null && <span>${Number(s.amount).toLocaleString()}</span>}
                          <span>{s.seats} seat{s.seats !== 1 ? 's' : ''}</span>
                          {s.deadline && <span>Due {new Date(s.deadline).toLocaleDateString()}</span>}
                          <span>{s.scholarship_applications?.length || 0} applicant{(s.scholarship_applications?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => toggleScholarship(s.id, s.is_active)} disabled={actionLoading === s.id} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium disabled:opacity-50">
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteScholarship(s.id)} disabled={actionLoading === s.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Support Inbox ── */}
        {tab === 'support' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Support Inbox</h1>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">No messages yet</div>
              ) : messages.map(m => (
                <div key={m.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${m.status === 'resolved' ? 'border-slate-200/60 opacity-70' : 'border-primary/20'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-sm text-on-surface">{m.name}</p>
                        <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline">{m.email}</a>
                        {m.subject && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-outline">{m.subject}</span>}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{m.status}</span>
                      </div>
                      <p className="text-xs text-outline mb-2 font-mono">{new Date(m.created_at).toLocaleString()}</p>
                      <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{m.message}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your message')}`} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-center">Reply</a>
                      <button onClick={() => resolveMessage(m.id, m.status)} disabled={actionLoading === m.id} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium disabled:opacity-50">
                        {m.status === 'resolved' ? 'Reopen' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Broadcast ── */}
        {tab === 'broadcast' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Broadcast Notification</h1>
            <p className="text-sm text-outline mb-6">Send an announcement to users. It appears in their in-app notifications.</p>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Recipients</label>
                <div className="flex gap-2 mt-2">
                  {([['all', 'All users'], ['student', 'Students'], ['instructor', 'Instructors']] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setBcTarget(v)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bcTarget === v ? 'bg-primary text-white' : 'bg-slate-50 border border-slate-200 text-outline hover:text-on-surface'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Title</label>
                <input value={bcTitle} onChange={e => setBcTitle(e.target.value)} placeholder="e.g. New courses just dropped!" className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Message</label>
                <textarea value={bcBody} onChange={e => setBcBody(e.target.value)} rows={4} placeholder="Write your announcement…" className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center justify-between">
                {bcMsg ? <span className={`text-sm font-bold ${bcMsg.startsWith('Error') ? 'text-error' : 'text-emerald-600'}`}>{bcMsg}</span> : <span />}
                <button onClick={sendBroadcast} disabled={bcSending || !bcTitle.trim()} className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">send</span>
                  {bcSending ? 'Sending…' : 'Send Broadcast'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
