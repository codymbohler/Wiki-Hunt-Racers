import React from 'react';
import { Brain } from 'lucide-react';

interface BrainRacerLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrainRacerLogo: React.FC<BrainRacerLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: { container: 'w-7 h-7', brain: 'w-4 h-4', flag: 'w-3 h-3 -bottom-0.5 -right-0.5' },
    md: { container: 'w-9 h-9 sm:w-10 sm:h-10', brain: 'w-5 h-5 sm:w-6 sm:h-6', flag: 'w-4 h-4 sm:w-4.5 sm:h-4.5 -bottom-1 -right-1' },
    lg: { container: 'w-12 h-12', brain: 'w-7 h-7', flag: 'w-5 h-5 -bottom-1 -right-1' },
  };

  const { container, brain, flag } = sizeClasses[size];

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0 border border-blue-400/30 ${container} ${className}`}
    >
      {/* Brain Icon */}
      <Brain className={`${brain} text-pink-200 drop-shadow`} />

      {/* Overlaid Finish Line Checkered Racing Flag */}
      <div
        className={`absolute ${flag} bg-slate-950 rounded border border-white/40 shadow-md p-0.5 flex items-center justify-center overflow-hidden`}
        title="Finish line flag"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Flagpole */}
          <path d="M2 1v14" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
          {/* Checkered pattern flag body */}
          <g>
            <rect x="3.5" y="2" width="5.5" height="4" fill="#ffffff" />
            <rect x="9" y="2" width="5.5" height="4" fill="#000000" />
            <rect x="3.5" y="6" width="5.5" height="4" fill="#000000" />
            <rect x="9" y="6" width="5.5" height="4" fill="#ffffff" />
          </g>
          <path
            d="M3.5 2h11v8h-11z"
            stroke="#94a3b8"
            strokeWidth="0.8"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};
