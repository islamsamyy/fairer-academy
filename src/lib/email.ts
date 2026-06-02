import { supabase } from '@/lib/supabase';

/**
 * Best-effort transactional email via the `send-email` Edge Function (Resend).
 * Never throws — if email isn't configured (no RESEND_API_KEY) it silently no-ops,
 * so core flows (enrollment, broadcast) are never blocked by email.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<void> {
  try {
    await supabase.functions.invoke('send-email', { body: { to, subject, html } });
  } catch (err) {
    // swallow — email is non-critical
    console.warn('sendEmail failed (non-fatal):', err);
  }
}

export function basicEmail(title: string, body: string, ctaUrl?: string, ctaText?: string): string {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <h1 style="color:#00687b;font-size:20px;margin:0 0 8px">Fairer Academy</h1>
    <div style="height:2px;background:#00b4d8;width:48px;margin-bottom:16px"></div>
    <h2 style="font-size:18px;color:#171c21;margin:0 0 12px">${title}</h2>
    <p style="color:#404a52;line-height:1.6;font-size:14px">${body}</p>
    ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:16px;background:#00687b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:bold;font-size:14px">${ctaText ?? 'Open'}</a>` : ''}
    <p style="color:#90a0a8;font-size:12px;margin-top:24px">You're receiving this because you have an account on Fairer Academy.</p>
  </div>`;
}
