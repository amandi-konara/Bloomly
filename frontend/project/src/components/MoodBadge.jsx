import React from 'react';
import { Sun, Flower, Sprout, CloudRain, Leaf } from 'lucide-react';

export const MOOD_CONFIG = {
  sunny: {
    label: 'Sunny & Bright',
    icon: Sun,
    color: 'butter',
    badgeClass: 'bg-butter-100 text-amber-900 border-butter-200',
    description: 'Feeling radiant, positive, and full of light',
  },
  blooming: {
    label: 'Blooming Joy',
    icon: Flower,
    color: 'peach',
    badgeClass: 'bg-peach-100 text-rose-900 border-peach-200',
    description: 'Vibrant, open-hearted, and energized',
  },
  seedling: {
    label: 'Gently Growing',
    icon: Sprout,
    color: 'sage',
    badgeClass: 'bg-sage-100 text-sage-800 border-sage-200',
    description: 'Grounding, quiet momentum, steady pace',
  },
  wilting: {
    label: 'Needing Rest',
    icon: Leaf,
    color: 'peach',
    badgeClass: 'bg-peach-100 text-rose-800 border-peach-200',
    description: 'Tired, low reserves, time to recharge',
  },
  stormy: {
    label: 'Weathering Storm',
    icon: CloudRain,
    color: 'cream',
    badgeClass: 'bg-cream-200 text-bloom-dark border-cream-300',
    description: 'Heavy, overwhelmed, needing extra kindness',
  },
};

export default function MoodBadge({ mood = 'seedling', showLabel = true, size = 'md' }) {
  const config = MOOD_CONFIG[mood] || MOOD_CONFIG.seedling;
  const IconComponent = config.icon;

  if (!showLabel) {
    return (
      <span
        title={config.label}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cream-100 border border-bloom-border"
      >
        <IconComponent className="w-4 h-4" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.badgeClass}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
