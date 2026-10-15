// Shared type for music service selection
export type MusicServiceType = 'spotify' | 'apple' | null;

// Store which service is playing so game pages know how to play/pause
let activeService: MusicServiceType = null;

export function setActiveMusicService(s: MusicServiceType) { activeService = s; }
export function getActiveMusicService(): MusicServiceType { return activeService; }
