'use client';

import React from 'react';
import { motion , Variants } from 'framer-motion';;
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

export default function AdminDashboardPage() {
  return (
    <div className="bg-surface text-on-background font-body min-h-screen selection:bg-primary-container/30">
      {/* Top Navigation Anchor */}

      {/* Sidebar Navigation Shell */}
      <aside className="h-screen w-64 fixed left-0 top-0 pt-0 flex-col gap-2 p-4 border-r border-surface-container-highest/50 bg-surface-container-lowest/50 hidden lg:flex z-10">
        <div className="mb-6 px-2 mt-4">
          <h2 className="text-lg font-black text-on-surface uppercase tracking-widest font-headline">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-headline text-lg font-bold tracking-widest text-on-surface">Admin</span>
            </div>
          </h2>
          <p className="text-[10px] text-outline font-mono">Luminous Logic System v4.2</p>
        </div>
        <div className="space-y-1">
          <Link href="/dashboard/admin" className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-surface-container-highest/20 text-primary shadow-sm rounded-lg mx-2 font-medium transition-all duration-300 outline-none">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="#" className="group flex items-center gap-3 p-3 text-slate-500 hover:text-on-surface hover:bg-surface-container mx-2 rounded-lg transition-all duration-200 font-medium outline-none">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">gavel</span>
            <span>Moderation</span>
          </Link>
          <Link href="#" className="group flex items-center gap-3 p-3 text-slate-500 hover:text-on-surface hover:bg-surface-container mx-2 rounded-lg transition-all duration-200 font-medium outline-none">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">group</span>
            <span>User Management</span>
          </Link>
          <Link href="#" className="group flex items-center gap-3 p-3 text-slate-500 hover:text-on-surface hover:bg-surface-container mx-2 rounded-lg transition-all duration-200 font-medium outline-none">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">library_books</span>
            <span>Content</span>
          </Link>
          <Link href="/settings" className="group flex items-center gap-3 p-3 text-slate-500 hover:text-on-surface hover:bg-surface-container mx-2 rounded-lg transition-all duration-200 font-medium outline-none">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings_input_component</span>
            <span>Platform Settings</span>
          </Link>
        </div>
        <div className="mt-auto space-y-1 border-t border-surface-container-highest/50 pt-4 px-2 pb-4">
          <Link href="#" className="flex items-center gap-3 p-3 text-slate-500 hover:text-primary rounded-lg transition-colors outline-none shrink-0">
            <span className="material-symbols-outlined">help_outline</span>
            <span>Support</span>
          </Link>
          <Link href="/login" className="flex items-center gap-3 p-3 text-slate-500 hover:text-error hover:bg-error-container/10 rounded-lg transition-colors outline-none shrink-0 group">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="lg:pl-64 pt-0 min-h-screen pb-24 lg:pb-10">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
          
          {/* Platform Pulse Header */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-background tracking-tight">Platform Pulse</h1>
                <p className="text-outline mt-1 font-medium text-sm sm:text-base">Real-time ecosystem vital signs and growth metrics.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="bg-white border border-surface-container-highest px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all outline-none">
                  Export Report
                </button>
                <button className="bg-gradient-to-br from-primary to-primary-container px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-primary/30 active:scale-95 transition-all outline-none flex items-center gap-2 group">
                  <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500">refresh</span>
                  Refresh Node
                </button>
              </div>
            </div>
            
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Metric Card */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-surface-container-highest/30 border-l-4 border-l-primary-container shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-primary bg-primary-container/10 p-2 rounded-lg group-hover:scale-110 transition-transform">group</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">+12.4%</span>
                </div>
                <p className="text-outline text-xs font-semibold uppercase tracking-wider">Total Active Users</p>
                <p className="text-3xl font-headline font-bold text-on-surface mt-1">84,291</p>
              </motion.div>
              {/* Metric Card */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-surface-container-highest/30 border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-secondary bg-secondary-container/10 p-2 rounded-lg group-hover:scale-110 transition-transform">payments</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">+5.2%</span>
                </div>
                <p className="text-outline text-xs font-semibold uppercase tracking-wider">MRR (Revenue)</p>
                <p className="text-3xl font-headline font-bold text-on-surface mt-1">$412.8k</p>
              </motion.div>
              {/* Metric Card */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-surface-container-highest/30 border-l-4 border-l-tertiary shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-tertiary bg-tertiary-container/10 p-2 rounded-lg group-hover:scale-110 transition-transform">school</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">Stable</span>
                </div>
                <p className="text-outline text-xs font-semibold uppercase tracking-wider">Active Courses</p>
                <p className="text-3xl font-headline font-bold text-on-surface mt-1">1,402</p>
              </motion.div>
              {/* Metric Card */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-surface-container-highest/30 border-l-4 border-l-error shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-error bg-error-container/30 p-2 rounded-lg group-hover:scale-110 transition-transform">confirmation_number</span>
                  <span className="text-[11px] font-mono font-bold text-error bg-error-container/20 border border-error-container/50 px-2 py-1 rounded-full">High</span>
                </div>
                <p className="text-outline text-xs font-semibold uppercase tracking-wider">Open Tickets</p>
                <p className="text-3xl font-headline font-bold text-on-surface mt-1">42</p>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Main Dashboard Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* System Activity Visualization */}
            <motion.div variants={itemVariants} className="xl:col-span-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-highest/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-primary-container/15"></div>
              <div className="flex flex-wrap gap-4 justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">System Activity</h3>
                  <p className="text-outline text-sm mt-1 font-medium">Engagement frequency across 24h cycle</p>
                </div>
                <div className="relative">
                  <select className="bg-surface-container border border-surface-container-highest/50 rounded-lg text-xs font-bold text-on-surface-variant focus:ring-2 focus:ring-primary/20 py-2 pl-3 pr-8 appearance-none cursor-pointer outline-none">
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Monthly View</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">expand_more</span>
                </div>
              </div>
              
              <div className="h-64 flex items-end gap-1 sm:gap-2 relative z-10 border-b border-surface-container-highest/30 pb-2">
                {[40, 65, 85, 55, 95, 45, 75, 35, 60, 90, 40, 70, 50, 80].map((height, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.05 }}
                    className={`flex-1 rounded-t-lg transition-colors cursor-pointer relative group/bar ${
                      height > 80 ? (i % 2 === 0 ? 'bg-primary-container' : 'bg-secondary') : 'bg-surface-container hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {height * 12} reqs
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
                <span>00:00</span>
                <span>06:00</span>
                <span className="hidden sm:inline">12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </motion.div>

            {/* Platform Health */}
            <motion.div variants={itemVariants} className="xl:col-span-4 bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #00d9ff 0%, transparent 50%)' }}></div>
              <div className="relative z-10">
                <h3 className="text-xl font-headline font-bold mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_#00d9ff]"></span>
                  Platform Health
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Main Database</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">cluster-eth-01</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary-fixed tracking-wider bg-primary-fixed/10 px-2 py-1 rounded border border-primary-fixed/20 shadow-[0_0_8px_rgba(0,217,255,0.1)]">OPERATIONAL</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Edge CDN</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">global-dist-v4</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary-fixed tracking-wider bg-primary-fixed/10 px-2 py-1 rounded border border-primary-fixed/20 shadow-[0_0_8px_rgba(0,217,255,0.1)]">OPERATIONAL</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">API Gateway</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">gateway-primary</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 tracking-wider bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20 shadow-[0_0_8px_rgba(251,191,36,0.1)]">98% LOAD</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Auth Node</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">identity-svc</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary-fixed tracking-wider bg-primary-fixed/10 px-2 py-1 rounded border border-primary-fixed/20 shadow-[0_0_8px_rgba(0,217,255,0.1)]">OPERATIONAL</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-10 py-3.5 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all text-white outline-none">
                View Cloud Console
              </button>
            </motion.div>

            {/* Moderation Queue */}
            <motion.div variants={itemVariants} className="xl:col-span-5 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-highest/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-headline font-bold text-on-surface">Moderation Queue</h3>
                <span className="bg-primary-container/20 text-primary-fixed-variant border border-primary-container/30 text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider">
                  12 PENDING
                </span>
              </div>
              <div className="space-y-4">
                {/* Queue Item */}
                <div className="p-4 sm:p-5 rounded-xl border border-surface-container-highest/50 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors group">
                  <div className="flex gap-4 items-start sm:items-center flex-col sm:flex-row">
                    <img 
                      alt="Review Item Thumbnail" 
                      className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow transition-shadow" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7OnSjgElcwy6AkcippqRql1YU7iA91qGGr4bNJ3uIdHHZiA-KVXQGlJ_h9pHkuKsy_fo42JL-FDoZB-Daj6MzOV8Jx4u-O9XZaoU9xaBkLdHr72Szgeevbh6sopuMWn9P8kCoUoWn3-CxTnVhZmRy69wQC-5xCbmKgWZQFzR7rc-UyUdwB3kNd2M7-Gw7yO-pqZe5LOFhUZJdvb9x_IuywV7D9T09HmjRgcOGLpdSy6RTnXupqannbhxVsbIr2aUBa3wRYQF4m2g"
                    />
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="text-sm font-bold text-on-surface">Flagged Comment</p>
                      <p className="text-xs text-outline mt-1 line-clamp-1 italic">"This content is misleading regarding quantum..."</p>
                      <div className="flex gap-2 mt-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none sm:px-4 bg-white border border-surface-container-highest py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 active:scale-95 transition-all outline-none">Approve</button>
                        <button className="flex-1 sm:flex-none sm:px-4 bg-error-container/30 text-error py-1.5 rounded-lg text-xs font-bold hover:bg-error-container/50 border border-error-container/50 active:scale-95 transition-all outline-none">Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Queue Item */}
                <div className="p-4 sm:p-5 rounded-xl border border-surface-container-highest/50 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors group">
                  <div className="flex gap-4 items-start sm:items-center flex-col sm:flex-row">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                      <span className="material-symbols-outlined text-secondary">auto_stories</span>
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="text-sm font-bold text-on-surface">New Course Submission</p>
                      <p className="text-xs text-outline mt-1 line-clamp-1 font-medium">Deep Learning Fundamentals by Dr. Aris</p>
                      <div className="flex gap-2 mt-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none sm:px-4 bg-white border border-surface-container-highest py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 active:scale-95 transition-all outline-none">Approve</button>
                        <button className="flex-1 sm:flex-none sm:px-4 bg-surface-container py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest border border-transparent active:scale-95 transition-all outline-none">Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="#" className="block text-center mt-6 text-[11px] font-bold text-secondary uppercase tracking-widest hover:underline hover:text-secondary-fixed-variant transition-colors outline-none">
                View All Flagged Items
              </Link>
            </motion.div>

            {/* Recent Registrations Table */}
            <motion.div variants={itemVariants} className="xl:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-highest/30 overflow-hidden">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Recent User Registrations</h3>
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="border-b border-surface-container-highest/50">
                    <tr>
                      <th className="pb-4 pt-2 text-[10px] font-bold text-outline-variant uppercase tracking-widest pl-2">User</th>
                      <th className="pb-4 pt-2 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Role</th>
                      <th className="pb-4 pt-2 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Join Date</th>
                      <th className="pb-4 pt-2 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Status</th>
                      <th className="pb-4 pt-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-highest/20">
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img alt="User Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-surface-container-highest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB16zo3RGrVOeY0Bd5JW0NSXedrdG3z1skttuofI4iYX0sLdXBZflgOCMvg0ZPnpUJwiHv_BwaBFCznc91G0Z_i1WfXoTIxqAQjplE7He7aGP-oUsUzvUityEvRKXxPSqKZMHc8SRiAYWRV-6IkV1a8hhgcjG2hxk_ldjUQ4Stn0sl4sCoMVlM7pyNMRE4CKcn1_KuUNIBlFDMPbfGjO9gJjjWYXEjJZXC1ItX9xec7E3tj_uMUPcb2VLzHbpXayFnBrbkzwDaxYXo"/>
                          <div>
                            <p className="text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">Julian Veldt</p>
                            <p className="text-[10px] sm:text-[11px] text-outline mt-0.5">julian@v-tech.io</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-on-surface-variant">Student</td>
                      <td className="py-4 text-xs font-mono text-outline">2023.10.24</td>
                      <td className="py-4">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">Verified</span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button className="p-1.5 hover:bg-surface-container text-outline hover:text-on-surface rounded-lg transition-colors outline-none">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img alt="User Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-surface-container-highest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAltYcGa5n9JfH7TnQoKDFbYEXqpEgMBPxf36-KwNB1Lsmqj_lo4tHLz4qjMJ43l4IQd9Jb85Fftt-kMZ1cI7Aa-T7Ih3NF446DWdBFw3Eiw_OhmDhAzZB9iO3832Z2SR0Nvd_osoGkASsLzZT3TaodUdyFwyveNfpkU0q_GFivZDdZu9i7wLkD-giWljXrOV7LGLN24MaROT_hGmAheA8tLbkScQ_JSQyAZTXrZReMTcMpjjQXAkLXL1CzCLS8lxhCTQJLSv3mkIk"/>
                          <div>
                            <p className="text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">Sarah Jenkins</p>
                            <p className="text-[10px] sm:text-[11px] text-outline mt-0.5">s.jenkins@eth.edu</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-secondary">Instructor</td>
                      <td className="py-4 text-xs font-mono text-outline">2023.10.24</td>
                      <td className="py-4">
                        <span className="bg-tertiary-container/30 text-tertiary-fixed-dim text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-tertiary-container text-amber-700">Pending</span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button className="p-1.5 hover:bg-surface-container text-outline hover:text-on-surface rounded-lg transition-colors outline-none">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img alt="User Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-surface-container-highest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu0msTnxnOImlwSslqyPiqyjV1qphtFCaL2DdC5o2wafEBjT87befx9hquJc6K5O4b9st1yU5FpUuz49Mc3Fs1WVQjxOqdfQAtJGAeYdg9zonUnBKdbuvBxwn_Pi77iF-9SdohvEGVSCNwIDpe9iwNkR9Jru0aCMTkLJ1seCGzOKuBhJ8qsDjLtKEBbmpseBWJFSFAAOTjrFMKsGPlYP8eHqLgRgo1HUakQ-6Uc2DRNg_q1JwUIkOi_hBTWE8Ax5ZQspB2ayXeL8Y"/>
                          <div>
                            <p className="text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">Marcus Thorne</p>
                            <p className="text-[10px] sm:text-[11px] text-outline mt-0.5">mthorne@quant.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-on-surface-variant">Student</td>
                      <td className="py-4 text-xs font-mono text-outline">2023.10.23</td>
                      <td className="py-4">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">Verified</span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button className="p-1.5 hover:bg-surface-container text-outline hover:text-on-surface rounded-lg transition-colors outline-none">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Contextual FAB */}
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40">
        <button className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_4px_20px_rgba(0,104,123,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all group outline-none overflow-visible">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
          <span className="absolute right-full mr-4 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Create New Entity
          </span>
        </button>
      </div>
    </div>
  );
}
