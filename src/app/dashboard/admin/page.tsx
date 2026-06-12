'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'courses' | 'enrollments' | 'orders' | 'reviews' | 'certificates' | 'forum' | 'scholarships' | 'support' | 'broadcast';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  instructor: 'bg-blue-100 text-blue-700',
  student: 'bg-emerald-100 text-emerald-700',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

function StatCard({ label, value, icon, color, bg, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30 transition-all' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg} ${color}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <p className={`text-3xl font-heading font-black font-mono ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Overview
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, reviews: 0, orders: 0, certificates: 0, revenue: 0, openTickets: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'instructor' | 'student'>('all');
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  // Courses
  const [courses, setCourses] = useState<any[]>([]);
  const [courseFilter, setCourseFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Enrollments
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);

  // Certificates
  const [certificates, setCertificates] = useState<any[]>([]);

  // Forum
  const [threads, setThreads] = useState<any[]>([]);

  // Scholarships
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [schForm, setSchForm] = useState({ title: '', description: '', amount: '', seats: '1', deadline: '' });
  const [schSaving, setSchSaving] = useState(false);

  // Support
  const [messages, setMessages] = useState<any[]>([]);
  const [msgFilter, setMsgFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  // Broadcast
  const [bcTitle, setBcTitle] = useState('');
  const [bcBody, setBcBody] = useState('');
  const [bcLink, setBcLink] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'student' | 'instructor'>('all');
  const [bcSending, setBcSending] = useState(false);
  const [bcMsg, setBcMsg] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadOverview = useCallback(async () => {
    const [
      { count: userCount },
      { count: courseCount },
      { count: enrollCount },
      { count: reviewCount },
      { count: orderCount },
      { count: certCount },
      { data: orderData },
      { count: ticketCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('amount').eq('status', 'completed'),
      supabase.from('support_messages').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
    ]);
    const revenue = (orderData || []).reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0);
    setStats({
      users: userCount || 0,
      courses: courseCount || 0,
      enrollments: enrollCount || 0,
      reviews: reviewCount || 0,
      orders: orderCount || 0,
      certificates: certCount || 0,
      revenue,
      openTickets: ticketCount || 0,
    });
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setUsers(data);
  }, []);

  const loadCourses = useCallback(async () => {
    const { data } = await supabase
      .from('courses')
      .select(`*, profiles:instructor_id (full_name), enrollments(id)`)
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setCourses(data);
  }, []);

  const loadEnrollments = useCallback(async () => {
    const { data } = await supabase
      .from('enrollments')
      .select(`*, profiles:user_id (full_name), courses:course_id (title)`)
      .order('enrolled_at', { ascending: false })
      .limit(200);
    if (data) setEnrollments(data);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select(`*, profiles:user_id (full_name), courses:course_id (title)`)
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setOrders(data);
  }, []);

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`*, profiles:user_id (full_name), courses:course_id (title)`)
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setReviews(data);
  }, []);

  const loadCertificates = useCallback(async () => {
    const { data } = await supabase
      .from('certificates')
      .select(`*, profiles:user_id (full_name), courses:course_id (title)`)
      .order('issued_at', { ascending: false })
      .limit(200);
    if (data) setCertificates(data);
  }, []);

  const loadThreads = useCallback(async () => {
    const { data } = await supabase
      .from('forum_threads')
      .select(`*, profiles:user_id (full_name), forum_replies(id)`)
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setThreads(data);
  }, []);

  const loadScholarships = useCallback(async () => {
    const { data } = await supabase
      .from('scholarships')
      .select('*, scholarship_applications(id)')
      .order('created_at', { ascending: false });
    if (data) setScholarships(data);
  }, []);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);
    if (data) setMessages(data);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { router.push('/dashboard'); return; }
      await Promise.all([
        loadOverview(), loadUsers(), loadCourses(), loadEnrollments(),
        loadOrders(), loadReviews(), loadCertificates(), loadThreads(),
        loadScholarships(), loadMessages(),
      ]);
      setLoading(false);
    }
    init();
  }, [router, loadOverview, loadUsers, loadCourses, loadEnrollments, loadOrders, loadReviews, loadCertificates, loadThreads, loadScholarships, loadMessages]);

  // ── Actions ──
  const changeUserRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast('Role updated');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const banUser = async (userId: string, banned: boolean) => {
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ banned: !banned }).eq('id', userId);
    if (!error) {
      setUsers(us => us.map(u => u.id === userId ? { ...u, banned: !banned } : u));
      showToast(!banned ? 'User banned' : 'User unbanned');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const toggleCoursePublish = async (courseId: string, current: boolean) => {
    setActionLoading(courseId);
    const { error } = await supabase.from('courses').update({ is_published: !current }).eq('id', courseId);
    if (!error) {
      setCourses(cs => cs.map(c => c.id === courseId ? { ...c, is_published: !current } : c));
      showToast(current ? 'Course unpublished' : 'Course published');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    setActionLoading(courseId);
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) {
      setCourses(cs => cs.filter(c => c.id !== courseId));
      await loadOverview();
      showToast('Course deleted');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setReviews(rs => rs.filter(r => r.id !== reviewId));
      showToast('Review removed');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteThread = async (threadId: string) => {
    if (!confirm('Delete this thread?')) return;
    setActionLoading(threadId);
    const { error } = await supabase.from('forum_threads').delete().eq('id', threadId);
    if (!error) {
      setThreads(ts => ts.filter(t => t.id !== threadId));
      showToast('Thread deleted');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const resolveMessage = async (id: string, current: string) => {
    const next = current === 'resolved' ? 'open' : 'resolved';
    setActionLoading(id);
    const { error } = await supabase.from('support_messages').update({ status: next }).eq('id', id);
    if (!error) {
      setMessages(ms => ms.map(m => m.id === id ? { ...m, status: next } : m));
      if (selectedMsg?.id === id) setSelectedMsg((m: any) => ({ ...m, status: next }));
      await loadOverview();
      showToast(next === 'resolved' ? 'Marked resolved' : 'Reopened');
    } else showToast(error.message, 'error');
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
      showToast('Scholarship created');
    } else showToast(error.message, 'error');
    setSchSaving(false);
  };

  const toggleScholarship = async (id: string, active: boolean) => {
    setActionLoading(id);
    const { error } = await supabase.from('scholarships').update({ is_active: !active }).eq('id', id);
    if (!error) {
      setScholarships(s => s.map(x => x.id === id ? { ...x, is_active: !active } : x));
      showToast(!active ? 'Scholarship activated' : 'Scholarship deactivated');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteScholarship = async (id: string) => {
    if (!confirm('Delete this scholarship?')) return;
    setActionLoading(id);
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (!error) {
      setScholarships(s => s.filter(x => x.id !== id));
      showToast('Scholarship deleted');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const sendBroadcast = async () => {
    if (!bcTitle.trim()) { setBcMsg('Title is required'); return; }
    setBcSending(true); setBcMsg('');
    try {
      let q = supabase.from('profiles').select('id');
      if (bcTarget !== 'all') q = q.eq('role', bcTarget);
      const { data: targets, error: tErr } = await q;
      if (tErr) throw tErr;
      if (!targets || targets.length === 0) { setBcMsg('No recipients found'); setBcSending(false); return; }
      const rows = targets.map((t: any) => ({
        user_id: t.id, title: bcTitle, body: bcBody, type: 'info',
        link: bcLink || null,
      }));
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from('notifications').insert(rows.slice(i, i + 500));
        if (error) throw error;
      }
      setBcMsg(`✓ Sent to ${targets.length} user${targets.length !== 1 ? 's' : ''}`);
      setBcTitle(''); setBcBody(''); setBcLink('');
      showToast(`Broadcast sent to ${targets.length} users`);
    } catch (err: any) {
      setBcMsg('Error: ' + err.message);
    } finally {
      setBcSending(false);
    }
  };

  const revokeCertificate = async (certId: string) => {
    if (!confirm('Revoke this certificate?')) return;
    setActionLoading(certId);
    const { error } = await supabase.from('certificates').delete().eq('id', certId);
    if (!error) {
      setCertificates(cs => cs.filter(c => c.id !== certId));
      showToast('Certificate revoked');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
        </div>
        <p className="text-primary font-bold">Loading Admin Console…</p>
      </div>
    </div>
  );

  // Derived/filtered lists
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredCourses = courses.filter(c => {
    const matchFilter = courseFilter === 'all' ? true : courseFilter === 'published' ? c.is_published : !c.is_published;
    const matchSearch = !courseSearch || c.title?.toLowerCase().includes(courseSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredMessages = messages.filter(m =>
    msgFilter === 'all' ? true : m.status === msgFilter
  );

  const NAV: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'users', icon: 'group', label: 'Users', badge: stats.users },
    { id: 'courses', icon: 'library_books', label: 'Courses', badge: stats.courses },
    { id: 'enrollments', icon: 'school', label: 'Enrollments', badge: stats.enrollments },
    { id: 'orders', icon: 'receipt', label: 'Orders', badge: stats.orders },
    { id: 'reviews', icon: 'reviews', label: 'Reviews', badge: stats.reviews },
    { id: 'certificates', icon: 'workspace_premium', label: 'Certificates', badge: stats.certificates },
    { id: 'forum', icon: 'forum', label: 'Forum', badge: threads.length },
    { id: 'scholarships', icon: 'volunteer_activism', label: 'Scholarships', badge: scholarships.length },
    { id: 'support', icon: 'inbox', label: 'Support', badge: stats.openTickets },
    { id: 'broadcast', icon: 'campaign', label: 'Broadcast' },
  ];

  return (
    <div className="bg-[#f8fafc] font-body text-on-background min-h-screen">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d1b2a] text-white flex flex-col py-6 px-3 z-40 overflow-y-auto">
        <div className="px-3 mb-6">
          <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mb-1">Admin Console</p>
          <h2 className="text-sm font-black text-white leading-tight">جامعة فايرير السعودية</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-white/40 font-mono">All systems live</span>
          </div>
        </div>
        <nav className="space-y-0.5 flex-1">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === n.id ? 'bg-primary text-white' : 'text-white/55 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">{n.icon}</span>
              <span className="flex-1 text-left truncate">{n.label}</span>
              {n.badge !== undefined && n.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === n.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}>
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 mt-4 pt-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-2 py-2 text-white/40 hover:text-white text-xs font-medium transition-colors rounded-lg hover:bg-white/8">
            <span className="material-symbols-outlined text-[16px]">home</span> View Site
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-white/40 hover:text-white text-xs font-medium transition-colors rounded-lg hover:bg-white/8">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 min-h-screen p-8">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-8 mb-8 border border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,104,123,0.3),transparent_60%)] pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white/50 text-xs font-mono font-bold uppercase tracking-widest mb-1">Admin Console</p>
                  <h1 className="text-3xl font-heading font-black text-white tracking-tight">Platform Overview</h1>
                  <p className="text-white/50 text-sm mt-1">جامعة فايرير السعودية — Live statistics</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-white/70 text-xs font-mono font-bold">All systems operational</span>
                  </div>
                  <button onClick={() => { loadOverview(); showToast('Stats refreshed'); }} className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-primary/30">
                    <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={stats.users} icon="group" color="text-blue-600" bg="bg-blue-50" onClick={() => setTab('users')} />
              <StatCard label="Courses" value={stats.courses} icon="library_books" color="text-primary" bg="bg-primary/10" onClick={() => setTab('courses')} />
              <StatCard label="Enrollments" value={stats.enrollments} icon="school" color="text-emerald-600" bg="bg-emerald-50" onClick={() => setTab('enrollments')} />
              <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon="payments" color="text-violet-600" bg="bg-violet-50" onClick={() => setTab('orders')} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Certificates Issued" value={stats.certificates} icon="workspace_premium" color="text-amber-600" bg="bg-amber-50" onClick={() => setTab('certificates')} />
              <StatCard label="Reviews" value={stats.reviews} icon="star" color="text-pink-600" bg="bg-pink-50" onClick={() => setTab('reviews')} />
              <StatCard label="Forum Threads" value={threads.length} icon="forum" color="text-cyan-600" bg="bg-cyan-50" onClick={() => setTab('forum')} />
              <StatCard label="Open Support Tickets" value={stats.openTickets} icon="inbox" color="text-red-600" bg="bg-red-50" onClick={() => setTab('support')} />
            </div>

            {/* Recent rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent users */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                    Recent Users
                  </h2>
                  <button onClick={() => setTab('users')} className="text-xs text-primary font-bold hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 6).map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {(u.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{u.full_name || '—'}</p>
                        <p className="text-xs text-outline font-mono">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent enrollments */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">school</span>
                    Recent Enrollments
                  </h2>
                  <button onClick={() => setTab('enrollments')} className="text-xs text-primary font-bold hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {enrollments.slice(0, 6).map(e => (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 text-[16px]">school</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{e.profiles?.full_name || '—'}</p>
                        <p className="text-xs text-outline truncate">{e.courses?.title || '—'}</p>
                      </div>
                      <p className="text-xs text-outline font-mono flex-shrink-0">{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="text-2xl font-bold text-on-surface">User Management <span className="text-outline font-normal text-lg">({filteredUsers.length})</span></h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  {(['all', 'admin', 'instructor', 'student'] as const).map(r => (
                    <button key={r} onClick={() => setUserRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${userRoleFilter === r ? 'bg-primary text-white' : 'text-outline hover:text-on-surface'}`}>{r}</button>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name…" className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-56" />
                </div>
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
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${u.banned ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {(u.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{u.full_name || '—'} {u.banned && <span className="text-red-500 text-xs">(banned)</span>}</p>
                            <p className="text-xs text-outline font-mono">{u.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-outline text-xs font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select value={u.role} disabled={actionLoading === u.id} onChange={e => changeUserRole(u.id, e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/${u.username || '#'}`} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">Profile</Link>
                          <button onClick={() => banUser(u.id, u.banned)} disabled={actionLoading === u.id} className={`text-xs px-2 py-1 rounded-lg font-medium disabled:opacity-50 ${u.banned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {u.banned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="text-center py-12 text-outline">No users found</div>}
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        {tab === 'courses' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="text-2xl font-bold text-on-surface">Course Management <span className="text-outline font-normal text-lg">({filteredCourses.length})</span></h1>
              <div className="flex gap-2 items-center flex-wrap">
                {(['all', 'published', 'draft'] as const).map(f => (
                  <button key={f} onClick={() => setCourseFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${courseFilter === f ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-outline hover:text-on-surface'}`}>{f}</button>
                ))}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                  <input value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder="Search courses…" className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-48" />
                </div>
                <Link href="/courses/create" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span> New
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
                    <th className="text-left px-6 py-3">Students</th>
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
                      <td className="px-6 py-4 font-mono text-sm font-bold">{c.price === 0 ? <span className="text-emerald-600">Free</span> : `$${c.price}`}</td>
                      <td className="px-6 py-4 font-mono text-sm">{c.enrollments?.length ?? 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button onClick={() => toggleCoursePublish(c.id, c.is_published)} disabled={actionLoading === c.id} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium disabled:opacity-50">
                            {c.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link href={`/courses/${c.id}/edit`} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium">Edit</Link>
                          <Link href={`/courses/${c.id}`} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">View</Link>
                          <button onClick={() => deleteCourse(c.id)} disabled={actionLoading === c.id} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCourses.length === 0 && <div className="text-center py-12 text-outline">No courses found</div>}
            </div>
          </div>
        )}

        {/* ── ENROLLMENTS ── */}
        {tab === 'enrollments' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Enrollments <span className="text-outline font-normal text-lg">({enrollments.length})</span></h1>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">Student</th>
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-left px-6 py-3">Progress</th>
                    <th className="text-left px-6 py-3">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{e.profiles?.full_name || '—'}</td>
                      <td className="px-6 py-4 text-on-surface-variant max-w-xs truncate">{e.courses?.title || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(e.progress_percentage || 0)}%` }} />
                          </div>
                          <span className="text-xs font-mono text-outline">{Math.round(e.progress_percentage || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-outline text-xs font-mono">{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {enrollments.length === 0 && <div className="text-center py-12 text-outline">No enrollments yet</div>}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-on-surface">Orders <span className="text-outline font-normal text-lg">({orders.length})</span></h1>
              <div className="px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl text-violet-700 font-bold text-sm">
                Total Revenue: ${stats.revenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">Student</th>
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-left px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{o.profiles?.full_name || '—'}</td>
                      <td className="px-6 py-4 text-on-surface-variant max-w-xs truncate">{o.courses?.title || '—'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-violet-700">${Number(o.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'}`}>{o.status}</span>
                      </td>
                      <td className="px-6 py-4 text-outline text-xs font-mono">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="text-center py-12 text-outline">No orders yet</div>}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Review Moderation <span className="text-outline font-normal text-lg">({reviews.length})</span></h1>
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-bold text-sm text-on-surface">{r.profiles?.full_name || 'User'}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-amber-400 text-xs" style={{ fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        ))}
                      </div>
                      <span className="text-xs text-outline font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-outline mb-2">on <Link href={`/courses/${r.course_id}`} className="font-medium text-primary hover:underline">{r.courses?.title}</Link></p>
                    {r.title && <p className="text-sm font-bold text-on-surface mb-1">{r.title}</p>}
                    <p className="text-sm text-on-surface-variant">{r.comment}</p>
                  </div>
                  <button onClick={() => deleteReview(r.id)} disabled={actionLoading === r.id} className="flex-shrink-0 p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete review">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
              {reviews.length === 0 && <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">No reviews yet</div>}
            </div>
          </div>
        )}

        {/* ── CERTIFICATES ── */}
        {tab === 'certificates' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Certificates <span className="text-outline font-normal text-lg">({certificates.length})</span></h1>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">Student</th>
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-left px-6 py-3">Issued</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {certificates.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{c.profiles?.full_name || '—'}</td>
                      <td className="px-6 py-4 text-on-surface-variant max-w-xs truncate">{c.courses?.title || '—'}</td>
                      <td className="px-6 py-4 text-outline text-xs font-mono">{new Date(c.issued_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => revokeCertificate(c.id)} disabled={actionLoading === c.id} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {certificates.length === 0 && <div className="text-center py-12 text-outline">No certificates issued yet</div>}
            </div>
          </div>
        )}

        {/* ── FORUM ── */}
        {tab === 'forum' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Forum Moderation <span className="text-outline font-normal text-lg">({threads.length})</span></h1>
            <div className="space-y-3">
              {threads.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-sm text-on-surface">{t.title}</p>
                      <span className="text-xs text-outline font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-outline mb-2">by <span className="text-on-surface-variant font-medium">{t.profiles?.full_name || 'User'}</span> · {t.forum_replies?.length || 0} replies · {t.upvotes || 0} upvotes</p>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{t.body}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/support/community/${t.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-center">View</Link>
                    <button onClick={() => deleteThread(t.id)} disabled={actionLoading === t.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">Delete</button>
                  </div>
                </div>
              ))}
              {threads.length === 0 && <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">No forum threads yet</div>}
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS ── */}
        {tab === 'scholarships' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Scholarships</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 h-fit">
                <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
                  New Scholarship
                </h2>
                <div className="space-y-3">
                  <input value={schForm.title} onChange={e => setSchForm({ ...schForm, title: e.target.value })} placeholder="Title *" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <textarea value={schForm.description} onChange={e => setSchForm({ ...schForm, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={schForm.amount} onChange={e => setSchForm({ ...schForm, amount: e.target.value })} type="number" placeholder="Amount ($)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input value={schForm.seats} onChange={e => setSchForm({ ...schForm, seats: e.target.value })} type="number" min="1" placeholder="Seats" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs text-outline font-bold uppercase">Deadline</label>
                    <input value={schForm.deadline} onChange={e => setSchForm({ ...schForm, deadline: e.target.value })} type="date" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1" />
                  </div>
                  <button onClick={createScholarship} disabled={schSaving || !schForm.title.trim()} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>
                    {schSaving ? 'Creating…' : 'Create Scholarship'}
                  </button>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-3">
                {scholarships.length === 0 ? (
                  <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">No scholarships yet</div>
                ) : scholarships.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-on-surface">{s.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">{s.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-outline font-mono">
                          {s.amount != null && <span className="text-violet-600 font-bold">${Number(s.amount).toLocaleString()}</span>}
                          <span>{s.seats} seat{s.seats !== 1 ? 's' : ''}</span>
                          {s.deadline && <span>Due {new Date(s.deadline).toLocaleDateString()}</span>}
                          <span className="text-primary font-bold">{s.scholarship_applications?.length || 0} applicant{(s.scholarship_applications?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => toggleScholarship(s.id, s.is_active)} disabled={actionLoading === s.id} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium disabled:opacity-50">
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteScholarship(s.id)} disabled={actionLoading === s.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SUPPORT INBOX ── */}
        {tab === 'support' && (
          <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Left: message list */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-on-surface">Support Inbox</h1>
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  {(['open', 'resolved', 'all'] as const).map(f => (
                    <button key={f} onClick={() => setMsgFilter(f)} className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${msgFilter === f ? 'bg-primary text-white' : 'text-outline hover:text-on-surface'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredMessages.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMsg(m)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMsg?.id === m.id ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-200/60 hover:border-primary/20 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-on-surface truncate flex-1">{m.name}</p>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-2 flex-shrink-0 ${m.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{m.status}</span>
                    </div>
                    <p className="text-xs text-outline truncate mb-1">{m.subject || 'No subject'}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{m.message}</p>
                    <p className="text-[10px] text-outline font-mono mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
                {filteredMessages.length === 0 && <div className="text-center py-8 text-outline text-sm">No messages</div>}
              </div>
            </div>

            {/* Right: selected message */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              {selectedMsg ? (
                <>
                  <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-on-surface text-lg">{selectedMsg.subject || 'Support Request'}</h2>
                      <p className="text-sm text-outline mt-1">From: <span className="text-on-surface font-medium">{selectedMsg.name}</span> · <a href={`mailto:${selectedMsg.email}`} className="text-primary hover:underline">{selectedMsg.email}</a></p>
                      <p className="text-xs text-outline font-mono mt-1">{new Date(selectedMsg.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject || 'Your message')}&body=${encodeURIComponent('\n\n---\nOriginal message:\n' + selectedMsg.message)}`}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-bold flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">reply</span> Reply by Email
                      </a>
                      <button onClick={() => resolveMessage(selectedMsg.id, selectedMsg.status)} disabled={actionLoading === selectedMsg.id} className={`px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-1 transition-colors ${selectedMsg.status === 'resolved' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                        <span className="material-symbols-outlined text-[16px]">{selectedMsg.status === 'resolved' ? 'refresh' : 'check_circle'}</span>
                        {selectedMsg.status === 'resolved' ? 'Reopen' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-outline">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-5xl mb-3 block">inbox</span>
                    <p className="text-sm font-medium">Select a message to read it</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BROADCAST ── */}
        {tab === 'broadcast' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Broadcast Notification</h1>
            <p className="text-sm text-outline mb-6">Send an in-app announcement to users. Appears in their notifications bell.</p>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Recipients</label>
                <div className="flex gap-2">
                  {([['all', 'All Users'], ['student', 'Students only'], ['instructor', 'Instructors only']] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setBcTarget(v)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${bcTarget === v ? 'bg-primary text-white' : 'bg-slate-50 border border-slate-200 text-outline hover:text-on-surface'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Title <span className="text-red-500">*</span></label>
                <input value={bcTitle} onChange={e => setBcTitle(e.target.value)} placeholder="e.g. New courses just dropped!" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Message</label>
                <textarea value={bcBody} onChange={e => setBcBody(e.target.value)} rows={4} placeholder="Write your announcement…" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Link (optional)</label>
                <input value={bcLink} onChange={e => setBcLink(e.target.value)} placeholder="/courses or /scholarships" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className={`text-sm font-bold ${bcMsg.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{bcMsg}</span>
                <button onClick={sendBroadcast} disabled={bcSending || !bcTitle.trim()} className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-sm">send</span>
                  {bcSending ? 'Sending…' : 'Send Broadcast'}
                </button>
              </div>
            </div>

            {/* Preview */}
            {(bcTitle || bcBody) && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Preview</p>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[16px]">campaign</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{bcTitle || 'Title…'}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{bcBody || 'Your message…'}</p>
                    {bcLink && <p className="text-xs text-primary font-bold mt-1">{bcLink}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
