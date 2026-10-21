import { Flower2, Sparkles, Sprout } from 'lucide-react';

const TIP_ICONS = [Flower2, Sprout, Sparkles];
const LEADING_EMOJI = /^(?:\p{Extended_Pictographic}\uFE0F?\s*)+/u;

export default function TipList({ tips }) {
  return (
    <div className="space-y-2">
      {tips.split(/\r?\n/).filter(Boolean).map((tip, index) => {
        const TipIcon = TIP_ICONS[index % TIP_ICONS.length];

        return (
          <p key={index} className="flex items-start gap-2">
            <TipIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-sage-600" aria-hidden="true" />
            <span>{tip.replace(LEADING_EMOJI, '')}</span>
          </p>
        );
      })}
    </div>
  );
}
