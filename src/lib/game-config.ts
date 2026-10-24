export interface GameTheme {
  accent: string;       // main accent color (hex)
  accentLight: string;  // lighter version for bg tints
  mascot: string;       // mascot image path
  mascotName: string;   // mascot character name
  startLabel: string;   // button text
}

export const GAME_THEMES: Record<string, GameTheme> = {
  slalom: {
    accent: '#22c55e',
    accentLight: '#22c55e',
    mascot: '/images/mascots/mascot-slalom.png',
    mascotName: 'Beatbox',
    startLabel: 'Start training',
  },
  'target-smash': {
    accent: '#ef4444',
    accentLight: '#ef4444',
    mascot: '/images/mascots/mascot-target-smash.png',
    mascotName: 'Smashmouth',
    startLabel: 'Start smashing',
  },
  space: {
    accent: '#06b6d4',
    accentLight: '#06b6d4',
    mascot: '/images/mascots/mascot-space.png',
    mascotName: 'Spacepunk',
    startLabel: 'Start shooting',
  },
  'jelly-stack': {
    accent: '#a855f7',
    accentLight: '#a855f7',
    mascot: '/images/mascots/mascot-jelly-stack.png',
    mascotName: 'Jellix',
    startLabel: 'Start stacking',
  },
  'orbit-hop': {
    accent: '#8b5cf6',
    accentLight: '#8b5cf6',
    mascot: '/images/mascots/mascot-orbit-hop.png',
    mascotName: 'Hopper',
    startLabel: 'Start hopping',
  },
  'neon-drift': {
    accent: '#3b82f6',
    accentLight: '#3b82f6',
    mascot: '/images/mascots/mascot-neon-drift.png',
    mascotName: 'Drifty',
    startLabel: 'Start drifting',
  },
  'brick-rush': {
    accent: '#ef4444',
    accentLight: '#ef4444',
    mascot: '/images/mascots/mascot-brick-rush.png',
    mascotName: 'Brickzilla',
    startLabel: 'Start breaking',
  },
  'magnet-flip': {
    accent: '#a855f7',
    accentLight: '#a855f7',
    mascot: '/images/mascots/mascot-magnet-flip.png',
    mascotName: 'Magno',
    startLabel: 'Start flipping',
  },
  'laser-maze': {
    accent: '#22c55e',
    accentLight: '#22c55e',
    mascot: '/images/mascots/mascot-laser-maze.png',
    mascotName: 'Laserjaw',
    startLabel: 'Start dodging',
  },
  'color-catch': {
    accent: '#f59e0b',
    accentLight: '#f59e0b',
    mascot: '/images/mascots/mascot-color-catch.png',
    mascotName: 'Chromer',
    startLabel: 'Start catching',
  },
  targets: {
    accent: '#3b82f6',
    accentLight: '#3b82f6',
    mascot: '/images/mascots/mascot-targets.png',
    mascotName: 'Fieldster',
    startLabel: 'Start training',
  },
  'figure-eight': {
    accent: '#22c55e',
    accentLight: '#22c55e',
    mascot: '/images/mascots/mascot-targets.png',
    mascotName: 'Fieldster',
    startLabel: 'Start training',
  },
  'classic-8s': {
    accent: '#f59e0b',
    accentLight: '#f59e0b',
    mascot: '/images/mascots/mascot-targets.png',
    mascotName: 'Fieldster',
    startLabel: 'Start training',
  },
};
