import React, { useState, useEffect } from 'react';
import {
  Flag,
  Target,
  Compass,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Footprints,
  ChevronDown,
  XCircle,
  ArrowRight,
  BookOpen,
  Link2,
} from 'lucide-react';
import { Difficulty, HuntMode } from '../types/game';
import { cleanTitleDisplay } from '../services/wikipedia';
import { BrainRacerLogo } from './BrainRacerLogo';

interface HeaderHUDProps {
  startTitle: string;
  targetTitle: string;
  currentTitle: string;
  clicks: number;
  startTime: number | null;
  isRunning: boolean;
  difficulty: Difficulty;
  mode: HuntMode;
  path: string[];
  isMuted: boolean;
  isDark: boolean;
  onToggleMute: () => void;
  onToggleTheme: () => void;
  onUndo: () => void;
  onGiveUp: () => void;
  canUndo: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  startTitle,
  targetTitle,
  currentTitle,
  clicks,
  startTime,
  isRunning,
  difficulty,
  mode,
  path,
  isMuted,
  isDark,
  onToggleMute,
  onToggleTheme,
  onUndo,
  onGiveUp,
  canUndo,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [showPathDropdown, setShowPathDropdown] = useState<boolean>(false);

  // High precision timer loop
  useEffect(() => {
    if (!isRunning || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Format milliseconds into MM:SS.d
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${tenths}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b shadow-lg transition-colors duration-200 bg-[var(--wiki-hud-bg)] border-[var(--wiki-border)] text-[var(--wiki-text)]">
      {/* Upper Bar: Brand Logo, Timer, Clicks, and Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
        {/* Brand with Brain + Finish Flag Logo */}
        <div className="flex items-center gap-2.5">
          <BrainRacerLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="font-black tracking-tight text-base sm:text-lg text-red-500 italic uppercase">
              WIKI HUNT RACERS
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase tracking-wider flex items-center gap-1 ${
                mode === 'SIX_DEGREES'
                  ? 'bg-purple-950/70 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {mode === 'SIX_DEGREES' && <Link2 className="w-3 h-3 text-purple-400" />}
              <span>{mode === 'SIX_DEGREES' ? '6 DEGREES' : mode}</span>
            </span>
          </div>
        </div>

        {/* Center Live Race Metrics: Timer, Clicks & 6-Degree Node Meter */}
        <div className="flex items-center gap-2.5 sm:gap-4 bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold tabular-nums text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{formatTime(elapsed)}</span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          {/* If 6 Degrees Mode: Dedicated Visual 6-Node Connection Chain */}
          {mode === 'SIX_DEGREES' ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((nodeNum) => {
                  const isFilled = clicks >= nodeNum;
                  const isCurrent = clicks === nodeNum;
                  return (
                    <div
                      key={nodeNum}
                      title={`Degree ${nodeNum} of 6`}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                        isFilled
                          ? nodeNum === 6
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-950 animate-pulse'
                            : nodeNum === 5
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      } ${isCurrent ? 'ring-2 ring-white/60 scale-105' : ''}`}
                    >
                      {nodeNum}
                    </div>
                  );
                })}
              </div>
              <div
                className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                  clicks >= 5
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : clicks === 4
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
              >
                {clicks >= 6
                  ? 'FINAL HOP!'
                  : `${Math.max(0, 6 - clicks)} ${6 - clicks === 1 ? 'hop' : 'hops'} left`}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300">
              <Footprints className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {clicks} {clicks === 1 ? 'click' : 'clicks'}
              </span>
            </div>
          )}
        </div>

        {/* Right Controls: Undo, Trail, Sound, Theme, Give Up */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Backstep / Undo button */}
          <button
            onClick={onUndo}
            disabled={!canUndo || difficulty === 'PRO'}
            title={
              difficulty === 'PRO'
                ? 'Undo is disabled in Pro difficulty'
                : canUndo
                ? `Step back to previous article (${
                    difficulty === 'STANDARD' ? '+1 click penalty' : 'Casual'
                  })`
                : 'No steps to undo'
            }
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition-all ${
              !canUndo || difficulty === 'PRO'
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white shadow-sm'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Undo</span>
            {difficulty === 'STANDARD' && canUndo && (
              <span className="text-[10px] text-amber-400 font-mono">(+1)</span>
            )}
          </button>

          {/* Breadcrumb path dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPathDropdown(!showPathDropdown)}
              title="View full path so far"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Trail</span>
              <span className="text-xs bg-slate-900 px-1.5 rounded-full font-mono font-semibold">
                {path.length}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown list of hops */}
            {showPathDropdown && (
              <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg shadow-2xl p-3 border z-50 bg-[var(--wiki-surface)] border-[var(--wiki-border)]">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--wiki-border)]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--wiki-muted)]">
                    Hop History ({path.length} {path.length === 1 ? 'article' : 'articles'})
                  </span>
                  <button
                    onClick={() => setShowPathDropdown(false)}
                    className="text-xs text-[var(--wiki-muted)] hover:text-[var(--wiki-text)]"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  {path.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-1.5 rounded ${
                        idx === path.length - 1
                          ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                          : idx === 0
                          ? 'text-slate-400'
                          : 'text-[var(--wiki-text)]'
                      }`}
                    >
                      <span className="w-5 text-right font-mono text-[10px] text-slate-500">
                        {idx}
                      </span>
                      <span className="truncate">{cleanTitleDisplay(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent hover:border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Wikipedia' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent hover:border-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Give Up (Returns to Home Page) */}
          <button
            onClick={onGiveUp}
            title="Give up and return to home page"
            className="p-1.5 sm:px-2.5 rounded-md text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/40 hover:border-rose-600 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Give Up</span>
          </button>
        </div>
      </div>

      {/* Prominent Centered Racing Track Banner: CURRENT ARTICLE (Fixed on scroll) ➔ TARGET ARTICLE */}
      <div className="border-t border-[var(--wiki-border)] bg-slate-950/60 px-3 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
          {/* CURRENT ARTICLE (The article the player is currently on - stays fixed when scrolling) */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-blue-500/60 px-4 py-2 rounded-xl shadow-md min-w-0 max-w-[280px] sm:max-w-xs shrink-0 ring-1 ring-blue-500/20">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
                <span>CURRENT ARTICLE</span>
                {mode === 'SIX_DEGREES' ? (
                  <span
                    className={`text-[9px] font-mono px-1.5 rounded font-bold ${
                      clicks >= 5
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    DEGREE {clicks} / 6
                  </span>
                ) : path.length > 1 ? (
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-1 rounded">
                    HOP {path.length - 1}
                  </span>
                ) : (
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-1 rounded">
                    START
                  </span>
                )}
              </div>
              <div
                className="text-sm sm:text-base font-bold truncate text-slate-100"
                title={cleanTitleDisplay(currentTitle)}
              >
                {cleanTitleDisplay(currentTitle)}
              </div>
            </div>
          </div>

          {/* Connecting Arrow */}
          <div className="flex items-center gap-1 text-slate-500 shrink-0">
            <div className="h-0.5 w-4 bg-slate-700 hidden sm:block"></div>
            <ArrowRight className="w-5 h-5 text-blue-400 animate-pulse" />
            <div className="h-0.5 w-4 bg-slate-700 hidden sm:block"></div>
          </div>

          {/* TARGET ARTICLE (Ultra-High Contrast Emerald Destination Banner) */}
          <div className="flex items-center gap-3 bg-emerald-950/90 border-2 border-emerald-500 px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/60 min-w-0 max-w-[300px] sm:max-w-md shrink-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-300 shrink-0">
              <Target className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span>TARGET</span>
                <span className="text-[9px] bg-emerald-500 text-emerald-950 font-black px-1 rounded">
                  GOAL
                </span>
              </div>
              <div
                className="text-sm sm:text-base font-extrabold truncate text-emerald-100"
                title={cleanTitleDisplay(targetTitle)}
              >
                {cleanTitleDisplay(targetTitle)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
