import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Clock,
  Footprints,
  Share2,
  RotateCcw,
  Home,
  Check,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Difficulty, HuntMode } from '../types/game';
import { cleanTitleDisplay } from '../services/wikipedia';

interface VictoryModalProps {
  isOpen: boolean;
  isVictory: boolean;
  startTitle: string;
  targetTitle: string;
  clicks: number;
  elapsedMs: number;
  path: string[];
  difficulty: Difficulty;
  mode: HuntMode;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  isVictory,
  startTitle,
  targetTitle,
  clicks,
  elapsedMs,
  path,
  difficulty,
  mode,
  onPlayAgain,
  onReturnLobby,
}) => {
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on victory
  useEffect(() => {
    if (isOpen && isVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
        const timeout = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
        return () => clearTimeout(timeout);
      } catch {
        // Confetti gracefully skipped if canvas not ready
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    if (minutes > 0) {
      return `${minutes}m ${seconds}.${tenths}s`;
    }
    return `${seconds}.${tenths}s`;
  };

  // Determine racer title based on clicks and time
  const getRating = (): { title: string; color: string } => {
    if (!isVictory) return { title: 'Explorer', color: 'text-slate-400' };
    if (clicks <= 3) return { title: 'Warp Speed Demon 🚀', color: 'text-amber-400' };
    if (clicks <= 5) return { title: 'Master Cartographer 🗺️', color: 'text-emerald-400' };
    if (clicks <= 8) return { title: 'Keen Rabbit-Holer 🐇', color: 'text-blue-400' };
    return { title: 'Persistent Navigator 🧭', color: 'text-indigo-400' };
  };

  const rating = getRating();

  const handleShare = async () => {
    const routeSummary = path.map((p) => cleanTitleDisplay(p)).join(' ➔ ');
    const shareText = `🏆 Wiki Hunt Racers (${mode})
🎯 ${cleanTitleDisplay(startTitle)} ➔ ${cleanTitleDisplay(targetTitle)}
⏱️ ${formatTime(elapsedMs)} | 🔀 ${clicks} ${clicks === 1 ? 'click' : 'clicks'}
🔗 Route: ${routeSummary}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--wiki-surface)] border border-[var(--wiki-border)] rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-[var(--wiki-text)] relative overflow-hidden">
        {/* Glow Accent */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${
            isVictory ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Header Icon & Title */}
        <div className="text-center relative mb-6">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-xl ${
              isVictory
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {isVictory ? <Trophy className="w-8 h-8" /> : <Award className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isVictory ? 'Target Reached!' : 'Run Forfeited'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--wiki-muted)] mt-1">
            {isVictory
              ? `You navigated from "${cleanTitleDisplay(startTitle)}" to "${cleanTitleDisplay(
                  targetTitle
                )}"`
              : 'Here is the path explored during this attempt.'}
          </p>
          {isVictory && (
            <div className={`mt-2 font-bold text-sm sm:text-base ${rating.color} flex items-center justify-center gap-1.5`}>
              <Sparkles className="w-4 h-4" />
              <span>{rating.title}</span>
            </div>
          )}

          {isVictory && mode === 'SIX_DEGREES' && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono">
              <span>🔗 6 DEGREES CONQUERED:</span>
              <span className="text-white">{clicks} OF 6 HOPS</span>
            </div>
          )}
        </div>

        {/* Score & Time Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--wiki-muted)] mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Elapsed Time</span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {formatTime(elapsedMs)}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--wiki-muted)] mb-1">
              <Footprints className="w-4 h-4 text-blue-400" />
              <span>Clicks / Hops</span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-400">
              {clicks} {clicks === 1 ? 'click' : 'clicks'}
            </div>
          </div>
        </div>

        {/* Route Trail */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--wiki-muted)] mb-2 flex items-center justify-between">
            <span>Route Taken ({path.length} hops)</span>
            <span className="text-[11px] font-mono lowercase">
              {mode} • {difficulty}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
            {path.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-5 text-slate-500 font-mono text-[11px]">{idx + 1}.</span>
                <span
                  className={`truncate font-medium ${
                    idx === 0
                      ? 'text-blue-400'
                      : idx === path.length - 1 && isVictory
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {cleanTitleDisplay(item)}
                </span>
                {idx < path.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {isVictory && (
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Race Again</span>
          </button>

          <button
            onClick={onReturnLobby}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/30"
            title="Return to Game Lobby"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
