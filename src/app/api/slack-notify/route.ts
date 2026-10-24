import { NextRequest, NextResponse } from 'next/server';
import { loginMessage, logoutMessage, achievementMessage, gameFinishedMessage } from '@/lib/slack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, username, ...data } = body;

    if (!type || !username) {
      return NextResponse.json({ error: 'Missing type or username' }, { status: 400 });
    }

    switch (type) {
      case 'login':
        await loginMessage(username);
        break;
      case 'logout':
        await logoutMessage(username);
        break;
      case 'achievement':
        await achievementMessage(username, data.achievementName, data.achievementIcon, data.xp);
        break;
      case 'game_finished':
        await gameFinishedMessage(username, data.gameName, data.score);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
