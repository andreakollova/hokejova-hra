import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Apple JWT secret expiry reminder (generated 2026-10-24, expires ~2027-04-22)
  const appleJwtExpiry = new Date('2027-04-22');
  const daysUntilExpiry = Math.floor((appleJwtExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 14 && daysUntilExpiry > 0) {
    await sendSlackMessage(`⚠️ *Apple Sign-In JWT expires in ${daysUntilExpiry} days!*\nGenerate a new one in Supabase → Authentication → Providers → Apple.`);
  } else if (daysUntilExpiry <= 0) {
    await sendSlackMessage(`🚨 *Apple Sign-In JWT has EXPIRED!* Users cannot sign in with Apple until you generate a new secret.`);
  }

  // --- Auto-cleanup: delete page_views older than 90 days ---
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { count: deletedViews } = await supabase
    .from('page_views')
    .delete({ count: 'exact' })
    .lt('created_at', ninetyDaysAgo);

  // Get today's date range (UTC)
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  // Total page views today
  const { count: totalViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay)
    .lt('created_at', endOfDay);

  // Unique visitors (by username, excluding null)
  const { data: uniqueUsers } = await supabase
    .from('page_views')
    .select('username')
    .gte('created_at', startOfDay)
    .lt('created_at', endOfDay)
    .not('username', 'is', null);

  const uniqueUsernames = new Set((uniqueUsers || []).map(u => u.username));

  // Top pages
  const { data: allViews } = await supabase
    .from('page_views')
    .select('path')
    .gte('created_at', startOfDay)
    .lt('created_at', endOfDay);

  const pageCounts: Record<string, number> = {};
  for (const v of allViews || []) {
    pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => `  ${path} — ${count} views`)
    .join('\n');

  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  // --- Database health check ---
  const tables = ['user_data', 'scores', 'page_views', 'beat_maps'];
  const tableCounts: Record<string, number> = {};
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    tableCounts[table] = count || 0;
  }
  const totalRows = Object.values(tableCounts).reduce((a, b) => a + b, 0);
  const tableStats = Object.entries(tableCounts).map(([t, c]) => `  ${t}: ${c.toLocaleString()} rows`).join('\n');

  // Warnings
  const warnings: string[] = [];
  if (totalRows > 50000) warnings.push('Total rows exceeding 50k - consider cleanup');
  if ((tableCounts['page_views'] || 0) > 30000) warnings.push('page_views table is large - consider archiving old data');
  if ((tableCounts['scores'] || 0) > 10000) warnings.push('scores table growing - monitor');

  await sendSlackMessage(
    `Daily Report - ${dateStr}`,
    [
      {
        type: 'header',
        text: { type: 'plain_text', text: `📊 Daily Report — ${dateStr}` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Page Views*\n${totalViews || 0}` },
          { type: 'mrkdwn', text: `*Unique Users*\n${uniqueUsernames.size}` },
        ],
      },
      ...(uniqueUsernames.size > 0 ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Active Users*\n${[...uniqueUsernames].join(', ')}` },
      }] : []),
      ...(topPages ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Top Pages*\n\`\`\`\n${topPages}\n\`\`\`` },
      }] : []),
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Database*\n\`\`\`\n${tableStats}\n  ──────────\n  Total: ${totalRows.toLocaleString()} rows\n\`\`\`` },
      },
      ...(deletedViews && deletedViews > 0 ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `🧹 *Cleanup*\nDeleted ${deletedViews} page views older than 90 days` },
      }] : []),
      ...(warnings.length > 0 ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `⚠️ *Warnings*\n${warnings.map(w => `• ${w}`).join('\n')}` },
      }] : []),
    ]
  );

  return NextResponse.json({ ok: true, views: totalViews, uniqueUsers: uniqueUsernames.size, totalRows });
}
