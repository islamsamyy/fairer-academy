'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AccessDenied from '@/components/AccessDenied';
import { useLanguage } from '@/context/LanguageContext';

type Tab = 'overview' | 'users' | 'courses' | 'enrollments' | 'orders' | 'reviews' | 'certificates' | 'forum' | 'scholarships' | 'support' | 'broadcast' | 'blog';

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
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
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

  // Blog tab
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogView, setBlogView] = useState<'list' | 'editor'>('list');
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blogSaving, setBlogSaving] = useState(false);
  const BLOG_CATEGORIES = ['General', 'Technology', 'Business', 'Design', 'Career', 'Announcement'];
  const emptyBlog = { title: '', slug: '', excerpt: '', content: '', cover_url: '', category: 'General', tags: '', is_published: false };
  const [blogForm, setBlogForm] = useState(emptyBlog);

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

  const loadBlogs = useCallback(async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: role } = await supabase.rpc('get_my_role');
      if (role !== 'admin') { setAccessDenied(role || 'student'); setLoading(false); return; }
      await Promise.all([
        loadOverview(), loadUsers(), loadCourses(), loadEnrollments(),
        loadOrders(), loadReviews(), loadCertificates(), loadThreads(),
        loadScholarships(), loadMessages(), loadBlogs(),
      ]);
      setLoading(false);
    }
    init();
  }, [router, loadOverview, loadUsers, loadCourses, loadEnrollments, loadOrders, loadReviews, loadCertificates, loadThreads, loadScholarships, loadMessages, loadBlogs]);

  // ── Actions ──
  const changeUserRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(t('admin.roleUpdated'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const banUser = async (userId: string, banned: boolean) => {
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ banned: !banned }).eq('id', userId);
    if (!error) {
      setUsers(us => us.map(u => u.id === userId ? { ...u, banned: !banned } : u));
      showToast(!banned ? t('admin.userBanned') : t('admin.userUnbanned'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const toggleCoursePublish = async (courseId: string, current: boolean) => {
    setActionLoading(courseId);
    const { error } = await supabase.from('courses').update({ is_published: !current }).eq('id', courseId);
    if (!error) {
      setCourses(cs => cs.map(c => c.id === courseId ? { ...c, is_published: !current } : c));
      showToast(current ? t('admin.courseUnpublished') : t('admin.coursePublished'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm(t('admin.confirmDeleteCourse'))) return;
    setActionLoading(courseId);
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) {
      setCourses(cs => cs.filter(c => c.id !== courseId));
      await loadOverview();
      showToast(t('admin.courseDeleted'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setReviews(rs => rs.filter(r => r.id !== reviewId));
      showToast(t('admin.reviewRemoved'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteThread = async (threadId: string) => {
    if (!confirm(t('admin.confirmDeleteThread'))) return;
    setActionLoading(threadId);
    const { error } = await supabase.from('forum_threads').delete().eq('id', threadId);
    if (!error) {
      setThreads(ts => ts.filter(t => t.id !== threadId));
      showToast(t('admin.threadDeleted'));
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
      showToast(next === 'resolved' ? t('admin.markedResolved') : t('admin.reopened'));
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
      showToast(t('admin.schCreated'));
    } else showToast(error.message, 'error');
    setSchSaving(false);
  };

  const toggleScholarship = async (id: string, active: boolean) => {
    setActionLoading(id);
    const { error } = await supabase.from('scholarships').update({ is_active: !active }).eq('id', id);
    if (!error) {
      setScholarships(s => s.map(x => x.id === id ? { ...x, is_active: !active } : x));
      showToast(!active ? t('admin.schActivated') : t('admin.schDeactivated'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const deleteScholarship = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteScholarship'))) return;
    setActionLoading(id);
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (!error) {
      setScholarships(s => s.filter(x => x.id !== id));
      showToast(t('admin.schDeleted'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const sendBroadcast = async () => {
    if (!bcTitle.trim()) { setBcMsg(t('admin.titleRequired')); return; }
    setBcSending(true); setBcMsg('');
    try {
      let q = supabase.from('profiles').select('id');
      if (bcTarget !== 'all') q = q.eq('role', bcTarget);
      const { data: targets, error: tErr } = await q;
      if (tErr) throw tErr;
      if (!targets || targets.length === 0) { setBcMsg(t('admin.noRecipients')); setBcSending(false); return; }
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
      showToast(`${t('admin.sendBroadcast')} → ${targets.length}`);
    } catch (err: any) {
      setBcMsg('Error: ' + err.message);
    } finally {
      setBcSending(false);
    }
  };

  // ── Blog actions ──
  const openNewBlog = () => {
    setBlogForm(emptyBlog);
    setEditingBlog(null);
    setBlogView('editor');
  };

  const openEditBlog = (post: any) => {
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_url: post.cover_url || '',
      category: post.category,
      tags: (post.tags || []).join(', '),
      is_published: post.is_published,
    });
    setEditingBlog(post);
    setBlogView('editor');
  };

  const saveBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.slug.trim()) {
      showToast(t('admin.titleSlugRequired'), 'error'); return;
    }
    setBlogSaving(true);
    const payload = {
      title: blogForm.title.trim(),
      slug: blogForm.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      excerpt: blogForm.excerpt.trim() || null,
      content: blogForm.content,
      cover_url: blogForm.cover_url.trim() || null,
      category: blogForm.category,
      tags: blogForm.tags ? blogForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      is_published: blogForm.is_published,
    };
    let error;
    if (editingBlog) {
      ({ error } = await supabase.from('blogs').update(payload).eq('id', editingBlog.id));
    } else {
      ({ error } = await supabase.from('blogs').insert(payload));
    }
    if (!error) {
      await loadBlogs();
      setBlogView('list');
      showToast(editingBlog ? t('admin.postUpdated') : t('admin.postCreated'));
    } else {
      showToast(error.message, 'error');
    }
    setBlogSaving(false);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm(t('admin.confirmDeletePost'))) return;
    setActionLoading(id);
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) {
      setBlogs(bs => bs.filter(b => b.id !== id));
      showToast(t('admin.postDeleted'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const toggleBlogPublish = async (id: string, current: boolean) => {
    setActionLoading(id);
    const { error } = await supabase.from('blogs').update({ is_published: !current }).eq('id', id);
    if (!error) {
      setBlogs(bs => bs.map(b => b.id === id ? { ...b, is_published: !current } : b));
      showToast(!current ? 'Post published' : 'Post unpublished');
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);

  const revokeCertificate = async (certId: string) => {
    if (!confirm(t('admin.confirmRevoke'))) return;
    setActionLoading(certId);
    const { error } = await supabase.from('certificates').delete().eq('id', certId);
    if (!error) {
      setCertificates(cs => cs.filter(c => c.id !== certId));
      showToast(t('admin.certRevoked'));
    } else showToast(error.message, 'error');
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
        </div>
        <p className="text-primary font-bold">{t('admin.loading')}</p>
      </div>
    </div>
  );

  if (accessDenied) return <AccessDenied requiredRole="admin" currentRole={accessDenied} />;

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
    { id: 'overview', icon: 'dashboard', label: t('admin.tabOverview') },
    { id: 'users', icon: 'group', label: t('admin.tabUsers'), badge: stats.users },
    { id: 'courses', icon: 'library_books', label: t('admin.tabCourses'), badge: stats.courses },
    { id: 'enrollments', icon: 'school', label: t('admin.tabEnrollments'), badge: stats.enrollments },
    { id: 'orders', icon: 'receipt', label: t('admin.tabOrders'), badge: stats.orders },
    { id: 'reviews', icon: 'reviews', label: t('admin.tabReviews'), badge: stats.reviews },
    { id: 'certificates', icon: 'workspace_premium', label: t('admin.tabCertificates'), badge: stats.certificates },
    { id: 'forum', icon: 'forum', label: t('admin.tabForum'), badge: threads.length },
    { id: 'scholarships', icon: 'volunteer_activism', label: t('admin.tabScholarships'), badge: scholarships.length },
    { id: 'support', icon: 'inbox', label: t('admin.tabSupport'), badge: stats.openTickets },
    { id: 'broadcast', icon: 'campaign', label: t('admin.tabBroadcast') },
    { id: 'blog', icon: 'article', label: t('admin.tabBlog'), badge: blogs.length },
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
          <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mb-1">{t('admin.consoleBadge')}</p>
          <h2 className="text-sm font-black text-white leading-tight">جامعة فايرير السعودية</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-white/40 font-mono">{t('admin.allSystemsLive')}</span>
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
            <span className="material-symbols-outlined text-[16px]">home</span> {t('admin.viewSite')}
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-white/40 hover:text-white text-xs font-medium transition-colors rounded-lg hover:bg-white/8">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> {t('admin.backToApp')}
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
                  <p className="text-white/50 text-xs font-mono font-bold uppercase tracking-widest mb-1">{t('admin.consoleBadge')}</p>
                  <h1 className="text-3xl font-heading font-black text-white tracking-tight">{t('admin.platformOverview')}</h1>
                  <p className="text-white/50 text-sm mt-1">جامعة فايرير السعودية — {t('admin.liveStatistics')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-white/70 text-xs font-mono font-bold">{t('admin.allSystemsOperational')}</span>
                  </div>
                  <button onClick={() => { loadOverview(); showToast(t('admin.statsRefreshed')); }} className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-primary/30">
                    <span className="material-symbols-outlined text-sm">refresh</span> {t('admin.refresh')}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label={t('admin.totalUsers')} value={stats.users} icon="group" color="text-blue-600" bg="bg-blue-50" onClick={() => setTab('users')} />
              <StatCard label={t('admin.tabCourses')} value={stats.courses} icon="library_books" color="text-primary" bg="bg-primary/10" onClick={() => setTab('courses')} />
              <StatCard label={t('admin.tabEnrollments')} value={stats.enrollments} icon="school" color="text-emerald-600" bg="bg-emerald-50" onClick={() => setTab('enrollments')} />
              <StatCard label={t('admin.totalRevenue')} value={`$${stats.revenue.toLocaleString()}`} icon="payments" color="text-violet-600" bg="bg-violet-50" onClick={() => setTab('orders')} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label={t('admin.certificatesIssued')} value={stats.certificates} icon="workspace_premium" color="text-amber-600" bg="bg-amber-50" onClick={() => setTab('certificates')} />
              <StatCard label={t('admin.tabReviews')} value={stats.reviews} icon="star" color="text-pink-600" bg="bg-pink-50" onClick={() => setTab('reviews')} />
              <StatCard label={t('admin.forumThreads')} value={threads.length} icon="forum" color="text-cyan-600" bg="bg-cyan-50" onClick={() => setTab('forum')} />
              <StatCard label={t('admin.openTickets')} value={stats.openTickets} icon="inbox" color="text-red-600" bg="bg-red-50" onClick={() => setTab('support')} />
            </div>

            {/* Recent rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent users */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                    {t('admin.recentUsers')}
                  </h2>
                  <button onClick={() => setTab('users')} className="text-xs text-primary font-bold hover:underline">{t('admin.viewAll')}</button>
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
                    {t('admin.recentEnrollments')}
                  </h2>
                  <button onClick={() => setTab('enrollments')} className="text-xs text-primary font-bold hover:underline">{t('admin.viewAll')}</button>
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
              <h1 className="text-2xl font-bold text-on-surface">{t('admin.userMgmt')} <span className="text-outline font-normal text-lg">({filteredUsers.length})</span></h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  {(['all', 'admin', 'instructor', 'student'] as const).map(r => (
                    <button key={r} onClick={() => setUserRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${userRoleFilter === r ? 'bg-primary text-white' : 'text-outline hover:text-on-surface'}`}>{r}</button>
                  ))}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder={t('admin.searchByName')} className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-56" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">{t('admin.colUser')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colRole')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colJoined')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colChangeRole')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colActions')}</th>
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
                            <p className="font-medium text-on-surface">{u.full_name || '—'} {u.banned && <span className="text-red-500 text-xs">({t('admin.banned')})</span>}</p>
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
                          <Link href={`/${u.username || '#'}`} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">{t('admin.profileBtn')}</Link>
                          <button onClick={() => banUser(u.id, u.banned)} disabled={actionLoading === u.id} className={`text-xs px-2 py-1 rounded-lg font-medium disabled:opacity-50 ${u.banned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {u.banned ? t('admin.unban') : t('admin.ban')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="text-center py-12 text-outline">{t('admin.noUsers')}</div>}
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        {tab === 'courses' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="text-2xl font-bold text-on-surface">{t('admin.courseMgmt')} <span className="text-outline font-normal text-lg">({filteredCourses.length})</span></h1>
              <div className="flex gap-2 items-center flex-wrap">
                {(['all', 'published', 'draft'] as const).map(f => (
                  <button key={f} onClick={() => setCourseFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${courseFilter === f ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-outline hover:text-on-surface'}`}>{f}</button>
                ))}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                  <input value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder={t('admin.searchCourses')} className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-48" />
                </div>
                <Link href="/courses/create" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span> {t('admin.newBtn')}
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">{t('admin.colCourse')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colInstructor')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colPrice')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colStudents')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colStatus')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colActions')}</th>
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
                          {c.is_published ? t('admin.published') : t('admin.draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button onClick={() => toggleCoursePublish(c.id, c.is_published)} disabled={actionLoading === c.id} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium disabled:opacity-50">
                            {c.is_published ? t('admin.unpublish') : t('admin.publish')}
                          </button>
                          <Link href={`/courses/${c.id}/edit`} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium">{t('admin.edit')}</Link>
                          <Link href={`/courses/${c.id}`} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">{t('admin.view')}</Link>
                          <button onClick={() => deleteCourse(c.id)} disabled={actionLoading === c.id} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">{t('admin.delete')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCourses.length === 0 && <div className="text-center py-12 text-outline">{t('admin.noCourses')}</div>}
            </div>
          </div>
        )}

        {/* ── ENROLLMENTS ── */}
        {tab === 'enrollments' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">{t('admin.tabEnrollments')} <span className="text-outline font-normal text-lg">({enrollments.length})</span></h1>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">{t('admin.colStudent')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colCourse')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colProgress')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colEnrolled')}</th>
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
              {enrollments.length === 0 && <div className="text-center py-12 text-outline">{t('admin.noEnrollments')}</div>}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-on-surface">{t('admin.tabOrders')} <span className="text-outline font-normal text-lg">({orders.length})</span></h1>
              <div className="px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl text-violet-700 font-bold text-sm">
                {t('admin.totalRevenueLabel')} ${stats.revenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">{t('admin.colStudent')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colCourse')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colAmount')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colStatus')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colDate')}</th>
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
              {orders.length === 0 && <div className="text-center py-12 text-outline">{t('admin.noOrders')}</div>}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">{t('admin.reviewMod')} <span className="text-outline font-normal text-lg">({reviews.length})</span></h1>
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
                    <p className="text-xs text-outline mb-2">{t('admin.reviewOn')} <Link href={`/courses/${r.course_id}`} className="font-medium text-primary hover:underline">{r.courses?.title}</Link></p>
                    {r.title && <p className="text-sm font-bold text-on-surface mb-1">{r.title}</p>}
                    <p className="text-sm text-on-surface-variant">{r.comment}</p>
                  </div>
                  <button onClick={() => deleteReview(r.id)} disabled={actionLoading === r.id} className="flex-shrink-0 p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete review">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
              {reviews.length === 0 && <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">{t('admin.noReviews')}</div>}
            </div>
          </div>
        )}

        {/* ── CERTIFICATES ── */}
        {tab === 'certificates' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">{t('admin.tabCertificates')} <span className="text-outline font-normal text-lg">({certificates.length})</span></h1>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3">{t('admin.colStudent')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colCourse')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colIssued')}</th>
                    <th className="text-left px-6 py-3">{t('admin.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {certificates.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{c.profiles?.full_name || '—'}</td>
                      <td className="px-6 py-4 text-on-surface-variant max-w-xs truncate">{c.courses?.title || '—'}</td>
                      <td className="px-6 py-4 text-outline text-xs font-mono">{new Date(c.issued_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => revokeCertificate(c.id)} disabled={actionLoading === c.id} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">{t('admin.revoke')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {certificates.length === 0 && <div className="text-center py-12 text-outline">{t('admin.noCertificates')}</div>}
            </div>
          </div>
        )}

        {/* ── FORUM ── */}
        {tab === 'forum' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">{t('admin.forumMod')} <span className="text-outline font-normal text-lg">({threads.length})</span></h1>
            <div className="space-y-3">
              {threads.map(thread => (
                <div key={thread.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-sm text-on-surface">{thread.title}</p>
                      <span className="text-xs text-outline font-mono">{new Date(thread.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-outline mb-2">{t('admin.by')} <span className="text-on-surface-variant font-medium">{thread.profiles?.full_name || 'User'}</span> · {thread.forum_replies?.length || 0} {t('admin.replies')} · {thread.upvotes || 0} {t('admin.upvotes')}</p>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{thread.body}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/support/community/${thread.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-center">{t('admin.view')}</Link>
                    <button onClick={() => deleteThread(thread.id)} disabled={actionLoading === thread.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">{t('admin.delete')}</button>
                  </div>
                </div>
              ))}
              {threads.length === 0 && <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">{t('admin.noThreads')}</div>}
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS ── */}
        {tab === 'scholarships' && (
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">{t('admin.tabScholarships')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 h-fit">
                <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
                  {t('admin.newScholarship')}
                </h2>
                <div className="space-y-3">
                  <input value={schForm.title} onChange={e => setSchForm({ ...schForm, title: e.target.value })} placeholder={`${t('admin.titleLabel')} *`} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <textarea value={schForm.description} onChange={e => setSchForm({ ...schForm, description: e.target.value })} placeholder={t('admin.excerptLabel')} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={schForm.amount} onChange={e => setSchForm({ ...schForm, amount: e.target.value })} type="number" placeholder={t('admin.colAmount')} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input value={schForm.seats} onChange={e => setSchForm({ ...schForm, seats: e.target.value })} type="number" min="1" placeholder={t('admin.seat')} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs text-outline font-bold uppercase">{t('admin.schDeadline')}</label>
                    <input value={schForm.deadline} onChange={e => setSchForm({ ...schForm, deadline: e.target.value })} type="date" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1" />
                  </div>
                  <button onClick={createScholarship} disabled={schSaving || !schForm.title.trim()} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>
                    {schSaving ? t('admin.creating') : t('admin.createScholarship')}
                  </button>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-3">
                {scholarships.length === 0 ? (
                  <div className="text-center py-12 text-outline bg-white rounded-2xl border border-slate-200/60">{t('admin.noScholarships')}</div>
                ) : scholarships.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-on-surface">{s.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.is_active ? t('admin.active') : t('admin.inactive')}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">{s.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-outline font-mono">
                          {s.amount != null && <span className="text-violet-600 font-bold">${Number(s.amount).toLocaleString()}</span>}
                          <span>{s.seats} {s.seats !== 1 ? t('admin.seats') : t('admin.seat')}</span>
                          {s.deadline && <span>{t('admin.due')} {new Date(s.deadline).toLocaleDateString()}</span>}
                          <span className="text-primary font-bold">{s.scholarship_applications?.length || 0} {(s.scholarship_applications?.length || 0) !== 1 ? t('admin.applicants') : t('admin.applicant')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => toggleScholarship(s.id, s.is_active)} disabled={actionLoading === s.id} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium disabled:opacity-50">
                          {s.is_active ? t('admin.deactivate') : t('admin.activate')}
                        </button>
                        <button onClick={() => deleteScholarship(s.id)} disabled={actionLoading === s.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">{t('admin.delete')}</button>
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
                <h1 className="text-xl font-bold text-on-surface">{t('admin.supportInbox')}</h1>
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
                    <p className="text-xs text-outline truncate mb-1">{m.subject || t('admin.noSubject')}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{m.message}</p>
                    <p className="text-[10px] text-outline font-mono mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
                {filteredMessages.length === 0 && <div className="text-center py-8 text-outline text-sm">{t('admin.noMessages')}</div>}
              </div>
            </div>

            {/* Right: selected message */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              {selectedMsg ? (
                <>
                  <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-on-surface text-lg">{selectedMsg.subject || 'Support Request'}</h2>
                      <p className="text-sm text-outline mt-1">{t('admin.from')} <span className="text-on-surface font-medium">{selectedMsg.name}</span> · <a href={`mailto:${selectedMsg.email}`} className="text-primary hover:underline">{selectedMsg.email}</a></p>
                      <p className="text-xs text-outline font-mono mt-1">{new Date(selectedMsg.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject || 'Your message')}&body=${encodeURIComponent('\n\n---\nOriginal message:\n' + selectedMsg.message)}`}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-bold flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">reply</span> {t('admin.replyByEmail')}
                      </a>
                      <button onClick={() => resolveMessage(selectedMsg.id, selectedMsg.status)} disabled={actionLoading === selectedMsg.id} className={`px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-1 transition-colors ${selectedMsg.status === 'resolved' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                        <span className="material-symbols-outlined text-[16px]">{selectedMsg.status === 'resolved' ? 'refresh' : 'check_circle'}</span>
                        {selectedMsg.status === 'resolved' ? t('admin.reopen') : t('admin.resolve')}
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
                    <p className="text-sm font-medium">{t('admin.selectMessage')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BROADCAST ── */}
        {tab === 'broadcast' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-on-surface mb-2">{t('admin.broadcastTitle')}</h1>
            <p className="text-sm text-outline mb-6">{t('admin.broadcastSubtitle')}</p>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">{t('admin.recipients')}</label>
                <div className="flex gap-2">
                  {([['all', t('admin.allUsers')], ['student', t('admin.studentsOnly')], ['instructor', t('admin.instructorsOnly')]] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setBcTarget(v)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${bcTarget === v ? 'bg-primary text-white' : 'bg-slate-50 border border-slate-200 text-outline hover:text-on-surface'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">{t('admin.bcTitleLabel')} <span className="text-red-500">*</span></label>
                <input value={bcTitle} onChange={e => setBcTitle(e.target.value)} placeholder="e.g. New courses just dropped!" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">{t('admin.bcMessageLabel')}</label>
                <textarea value={bcBody} onChange={e => setBcBody(e.target.value)} rows={4} placeholder="Write your announcement…" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">{t('admin.bcLinkLabel')}</label>
                <input value={bcLink} onChange={e => setBcLink(e.target.value)} placeholder="/courses or /scholarships" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className={`text-sm font-bold ${bcMsg.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{bcMsg}</span>
                <button onClick={sendBroadcast} disabled={bcSending || !bcTitle.trim()} className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-sm">send</span>
                  {bcSending ? t('admin.sending') : t('admin.sendBroadcast')}
                </button>
              </div>
            </div>

            {/* Preview */}
            {(bcTitle || bcBody) && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">{t('admin.preview')}</p>
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

        {/* ── BLOG ── */}
        {tab === 'blog' && (
          <div>
            {blogView === 'list' ? (
              <>
                {/* List header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h1 className="text-2xl font-bold text-on-surface">
                    {t('admin.blogPosts')} <span className="text-outline font-normal text-lg">({blogs.length})</span>
                  </h1>
                  <div className="flex items-center gap-3">
                    <Link href="/blog" target="_blank" className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">open_in_new</span> {t('admin.viewBlog')}
                    </Link>
                    <button
                      onClick={openNewBlog}
                      className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 flex items-center gap-1 shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> {t('admin.newPost')}
                    </button>
                  </div>
                </div>

                {/* Posts table */}
                {blogs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-outline mb-4 block">article</span>
                    <p className="text-outline font-medium mb-4">{t('admin.noBlogPosts')}</p>
                    <button onClick={openNewBlog} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90">{t('admin.writeFirstPost')}</button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-outline uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-6 py-3">{t('admin.colTitle')}</th>
                          <th className="text-left px-6 py-3">{t('admin.colCategory')}</th>
                          <th className="text-left px-6 py-3">{t('admin.colViews')}</th>
                          <th className="text-left px-6 py-3">{t('admin.colStatus')}</th>
                          <th className="text-left px-6 py-3">{t('admin.colDate')}</th>
                          <th className="text-left px-6 py-3">{t('admin.colActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {blogs.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-on-surface line-clamp-1 max-w-xs">{b.title}</p>
                              <p className="text-xs text-outline font-mono mt-0.5">/blog/{b.slug}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{b.category}</span>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-outline">{b.views.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {b.is_published ? t('admin.published') : t('admin.draft')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-outline text-xs font-mono">{new Date(b.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button onClick={() => openEditBlog(b)} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium">{t('admin.edit')}</button>
                                <button onClick={() => toggleBlogPublish(b.id, b.is_published)} disabled={actionLoading === b.id} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium disabled:opacity-50">
                                  {b.is_published ? t('admin.unpublish') : t('admin.publish')}
                                </button>
                                {b.is_published && (
                                  <Link href={`/blog/${b.slug}`} target="_blank" className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">{t('admin.view')}</Link>
                                )}
                                <button onClick={() => deleteBlog(b.id)} disabled={actionLoading === b.id} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50">{t('admin.delete')}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              /* ── Editor ── */
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setBlogView('list')} className="flex items-center gap-1 text-outline hover:text-on-surface text-sm font-bold transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> {t('admin.backToPosts')}
                  </button>
                  <h1 className="text-2xl font-bold text-on-surface">{editingBlog ? t('admin.editPost') : t('admin.newPostTitle')}</h1>
                  <div className="ml-auto flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setBlogForm(f => ({ ...f, is_published: !f.is_published }))}
                        className={`w-10 h-6 rounded-full transition-colors relative ${blogForm.is_published ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${blogForm.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-sm font-bold">{blogForm.is_published ? t('admin.published') : t('admin.draft')}</span>
                    </label>
                    <button
                      onClick={saveBlog}
                      disabled={blogSaving}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      {blogSaving ? t('admin.saving') : t('admin.savePost')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Main editor */}
                  <div className="xl:col-span-2 space-y-5">
                    {/* Title */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{t('admin.titleLabel')} *</label>
                      <input
                        value={blogForm.title}
                        onChange={e => setBlogForm(f => ({
                          ...f,
                          title: e.target.value,
                          slug: editingBlog ? f.slug : autoSlug(e.target.value),
                        }))}
                        placeholder="Your article title…"
                        className="w-full text-2xl font-bold border-0 outline-none text-on-surface placeholder:text-outline/40 bg-transparent"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{t('admin.excerptLabel')}</label>
                      <textarea
                        value={blogForm.excerpt}
                        onChange={e => setBlogForm(f => ({ ...f, excerpt: e.target.value }))}
                        placeholder="A short summary shown in the blog listing and SEO…"
                        rows={3}
                        className="w-full text-sm border-0 outline-none text-on-surface-variant placeholder:text-outline/40 bg-transparent resize-none leading-relaxed"
                      />
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-outline uppercase tracking-wider">{t('admin.contentLabel')} *</label>
                        <div className="flex items-center gap-1 text-[10px] text-outline font-mono bg-slate-50 px-2 py-1 rounded-lg">
                          {t('admin.supportsMarkdown')}
                        </div>
                      </div>
                      {/* Toolbar */}
                      <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-slate-100">
                        {[
                          { label: 'H1', insert: '# ', title: 'Heading 1' },
                          { label: 'H2', insert: '## ', title: 'Heading 2' },
                          { label: 'H3', insert: '### ', title: 'Heading 3' },
                          { label: 'B', insert: '**text**', title: 'Bold' },
                          { label: 'I', insert: '*text*', title: 'Italic' },
                          { label: '`', insert: '`code`', title: 'Inline code' },
                          { label: '—', insert: '\n---\n', title: 'Divider' },
                          { label: '>', insert: '> ', title: 'Blockquote' },
                          { label: '• ', insert: '- ', title: 'List item' },
                          { label: '🖼', insert: '![alt](url)', title: 'Image' },
                          { label: '🔗', insert: '[text](url)', title: 'Link' },
                        ].map(t => (
                          <button
                            key={t.label}
                            title={t.title}
                            onClick={() => setBlogForm(f => ({ ...f, content: f.content + t.insert }))}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 text-on-surface transition-colors"
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={blogForm.content}
                        onChange={e => setBlogForm(f => ({ ...f, content: e.target.value }))}
                        placeholder={`Write your article here…\n\nSupports Markdown:\n# Heading 1\n## Heading 2\n**bold** *italic* \`code\`\n> blockquote\n- list item\n\nOr paste raw HTML.`}
                        rows={24}
                        className="w-full text-sm border-0 outline-none text-on-surface placeholder:text-outline/30 bg-transparent resize-y leading-relaxed font-mono"
                      />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-5">
                    {/* Slug */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{t('admin.slugLabel')} *</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-outline font-mono">/blog/</span>
                        <input
                          value={blogForm.slug}
                          onChange={e => setBlogForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                          placeholder="my-article-slug"
                          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                        />
                      </div>
                    </div>

                    {/* Cover image */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{t('admin.coverImageLabel')}</label>
                      <input
                        value={blogForm.cover_url}
                        onChange={e => setBlogForm(f => ({ ...f, cover_url: e.target.value }))}
                        placeholder="https://…"
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {blogForm.cover_url && (
                        <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-100">
                          <img src={blogForm.cover_url} alt="Cover preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{t('admin.categoryLabel')}</label>
                      <select
                        value={blogForm.category}
                        onChange={e => setBlogForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {BLOG_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                      <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{t('admin.tagsLabel')} <span className="text-outline/50 normal-case">{t('admin.tagsHint')}</span></label>
                      <input
                        value={blogForm.tags}
                        onChange={e => setBlogForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="e.g. react, tutorial, tips"
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {blogForm.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {blogForm.tags.split(',').filter(t => t.trim()).map(t => (
                            <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">#{t.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Live preview link */}
                    {editingBlog?.is_published && (
                      <Link href={`/blog/${blogForm.slug}`} target="_blank" className="block text-center w-full py-2.5 rounded-xl border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">open_in_new</span>
                        {t('admin.viewLivePost')}
                      </Link>
                    )}

                    <button
                      onClick={saveBlog}
                      disabled={blogSaving}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                      {blogSaving ? t('admin.saving') : editingBlog ? t('admin.updatePost') : t('admin.publishPost')}
                    </button>
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
