import React from 'react';
import {
  Unlink,
  RotateCcw,
  Shuffle,
  Home,
  Flag,
  Target,
  ArrowRight,
} from 'lucide-react';
import { cleanTitleDisplay } from '../services/wikipedia';

interface GameOverModalProps {
  isOpen: boolean;
  startTitle: string;
  targetTitle: string;
  path: string[];
  clicks: number;
  onRetry: () => void;
  onNewPair: () => void;
  onReturnLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  startTitle,
  targetTitle,
  path,
  clicks,
  onRetry,
  onNewPair,
  onReturnLobby,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--wiki-surface)] border border-rose-900/50 rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-[var(--wiki-text)] relative overflow-hidden">
        {/* Rose Glow Ambient Backdrop */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full blur-3xl opacity-25 bg-rose-600 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full blur-3xl opacity-20 bg-amber-600 pointer-events-none" />

        {/* Severed Chain Icon Header */}
        <div className="text-center relative mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <Unlink className="w-8 h-8" />
          </div>

          <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            6 Degrees Limit Reached
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Connection Severed!
          </h2>
          <p className="text-xs sm:text-sm text-[var(--wiki-muted)] mt-1.5 max-w-md mx-auto">
            You used all <span className="font-bold text-rose-400">{clicks} clicks</span> without
            reaching the target. The 6-degree connection chain broke!
          </p>
        </div>

        {/* Origin ➔ Target Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0 flex items-center gap-2">
            <Flag className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Start</span>
              <span className="font-bold text-slate-200 truncate">{cleanTitleDisplay(startTitle)}</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="min-w-0 flex items-center gap-2 text-right">
            <div className="truncate">
              <span className="text-[10px] text-emerald-500 block uppercase font-bold">Target</span>
              <span className="font-bold text-emerald-300 truncate">{cleanTitleDisplay(targetTitle)}</span>
            </div>
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
        </div>

        {/* Traversed Path Log */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--wiki-muted)] mb-2 flex items-center justify-between">
            <span>Explored Route ({path.length} hops)</span>
            <span className="text-rose-400">Limit: 6 Hops</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
            {path.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-xs text-slate-300 font-mono py-0.5"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    idx === 0
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : idx === path.length - 1
                      ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx}
                </span>
                <span className="truncate">{cleanTitleDisplay(step)}</span>
                {idx === 0 && <span className="text-[10px] text-blue-400 font-sans ml-auto">(Origin)</span>}
                {idx === path.length - 1 && (
                  <span className="text-[10px] text-rose-400 font-sans ml-auto font-bold">(Severed)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Retry Same Pair */}
            <button
              onClick={onRetry}
              className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Same Pair</span>
            </button>

            {/* New 6-Degree Pair */}
            <button
              onClick={onNewPair}
              className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
              <span>New Pair</span>
            </button>
          </div>

          {/* Return Home Button */}
          <button
            onClick={onReturnLobby}
            className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
