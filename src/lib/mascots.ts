export interface MascotDef {
  id: string;
  name: string;
  adjective: string;
  image: string;
}

export const MASCOTS: MascotDef[] = [
  { id: 'beatbox', name: 'Beatbox', adjective: 'The Groovy', image: '/images/mascots/mascot-slalom.webp' },
  { id: 'smashmouth', name: 'Smashmouth', adjective: 'The Fierce', image: '/images/mascots/mascot-target-smash.webp' },
  { id: 'spacepunk', name: 'Spacepunk', adjective: 'The Cosmic', image: '/images/mascots/mascot-space.webp' },
  { id: 'jellix', name: 'Jellix', adjective: 'The Bouncy', image: '/images/mascots/mascot-jelly-stack.webp' },
  { id: 'hopper', name: 'Hopper', adjective: 'The Swift', image: '/images/mascots/mascot-orbit-hop.webp' },
  { id: 'drifty', name: 'Drifty', adjective: 'The Slick', image: '/images/mascots/mascot-neon-drift.webp' },
  { id: 'brickzilla', name: 'Brickzilla', adjective: 'The Mighty', image: '/images/mascots/mascot-brick-rush.webp' },
  { id: 'magno', name: 'Magno', adjective: 'The Electric', image: '/images/mascots/mascot-magnet-flip.webp' },
  { id: 'laserjaw', name: 'Laserjaw', adjective: 'The Sharp', image: '/images/mascots/mascot-laser-maze.webp' },
  { id: 'chromer', name: 'Chromer', adjective: 'The Fast', image: '/images/mascots/mascot-color-catch.webp' },
  { id: 'fieldster', name: 'Fieldster', adjective: 'The Classic', image: '/images/mascots/mascot-targets.webp' },
];

export const PROFILE_COLORS = [
  { id: 'green', label: 'Emerald', value: '#22c55e' },
  { id: 'blue', label: 'Ocean', value: '#3b82f6' },
  { id: 'purple', label: 'Violet', value: '#8b5cf6' },
  { id: 'red', label: 'Crimson', value: '#ef4444' },
  { id: 'amber', label: 'Gold', value: '#f59e0b' },
  { id: 'cyan', label: 'Aqua', value: '#06b6d4' },
  { id: 'pink', label: 'Rose', value: '#ec4899' },
  { id: 'orange', label: 'Flame', value: '#f97316' },
];

export const SPORTS = [
  { id: 'field-hockey', label: 'Field Hockey', icon: '🏑' },
  { id: 'ice-hockey', label: 'Ice Hockey', icon: '🏒' },
  { id: 'floorball', label: 'Floorball', icon: '🥍' },
];

export function getMascotById(id: string): MascotDef | undefined {
  return MASCOTS.find(m => m.id === id);
}
