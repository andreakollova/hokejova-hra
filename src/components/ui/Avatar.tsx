'use client';

import Image from 'next/image';

interface AvatarProps {
  username: string;
  photoUrl?: string | null;
  mascotImage?: string | null;
  profileColor?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#8b5cf6', '#f97316',
  '#ec4899', '#14b8a6', '#6366f1', '#eab308', '#06b6d4',
];

function getColorForUsername(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

const sizes = {
  sm: { wh: 32, text: 'text-xs' },
  md: { wh: 48, text: 'text-base' },
  lg: { wh: 80, text: 'text-2xl' },
};

export default function Avatar({ username, photoUrl, mascotImage, profileColor, size = 'md' }: AvatarProps) {
  const s = sizes[size];

  // Priority: mascot > photo > initials
  if (mascotImage) {
    const borderColor = profileColor || getColorForUsername(username || 'user');
    return (
      <div
        className="rounded-full overflow-hidden flex-shrink-0 border-2"
        style={{ width: s.wh, height: s.wh, borderColor, boxShadow: `0 0 12px ${borderColor}40` }}
      >
        <Image src={mascotImage} alt={username} width={s.wh} height={s.wh} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (photoUrl) {
    return (
      <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: s.wh, height: s.wh }}>
        <img src={photoUrl} alt={username} className="w-full h-full object-cover" />
      </div>
    );
  }

  const color = profileColor || getColorForUsername(username || 'user');
  const initials = getInitials(username || 'U');

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${s.text}`}
      style={{ width: s.wh, height: s.wh, backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
