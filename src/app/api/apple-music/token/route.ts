import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!keyId || !teamId || !privateKey) {
    return NextResponse.json({ error: 'Apple Music not configured' }, { status: 500 });
  }

  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '24h',
    issuer: teamId,
    header: {
      alg: 'ES256',
      kid: keyId,
    },
  });

  return NextResponse.json({ token });
}
