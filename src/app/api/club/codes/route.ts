import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HB-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code;
}

// POST: Generate codes for a club subscription
export async function POST(req: NextRequest) {
  try {
    const { clubId, count } = await req.json();
    if (!clubId || !count) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const supabase = createServiceClient();

    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      let code: string;
      let attempts = 0;
      do {
        code = generateCode();
        attempts++;
      } while (attempts < 10 && codes.includes(code));
      codes.push(code);
    }

    const rows = codes.map(code => ({ club_id: clubId, code }));
    const { error } = await supabase.from('club_codes').insert(rows);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, codes });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET: List codes for a club
export async function GET(req: NextRequest) {
  const clubId = req.nextUrl.searchParams.get('clubId');
  if (!clubId) return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('club_codes')
    .select('code, assigned_to, assigned_at')
    .eq('club_id', clubId)
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data || [] });
}
