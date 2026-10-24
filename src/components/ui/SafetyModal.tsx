'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SAFETY_KEY = 'hb_safety_acknowledged';

export default function SafetyModal({ onContinue }: { onContinue: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem(SAFETY_KEY);
    if (!acknowledged) {
      setShow(true);
    } else {
      onContinue();
    }
  }, [onContinue]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🛡️</div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Play Safe</h2>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Make sure you have enough space to move safely. Keep people, pets, and fragile objects away from your playing area.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Use suitable equipment and stop if you feel pain or discomfort.
          </p>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Read our <Link href="/safety" className="underline hover:text-gray-700">Safety Guidelines</Link> before playing.
        </p>

        <button
          onClick={() => {
            localStorage.setItem(SAFETY_KEY, 'true');
            setShow(false);
            onContinue();
          }}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-full transition-all"
        >
          I understand, let me play
        </button>
      </div>
    </div>
  );
}

export function needsSafetyAcknowledgment(): boolean {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem(SAFETY_KEY);
}
