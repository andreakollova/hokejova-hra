'use client';

import Image from 'next/image';

interface MascotGlowProps {
  src: string;
  color: string;
  size?: number;
}

export default function MascotGlow({ src, color, size = 120 }: MascotGlowProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Pulsing glow */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, ${color}15 40%, transparent 70%)`,
          transform: 'scale(1.5)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow-delayed"
        style={{
          background: `radial-gradient(circle, ${color}25 0%, ${color}08 50%, transparent 70%)`,
          transform: 'scale(1.8)',
        }}
      />
      {/* Mascot image */}
      <Image
        src={src}
        alt="Mascot"
        width={size}
        height={size}
        className="relative z-10 drop-shadow-lg"
      />
    </div>
  );
}
