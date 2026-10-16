'use client';

interface AvatarProps {
  username: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-cyan-500',
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
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-20 h-20 text-2xl',
};

export default function Avatar({ username, photoUrl, size = 'md' }: AvatarProps) {
  const sizeClass = sizeClasses[size];

  if (photoUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
        <img
          src={photoUrl}
          alt={username}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const color = getColorForUsername(username || 'user');
  const initials = getInitials(username || 'U');

  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}
