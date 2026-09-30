import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Clock,
  Footprints,
  History,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { UserStats } from '../types/game';
import { cleanTitleDisplay } from '../services/wikipedia';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const winRate =
    stats.totalRuns > 0 ? Math.round((stats.totalWins / stats.totalRuns) * 100) : 0;

  const formatTime = (ms: number | null): string => {
    if (!ms) return '--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    if (minutes > 0) {
      return `${minutes}m ${seconds}.${tenths}s`;
    }
    return `${seconds}.${tenths}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--wiki-surface)] border border-[var(--wiki-border)] rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-[var(--wiki-text)] relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--wiki-border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Racer Career Stats</h2>
              <p className="text-xs text-[var(--wiki-muted)]">
                Local speedrun records & route history
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 shrink-0">
          {/* Win Rate */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-center">
            <div className="text-xs text-[var(--wiki-muted)] mb-1 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Win Rate</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-200">
              {winRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.totalWins}/{stats.totalRuns} hunts
            </div>
          </div>

          {/* Daily Streak */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-center">
            <div className="text-xs text-[var(--wiki-muted)] mb-1 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Daily Streak</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-400">
              {stats.currentDailyStreak} <span className="text-xs">days</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Best: {stats.bestDailyStreak} days
            </div>
          </div>

          {/* Fastest Time */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-center">
            <div className="text-xs text-[var(--wiki-muted)] mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fastest Run</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 truncate">
              {formatTime(stats.bestTimeMs)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Personal best</div>
          </div>

          {/* Fewest Clicks */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-center">
            <div className="text-xs text-[var(--wiki-muted)] mb-1 flex items-center justify-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-blue-400" />
              <span>Fewest Clicks</span>
            </div>
            <div className="text-xl font-bold font-mono text-blue-400">
              {stats.fewestClicks !== null ? `${stats.fewestClicks} hops` : '--'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct routing</div>
          </div>
        </div>

        {/* History Log */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--wiki-muted)] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Recent Race Attempts ({stats.history.length})</span>
            </div>

            {stats.history.length > 0 && (
              confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-rose-300">Clear all records?</span>
                  <button
                    onClick={() => {
                      onResetStats();
                      setConfirmReset(false);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-[11px] px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {stats.history.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--wiki-muted)] bg-slate-900/40 rounded-xl border border-slate-800/80">
                No races logged yet. Pick a challenge in the lobby and start sprinting!
              </div>
            ) : (
              stats.history.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {record.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                        <span className="truncate">{cleanTitleDisplay(record.startTitle)}</span>
                        <span className="text-slate-500 font-mono">➔</span>
                        <span className="truncate text-emerald-400">
                          {cleanTitleDisplay(record.targetTitle)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{record.mode}</span>
                        <span>•</span>
                        <span>{record.difficulty}</span>
                        <span>•</span>
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-200">
                      {formatTime(record.elapsedMs)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {record.clicks} {record.clicks === 1 ? 'click' : 'clicks'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
