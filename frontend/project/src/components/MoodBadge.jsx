import React from 'react';
import { AlertCircle, Cloud, Meh, Moon, Smile } from 'lucide-react';

export const MOOD_CONFIG = {
  sunny: {
    label: 'Okay',
    icon: Meh,
    color: 'sage',
    badgeClass: 'bg-sage-100 text-sage-800 border-sage-200',
    description: 'Feeling okay today',
  },
  blooming: {
    label: 'Good',
    icon: Smile,
    color: 'sage',
    badgeClass: 'bg-sage-100 text-sage-800 border-sage-200',
    description: 'Feeling good today',
  },
  seedling: {
    label: 'Calm',
    icon: Moon,
    color: 'sage',
    badgeClass: 'bg-sage-100 text-sage-800 border-sage-200',
    description: 'Feeling calm today',
  },
  wilting: {
    label: 'Low',
    icon: AlertCircle,
    color: 'cream',
    badgeClass: 'bg-cream-200 text-bloom-dark border-cream-300',
    description: 'Feeling low today',
  },
  stormy: {
    label: 'Stressed',
    icon: Cloud,
    color: 'cream',
    badgeClass: 'bg-cream-200 text-bloom-dark border-cream-300',
    description: 'Feeling stressed today',
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
