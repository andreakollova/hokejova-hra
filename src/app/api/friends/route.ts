import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

// GET: load friends list with real data (last played, total time)
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

  const supabase = createServiceClient();

  // Get my user_data (which has friends list)
  const { data: myData } = await supabase
    .from('user_data')
    .select('friends')
    .eq('username', username)
    .single();

  const friendsList: { username: string; pending: boolean; incoming: boolean }[] = myData?.friends || [];

  // For each accepted friend, fetch their engagement data
  const enriched = await Promise.all(
    friendsList.map(async (f) => {
      if (f.incoming || f.pending) {
        return { ...f, totalTime: '', lastPlayed: '', online: false };
      }
      // Fetch friend's engagement data
      const { data: friendData } = await supabase
        .from('user_data')
        .select('engagement, updated_at')
        .eq('username', f.username)
        .single();

      const eng = friendData?.engagement;
      const totalMins = eng?.totalMinutesPlayed || 0;
      const totalSecs = eng?.totalSecondsPlayed || 0;
      const actualMins = totalSecs ? Math.floor(totalSecs / 60) : totalMins;
      const totalTime = actualMins >= 60 ? `${Math.floor(actualMins / 60)}h ${actualMins % 60}m` : `${actualMins}m`;

      // Check if active recently (within 5 min)
      const online = friendData?.updated_at ? (Date.now() - new Date(friendData.updated_at).getTime()) < 300000 : false;

      // Last played
      const lastPlayedDate = eng?.lastPlayDate;
      let lastPlayed = '';
      if (lastPlayedDate) {
        const diff = Date.now() - new Date(lastPlayedDate).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) lastPlayed = `${mins}m ago`;
        else if (mins < 1440) lastPlayed = `${Math.floor(mins / 60)}h ago`;
        else lastPlayed = `${Math.floor(mins / 1440)}d ago`;
      }

      return { ...f, totalTime, lastPlayed, online };
    })
  );

  return NextResponse.json({ friends: enriched });
}

// POST: send friend request / accept / reject
export async function POST(req: NextRequest) {
  try {
    const { action, username, friendUsername } = await req.json();
    if (!username || !friendUsername) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = createServiceClient();

    if (action === 'add') {
      // Check if friend exists
      const { data: friendExists } = await supabase
        .from('user_data')
        .select('username')
        .eq('username', friendUsername)
        .single();

      if (!friendExists) {
        return NextResponse.json({ error: 'User not found. Check the username and try again.' }, { status: 404 });
      }

      if (friendUsername === username) {
        return NextResponse.json({ error: 'You cannot add yourself.' }, { status: 400 });
      }

      // Add as pending in my list
      const { data: myData } = await supabase.from('user_data').select('friends').eq('username', username).single();
      const myFriends: { username: string; pending: boolean; incoming: boolean }[] = myData?.friends || [];

      if (myFriends.some(f => f.username === friendUsername)) {
        return NextResponse.json({ error: 'Already in your friends list.' }, { status: 400 });
      }

      myFriends.push({ username: friendUsername, pending: true, incoming: false });
      await supabase.from('user_data').upsert({ username, friends: myFriends, updated_at: new Date().toISOString() }, { onConflict: 'username' });

      // Add as incoming in their list
      const { data: theirData } = await supabase.from('user_data').select('friends').eq('username', friendUsername).single();
      const theirFriends: { username: string; pending: boolean; incoming: boolean }[] = theirData?.friends || [];

      if (!theirFriends.some(f => f.username === username)) {
        theirFriends.push({ username, pending: false, incoming: true });
        await supabase.from('user_data').upsert({ username: friendUsername, friends: theirFriends, updated_at: new Date().toISOString() }, { onConflict: 'username' });
      }

      return NextResponse.json({ ok: true, message: 'Friend request sent!' });
    }

    if (action === 'accept') {
      // In my list: set incoming=false
      const { data: myData } = await supabase.from('user_data').select('friends').eq('username', username).single();
      const myFriends: { username: string; pending: boolean; incoming: boolean }[] = myData?.friends || [];
      const updated = myFriends.map(f => f.username === friendUsername ? { ...f, incoming: false, pending: false } : f);
      await supabase.from('user_data').upsert({ username, friends: updated, updated_at: new Date().toISOString() }, { onConflict: 'username' });

      // In their list: set pending=false
      const { data: theirData } = await supabase.from('user_data').select('friends').eq('username', friendUsername).single();
      const theirFriends: { username: string; pending: boolean; incoming: boolean }[] = theirData?.friends || [];
      const theirUpdated = theirFriends.map(f => f.username === username ? { ...f, pending: false, incoming: false } : f);
      await supabase.from('user_data').upsert({ username: friendUsername, friends: theirUpdated, updated_at: new Date().toISOString() }, { onConflict: 'username' });

      return NextResponse.json({ ok: true });
    }

    if (action === 'reject' || action === 'remove') {
      // Remove from my list
      const { data: myData } = await supabase.from('user_data').select('friends').eq('username', username).single();
      const myFriends: { username: string; pending: boolean; incoming: boolean }[] = myData?.friends || [];
      const updated = myFriends.filter(f => f.username !== friendUsername);
      await supabase.from('user_data').upsert({ username, friends: updated, updated_at: new Date().toISOString() }, { onConflict: 'username' });

      // Remove from their list too
      const { data: theirData } = await supabase.from('user_data').select('friends').eq('username', friendUsername).single();
      const theirFriends: { username: string; pending: boolean; incoming: boolean }[] = theirData?.friends || [];
      const theirUpdated = theirFriends.filter(f => f.username !== username);
      await supabase.from('user_data').upsert({ username: friendUsername, friends: theirUpdated, updated_at: new Date().toISOString() }, { onConflict: 'username' });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
