'use client';

interface XPBarProps {
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  progress: number;
  totalXP: number;
  compact?: boolean;
}

export default function XPBar({ level, xpInLevel, xpNeeded, progress, totalXP, compact = false }: XPBarProps) {
  const percentage = Math.round(progress * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
          <span className="text-xs font-bold text-white tabular-nums">{level}</span>
        </div>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-sm font-bold text-white tabular-nums">{level}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Level {level}</p>
            <p className="text-xs text-gray-400">{totalXP.toLocaleString()} XP</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 tabular-nums">{xpInLevel}/{xpNeeded} XP</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
