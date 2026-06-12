'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CertData = {
  id: string;
  course_id: string;
  issued_at: string;
  courses: { title: string; category: string; instructor_id: string };
  instructor_name?: string;
};

function drawCertificate(
  canvas: HTMLCanvasElement,
  cert: CertData,
  studentName: string,
  credentialId: string
) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d1b2a');
  bg.addColorStop(1, '#003344');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative corner lines
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 3;
  const cr = 40;
  // top-left
  ctx.beginPath(); ctx.moveTo(cr, 20); ctx.lineTo(20, 20); ctx.lineTo(20, cr); ctx.stroke();
  // top-right
  ctx.beginPath(); ctx.moveTo(W - cr, 20); ctx.lineTo(W - 20, 20); ctx.lineTo(W - 20, cr); ctx.stroke();
  // bottom-left
  ctx.beginPath(); ctx.moveTo(cr, H - 20); ctx.lineTo(20, H - 20); ctx.lineTo(20, H - cr); ctx.stroke();
  // bottom-right
  ctx.beginPath(); ctx.moveTo(W - cr, H - 20); ctx.lineTo(W - 20, H - 20); ctx.lineTo(W - 20, H - cr); ctx.stroke();

  // Thin gold border inset
  ctx.strokeStyle = 'rgba(0,180,216,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(35, 35, W - 70, H - 70);

  // Logo / Platform name
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillStyle = '#00b4d8';
  ctx.textAlign = 'center';
  ctx.fillText('جامعة فايرير السعودية', W / 2, 90);

  // Decorative divider
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 100);
  ctx.lineTo(W / 2 + 120, 100);
  ctx.stroke();

  // "Certificate of Completion"
  ctx.font = '28px "Georgia", serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Certificate of Completion', W / 2, 155);

  // "This certifies that"
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('This certifies that', W / 2, 200);

  // Student Name
  ctx.font = 'bold 44px "Georgia", serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(studentName, W / 2, 265);

  // underline name
  const nameWidth = ctx.measureText(studentName).width;
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameWidth / 2, 275);
  ctx.lineTo(W / 2 + nameWidth / 2, 275);
  ctx.stroke();

  // "has successfully completed"
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('has successfully completed the course', W / 2, 315);

  // Course title
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillStyle = '#00d4f0';
  // wrap long titles
  const words = cert.courses.title.split(' ');
  let line = '';
  let lineY = 360;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > W - 120 && line) {
      ctx.fillText(line.trim(), W / 2, lineY);
      line = word + ' ';
      lineY += 36;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), W / 2, lineY);

  // Instructor
  if (cert.instructor_name) {
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(`Instructed by ${cert.instructor_name}`, W / 2, lineY + 42);
  }

  const bottomY = H - 70;

  // Issued date (left)
  ctx.textAlign = 'left';
  ctx.font = '11px "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('ISSUED', 60, bottomY - 16);
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 60, bottomY);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2, bottomY - 30); ctx.lineTo(W / 2, bottomY + 10); ctx.stroke();

  // Credential ID (right)
  ctx.textAlign = 'right';
  ctx.font = '11px "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('CREDENTIAL ID', W - 60, bottomY - 16);
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = '#00b4d8';
  ctx.fillText(credentialId, W - 60, bottomY);

  ctx.textAlign = 'center';
}

function CertificateCard({ cert, studentName }: { cert: CertData; studentName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const credentialId = `FAIR-${cert.course_id.slice(0, 4).toUpperCase()}-${new Date(cert.issued_at).getFullYear()}-${cert.id.slice(-4).toUpperCase()}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 560;
    drawCertificate(canvas, cert, studentName || 'Student', credentialId);
  }, [cert, studentName, credentialId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${cert.courses.title.replace(/\s+/g, '-')}-certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.share) {
        const file = new File([blob], 'certificate.png', { type: 'image/png' });
        await navigator.share({ title: `${cert.courses.title} Certificate`, files: [file] }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Page URL copied to clipboard!');
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-lg transition-shadow group"
    >
      <div className="relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto block" style={{ aspectRatio: '800/560' }} />
      </div>
      <div className="p-6">
        <h3 className="font-headline font-bold text-on-surface text-lg mb-1">{cert.courses.title}</h3>
        <p className="text-xs text-outline mb-4">
          {cert.instructor_name ? `By ${cert.instructor_name} · ` : ''}
          {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex items-center gap-2 text-xs text-outline font-mono mb-5 bg-surface-container-low px-3 py-2 rounded-lg">
          <span className="material-symbols-outlined text-sm text-primary">verified</span>
          {credentialId}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Download
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-outline-variant/20 text-on-surface-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<CertData[]>([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setStudentName(profile?.full_name || user.email?.split('@')[0] || 'Student');

      const { data } = await supabase
        .from('certificates')
        .select(`*, courses (title, category, instructor_id)`)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (data && data.length > 0) {
        // Fetch instructor names
        const instructorIds = [...new Set(data.map((c: any) => c.courses?.instructor_id).filter(Boolean))];
        const { data: instructors } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', instructorIds);

        const instructorMap: Record<string, string> = {};
        instructors?.forEach((p: any) => { instructorMap[p.id] = p.full_name; });

        setCerts(data.map((c: any) => ({
          ...c,
          instructor_name: instructorMap[c.courses?.instructor_id] || '',
        })));
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-primary font-bold animate-pulse">Loading certificates...</div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-background min-h-screen">
      <main className="pt-8 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-3xl text-primary">workspace_premium</span>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-on-background">My Certificates</h1>
          </div>
          <p className="text-on-surface-variant">
            {certs.length > 0
              ? `You've earned ${certs.length} certificate${certs.length !== 1 ? 's' : ''}. Click download to save as PNG.`
              : 'Complete a course to earn your first certificate.'}
          </p>
        </motion.header>

        {certs.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-7xl text-outline/20 block mb-4">workspace_premium</span>
            <h2 className="text-xl font-bold text-on-surface-variant mb-2">No certificates yet</h2>
            <p className="text-sm text-outline mb-6">Finish a course to automatically receive your certificate.</p>
            <Link href="/courses" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map(cert => (
              <CertificateCard key={cert.id} cert={cert} studentName={studentName} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
