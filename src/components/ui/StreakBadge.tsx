'use client';

interface StreakBadgeProps {
  currentStreak: number;
  frozen: boolean;
  size?: 'sm' | 'md';
}

export default function StreakBadge({ currentStreak, frozen, size = 'md' }: StreakBadgeProps) {
  if (currentStreak === 0 && !frozen) return null;

  const isSm = size === 'sm';

  return (
    <div className={`inline-flex items-center gap-1.5 ${frozen ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'} rounded-full ${isSm ? 'px-2.5 py-1' : 'px-3.5 py-1.5'}`}>
      <i className={`${frozen ? 'fi fi-sr-icicles text-blue-500' : 'fi fi-ss-fire-flame-curved text-orange-500'} ${isSm ? 'text-sm' : 'text-base'} ${frozen ? '' : 'animate-pulse'}`} />
      <span className={`font-bold tabular-nums ${isSm ? 'text-xs' : 'text-sm'} ${frozen ? 'text-blue-700' : 'text-orange-700'}`}>
        {currentStreak}
      </span>
      {frozen && (
        <span className={`${isSm ? 'text-[10px]' : 'text-xs'} text-blue-500 font-medium`}>
          Frozen
        </span>
      )}
    </div>
  );
}
