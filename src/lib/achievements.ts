export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  xp: number;
  category: 'time' | 'games' | 'streak' | 'social' | 'score' | 'mastery';
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalSecondsPlayed: number;
  totalGamesPlayed: number;
  currentStreak: number;
  friendsCount: number;
  highestScore: number;
  perfectRounds: number;
  uniqueSongsPlayed: number;
  gameTypeCounts: Record<string, number>;
  totalHoursPlayed: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // --- Time Played ---
  { id: 'time_5m', name: 'First Steps', description: 'Play for 5 minutes', icon: '👣', xp: 25, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 300 },
  { id: 'time_30m', name: 'Warming Up', description: 'Play for 30 minutes', icon: '🔥', xp: 50, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 1800 },
  { id: 'time_1h', name: 'Dedicated', description: 'Play for 1 hour', icon: '⏰', xp: 100, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 3600 },
  { id: 'time_5h', name: 'Committed', description: 'Play for 5 hours', icon: '💪', xp: 250, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 18000 },
  { id: 'time_10h', name: 'Veteran', description: 'Play for 10 hours', icon: '🏅', xp: 500, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 36000 },
  { id: 'time_25h', name: 'Legend', description: 'Play for 25 hours', icon: '👑', xp: 1000, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 90000 },
  { id: 'time_50h', name: 'Unstoppable', description: 'Play for 50 hours', icon: '🌟', xp: 2000, category: 'time',
    check: (s) => s.totalSecondsPlayed >= 180000 },

  // --- Games Played ---
  { id: 'games_1', name: 'First Game', description: 'Play your first game', icon: '🎮', xp: 25, category: 'games',
    check: (s) => s.totalGamesPlayed >= 1 },
  { id: 'games_10', name: 'Getting Started', description: 'Play 10 games', icon: '🕹️', xp: 50, category: 'games',
    check: (s) => s.totalGamesPlayed >= 10 },
  { id: 'games_25', name: 'Regular', description: 'Play 25 games', icon: '🎯', xp: 75, category: 'games',
    check: (s) => s.totalGamesPlayed >= 25 },
  { id: 'games_50', name: 'Dedicated Player', description: 'Play 50 games', icon: '⭐', xp: 150, category: 'games',
    check: (s) => s.totalGamesPlayed >= 50 },
  { id: 'games_100', name: 'Centurion', description: 'Play 100 games', icon: '💯', xp: 300, category: 'games',
    check: (s) => s.totalGamesPlayed >= 100 },
  { id: 'games_500', name: 'Hardcore', description: 'Play 500 games', icon: '🏆', xp: 750, category: 'games',
    check: (s) => s.totalGamesPlayed >= 500 },

  // --- Streak ---
  { id: 'streak_3', name: 'On Fire', description: '3 day streak', icon: '🔥', xp: 50, category: 'streak',
    check: (s) => s.currentStreak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '📅', xp: 100, category: 'streak',
    check: (s) => s.currentStreak >= 7 },
  { id: 'streak_14', name: 'Consistent', description: '14 day streak', icon: '🗓️', xp: 200, category: 'streak',
    check: (s) => s.currentStreak >= 14 },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '🌙', xp: 500, category: 'streak',
    check: (s) => s.currentStreak >= 30 },
  { id: 'streak_60', name: 'Unstoppable Streak', description: '60 day streak', icon: '⚡', xp: 1000, category: 'streak',
    check: (s) => s.currentStreak >= 60 },

  // --- Social (Friends) ---
  { id: 'friend_1', name: 'Social', description: 'Add your first friend', icon: '🤝', xp: 25, category: 'social',
    check: (s) => s.friendsCount >= 1 },
  { id: 'friend_3', name: 'Squad', description: 'Add 3 friends', icon: '👥', xp: 50, category: 'social',
    check: (s) => s.friendsCount >= 3 },
  { id: 'friend_5', name: 'Connected', description: 'Add 5 friends', icon: '🌐', xp: 75, category: 'social',
    check: (s) => s.friendsCount >= 5 },
  { id: 'friend_10', name: 'Popular', description: 'Add 10 friends', icon: '🌟', xp: 150, category: 'social',
    check: (s) => s.friendsCount >= 10 },
  { id: 'friend_20', name: 'Influencer', description: 'Add 20 friends', icon: '👑', xp: 300, category: 'social',
    check: (s) => s.friendsCount >= 20 },

  // --- Score ---
  { id: 'score_500', name: 'Nice Score', description: 'Score 500+ in a single game', icon: '📊', xp: 25, category: 'score',
    check: (s) => s.highestScore >= 500 },
  { id: 'score_1000', name: 'Four Digits', description: 'Score 1000+ in a single game', icon: '🎖️', xp: 50, category: 'score',
    check: (s) => s.highestScore >= 1000 },
  { id: 'score_2000', name: 'High Scorer', description: 'Score 2000+ in a single game', icon: '🏅', xp: 100, category: 'score',
    check: (s) => s.highestScore >= 2000 },
  { id: 'score_5000', name: 'Elite', description: 'Score 5000+ in a single game', icon: '💎', xp: 250, category: 'score',
    check: (s) => s.highestScore >= 5000 },

  // --- Mastery (specific games) ---
  { id: 'master_slalom', name: 'Slalom Pro', description: 'Play 10 Slalom games', icon: '⛷️', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['slalom'] || 0) >= 10 },
  { id: 'master_space', name: 'Space Cadet', description: 'Play 10 Space Invaders games', icon: '🚀', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['space'] || 0) >= 10 },
  { id: 'master_brick', name: 'Brick Breaker', description: 'Play 10 Brick Rush games', icon: '🧱', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['brick-rush'] || 0) >= 10 },
  { id: 'master_target', name: 'Sharpshooter', description: 'Play 10 Target Smash games', icon: '🎯', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['target-smash'] || 0) >= 10 },
  { id: 'master_orbit', name: 'Astronaut', description: 'Play 10 Orbit Hop games', icon: '🪐', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['orbit-hop'] || 0) >= 10 },
  { id: 'master_neon', name: 'Neon Rider', description: 'Play 10 Neon Drift games', icon: '🏎️', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['neon-drift'] || 0) >= 10 },
  { id: 'master_jelly', name: 'Jelly King', description: 'Play 10 Jelly Stack games', icon: '🍬', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['jelly-stack'] || 0) >= 10 },
  { id: 'master_color', name: 'Color Catcher', description: 'Play 10 Color Catch games', icon: '🌈', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['color-catch'] || 0) >= 10 },
  { id: 'master_laser', name: 'Laser Dodger', description: 'Play 10 Laser Maze games', icon: '🔴', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['laser-maze'] || 0) >= 10 },
  { id: 'master_magnet', name: 'Magnet Master', description: 'Play 10 Magnet Flip games', icon: '🧲', xp: 75, category: 'mastery',
    check: (s) => (s.gameTypeCounts['magnet-flip'] || 0) >= 10 },
  { id: 'variety_3', name: 'Explorer', description: 'Play 3 different games', icon: '🗺️', xp: 50, category: 'mastery',
    check: (s) => Object.values(s.gameTypeCounts).filter(v => v > 0).length >= 3 },
  { id: 'variety_6', name: 'Adventurer', description: 'Play 6 different games', icon: '🧭', xp: 100, category: 'mastery',
    check: (s) => Object.values(s.gameTypeCounts).filter(v => v > 0).length >= 6 },
  { id: 'variety_all', name: 'Completionist', description: 'Play all game types', icon: '🏆', xp: 500, category: 'mastery',
    check: (s) => Object.values(s.gameTypeCounts).filter(v => v > 0).length >= 10 },

  // --- Music ---
  { id: 'music_5', name: 'DJ', description: 'Play 5 different songs', icon: '🎵', xp: 50, category: 'mastery',
    check: (s) => s.uniqueSongsPlayed >= 5 },
  { id: 'music_20', name: 'Music Lover', description: 'Play 20 different songs', icon: '🎧', xp: 150, category: 'mastery',
    check: (s) => s.uniqueSongsPlayed >= 20 },

  // --- Perfect ---
  { id: 'perfect_1', name: 'Perfectionist', description: 'Get 100% accuracy', icon: '✨', xp: 100, category: 'score',
    check: (s) => s.perfectRounds >= 1 },
  { id: 'perfect_5', name: 'Flawless', description: 'Get 100% accuracy 5 times', icon: '💫', xp: 250, category: 'score',
    check: (s) => s.perfectRounds >= 5 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  time: 'Time Played',
  games: 'Games Played',
  streak: 'Streak',
  social: 'Social',
  score: 'Score & Accuracy',
  mastery: 'Game Mastery',
};
