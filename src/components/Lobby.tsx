import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Shuffle,
  Compass,
  Trophy,
  HelpCircle,
  Play,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Flame,
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  Link2,
  Check,
} from 'lucide-react';
import { Difficulty, HuntMode, HuntPair, UserStats } from '../types/game';
import { getDailyChallenge } from '../services/dailyHunts';
import {
  cleanTitleDisplay,
  fetchRandomHuntPair,
  searchArticles,
  fetchArticleSummary,
} from '../services/wikipedia';
import {
  getRandomSixDegreesPair,
} from '../services/sixDegreesHunts';

import { BrainRacerLogo } from './BrainRacerLogo';

interface LobbyProps {
  stats: UserStats;
  isMuted: boolean;
  isDark: boolean;
  onToggleMute: () => void;
  onToggleTheme: () => void;
  onOpenStats: () => void;
  onOpenHowToPlay: () => void;
  onStartHunt: (pair: HuntPair, mode: HuntMode, difficulty: Difficulty) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  stats,
  isMuted,
  isDark,
  onToggleMute,
  onToggleTheme,
  onOpenStats,
  onOpenHowToPlay,
  onStartHunt,
}) => {
  const [selectedMode, setSelectedMode] = useState<HuntMode>('DAILY');

  // Daily hunt info
  const dailyData = getDailyChallenge();
  const isDailyDoneToday = stats.lastDailyCompletedDate === dailyData.date;

  // 6 Degrees of Separation state
  const [sixDegreesPair, setSixDegreesPair] = useState<HuntPair | null>(() => {
    const pair = getRandomSixDegreesPair();
    return { startTitle: pair.startTitle, targetTitle: pair.targetTitle };
  });
  const [isLoadingSixDegrees, setIsLoadingSixDegrees] = useState(false);

  const handleGenerateSixDegreesPair = async () => {
    setIsLoadingSixDegrees(true);
    try {
      const pair = await fetchRandomHuntPair(false);
      setSixDegreesPair({
        startTitle: pair.startTitle,
        targetTitle: pair.targetTitle,
      });
    } catch {
      const pair = getRandomSixDegreesPair();
      setSixDegreesPair({
        startTitle: pair.startTitle,
        targetTitle: pair.targetTitle,
      });
    } finally {
      setIsLoadingSixDegrees(false);
    }
  };

  // Random hunt state
  const [randomPair, setRandomPair] = useState<HuntPair | null>(null);
  const [isPureRandom, setIsPureRandom] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  // Custom hunt state
  const [customStart, setCustomStart] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<string[]>([]);
  const [targetSuggestions, setTargetSuggestions] = useState<string[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingTarget, setIsSearchingTarget] = useState(false);

  // Load initial random pairs on mount
  useEffect(() => {
    handleGenerateRandomPair();
    handleGenerateSixDegreesPair();
  }, [isPureRandom]);

  const handleGenerateRandomPair = async () => {
    setIsLoadingRandom(true);
    try {
      const pair = await fetchRandomHuntPair(isPureRandom);
      setRandomPair({
        startTitle: pair.startTitle,
        targetTitle: pair.targetTitle,
      });
    } catch {
      setRandomPair({
        startTitle: 'Moon',
        targetTitle: 'Neil Armstrong',
      });
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Autocomplete debouncing for Custom Start
  useEffect(() => {
    if (customStart.trim().length < 2) {
      setStartSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingStart(true);
      const res = await searchArticles(customStart);
      setStartSuggestions(res);
      setIsSearchingStart(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [customStart]);

  // Autocomplete debouncing for Custom Target
  useEffect(() => {
    if (customTarget.trim().length < 2) {
      setTargetSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingTarget(true);
      const res = await searchArticles(customTarget);
      setTargetSuggestions(res);
      setIsSearchingTarget(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [customTarget]);

  const handleLaunch = () => {
    let pairToLaunch: HuntPair;

    if (selectedMode === 'DAILY') {
      pairToLaunch = dailyData.pair;
    } else if (selectedMode === 'SIX_DEGREES') {
      if (!sixDegreesPair) return;
      pairToLaunch = {
        startTitle: sixDegreesPair.startTitle,
        targetTitle: sixDegreesPair.targetTitle,
        category: '6 Degrees Challenge',
        description: 'Reach the target article in 6 clicks or fewer.',
      };
    } else if (selectedMode === 'RANDOM') {
      if (!randomPair) return;
      pairToLaunch = randomPair;
    } else {
      if (!customStart.trim() || !customTarget.trim()) return;
      pairToLaunch = {
        startTitle: customStart.trim(),
        targetTitle: customTarget.trim(),
      };
    }

    onStartHunt(pairToLaunch, selectedMode, 'STANDARD');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Lobby Top Navbar */}
      <header className="flex items-center justify-between pb-6 border-b border-[var(--wiki-border)]">
        <div className="flex items-center gap-3">
          <BrainRacerLogo size="lg" />
          <div>
            <h1 className="font-black text-xl sm:text-2xl tracking-tight text-red-500 italic uppercase">
              WIKI HUNT RACERS
            </h1>
            <p className="text-xs text-[var(--wiki-muted)]">
              Speedrun Wikipedia hyperlinks from start to target
            </p>
          </div>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2">
          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Stats</span>
            {stats.currentDailyStreak > 0 && (
              <span className="flex items-center text-[10px] text-rose-400 font-bold ml-1">
                <Flame className="w-3 h-3" />
                {stats.currentDailyStreak}
              </span>
            )}
          </button>

          {/* How to Play */}
          <button
            onClick={onOpenHowToPlay}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Game Rules"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={isDark ? 'Light Theme' : 'Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Main Mode Selection & Configuration */}
      <main className="my-8 space-y-8">
        {/* Select Race Mode */}
        <section>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--wiki-muted)] mb-3">
            Select Race Mode
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Daily Hunt Card (Red Themed) */}
            <div
              onClick={() => setSelectedMode('DAILY')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                selectedMode === 'DAILY'
                  ? 'bg-red-950/30 border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500/50'
                  : 'bg-[var(--wiki-surface)] border-[var(--wiki-border)] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              {isDailyDoneToday && (
                <div
                  className="absolute top-4 right-4 text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 rounded-full p-1 shadow-md shadow-emerald-950/40 flex items-center justify-center"
                  title="Daily Challenge Completed"
                >
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--wiki-text)]">
                      Daily Challenge
                    </h3>
                    <p className="text-[11px] text-[var(--wiki-muted)]">
                      {dailyData.date}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--wiki-muted)] leading-relaxed mb-4">
                  The same global hunt for every racer on earth today. Test your route efficiency and maintain your streak!
                </p>
              </div>

              <div className="mt-auto w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-red-400 font-semibold uppercase">Today’s Matchup:</span>
                  <span className="text-[10px] text-red-400/80 font-mono font-medium">#{dailyData.date.replace(/-/g, '')}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                  <span className="text-red-400 truncate">{cleanTitleDisplay(dailyData.pair.startTitle)}</span>
                  <span className="text-slate-500 shrink-0">➔</span>
                  <span className="text-emerald-400 truncate">{cleanTitleDisplay(dailyData.pair.targetTitle)}</span>
                </div>
              </div>
            </div>

            {/* Random Hunt Card (Blue Themed) */}
            <div
              onClick={() => setSelectedMode('RANDOM')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                selectedMode === 'RANDOM'
                  ? 'bg-blue-950/30 border-blue-500 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500/50'
                  : 'bg-[var(--wiki-surface)] border-[var(--wiki-border)] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--wiki-text)]">
                      Random Hunt
                    </h3>
                    <p className="text-[11px] text-[var(--wiki-muted)]">
                      Infinite procedural matchups
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--wiki-muted)] leading-relaxed mb-4">
                  Spin the wheel for spontaneous article pairings across all branches of human knowledge.
                </p>
              </div>

              {/* Random Preview Box */}
              <div className="mt-auto w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-blue-400 font-semibold uppercase">Current Roll:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateRandomPair();
                    }}
                    disabled={isLoadingRandom}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {isLoadingRandom ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Shuffle className="w-3 h-3" />
                    )}
                    <span>Reroll</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                  {isLoadingRandom ? (
                    <span className="text-slate-500 italic">Rolling new articles...</span>
                  ) : randomPair ? (
                    <>
                      <span className="text-blue-400 truncate">{cleanTitleDisplay(randomPair.startTitle)}</span>
                      <span className="text-slate-500 shrink-0">➔</span>
                      <span className="text-emerald-400 truncate">{cleanTitleDisplay(randomPair.targetTitle)}</span>
                    </>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            </div>

            {/* 6 Degrees of Separation Card (Purple Themed) */}
            <div
              onClick={() => setSelectedMode('SIX_DEGREES')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                selectedMode === 'SIX_DEGREES'
                  ? 'bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/50'
                  : 'bg-[var(--wiki-surface)] border-[var(--wiki-border)] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--wiki-text)]">
                      6 Degrees Challenge
                    </h3>
                    <p className="text-[11px] text-[var(--wiki-muted)]">
                      Game over in 6 clicks
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--wiki-muted)] leading-relaxed mb-4">
                  Based on 6 degrees of separation. If you exceed 6 clicks, game over.
                </p>
              </div>

              {/* Matchup preview box */}
              <div className="mt-auto w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-purple-400 font-semibold uppercase">Current Roll:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSixDegreesPair();
                    }}
                    disabled={isLoadingSixDegrees}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium cursor-pointer shrink-0"
                    title="Reroll 6-Degree Pair"
                  >
                    {isLoadingSixDegrees ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Shuffle className="w-3 h-3" />
                    )}
                    <span>Reroll</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                  {isLoadingSixDegrees ? (
                    <span className="text-slate-500 italic">Rolling new articles...</span>
                  ) : sixDegreesPair ? (
                    <>
                      <span className="text-purple-400 truncate">{cleanTitleDisplay(sixDegreesPair.startTitle)}</span>
                      <span className="text-slate-500 shrink-0">➔</span>
                      <span className="text-emerald-400 truncate">{cleanTitleDisplay(sixDegreesPair.targetTitle)}</span>
                    </>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Hunt Card (Green/Emerald Themed) */}
            <div
              onClick={() => setSelectedMode('CUSTOM')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                selectedMode === 'CUSTOM'
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-[var(--wiki-surface)] border-[var(--wiki-border)] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--wiki-text)]">
                      Custom Hunt
                    </h3>
                    <p className="text-[11px] text-[var(--wiki-muted)]">
                      Create any matchup with search
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--wiki-muted)] leading-relaxed mb-4">
                  Challenge yourself or race friends on specific Wikipedia articles using live Wikipedia autocomplete.
                </p>
              </div>

              {/* Custom Matchup Preview Box */}
              <div className="mt-auto w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase">Custom Matchup:</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span>Configure</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                  {customStart.trim() && customTarget.trim() ? (
                    <>
                      <span className="text-emerald-400 truncate">{cleanTitleDisplay(customStart)}</span>
                      <span className="text-slate-500 shrink-0">➔</span>
                      <span className="text-emerald-400 truncate">{cleanTitleDisplay(customTarget)}</span>
                    </>
                  ) : (
                    <span className="text-emerald-400 truncate flex items-center gap-1">
                      Click to enter articles
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Pair Search Inputs (Shown when Custom is selected) */}
        {selectedMode === 'CUSTOM' && (
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Configure Custom Article Pair</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Article Search */}
              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Start Article
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    placeholder="Type to search start article (e.g. Moon, Jazz)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {isSearchingStart && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400 absolute right-3 top-3" />
                  )}
                </div>

                {/* Suggestions dropdown */}
                {startSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                    {startSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCustomStart(item);
                          setStartSuggestions([]);
                        }}
                        className="px-3.5 py-2 text-xs text-slate-300 hover:bg-blue-600/30 hover:text-white cursor-pointer transition-colors"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Article Search */}
              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Article
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="Type to search target article (e.g. Neil Armstrong)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {isSearchingTarget && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400 absolute right-3 top-3" />
                  )}
                </div>

                {/* Suggestions dropdown */}
                {targetSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                    {targetSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCustomTarget(item);
                          setTargetSuggestions([]);
                        }}
                        className="px-3.5 py-2 text-xs text-slate-300 hover:bg-emerald-600/30 hover:text-white cursor-pointer transition-colors"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}


        {/* Launch Race Button */}
        <div className="pt-2">
          <button
            onClick={handleLaunch}
            disabled={
              (selectedMode === 'CUSTOM' &&
                (!customStart.trim() || !customTarget.trim())) ||
              (selectedMode === 'RANDOM' && !randomPair) ||
              (selectedMode === 'SIX_DEGREES' && !sixDegreesPair)
            }
            className={`w-full py-4 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl transition-all ${
              (selectedMode === 'CUSTOM' &&
                (!customStart.trim() || !customTarget.trim())) ||
              (selectedMode === 'RANDOM' && !randomPair) ||
              (selectedMode === 'SIX_DEGREES' && !sixDegreesPair)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {selectedMode === 'CUSTOM' &&
              (!customStart.trim() || !customTarget.trim())
                ? 'Enter Start & Target Articles to Begin'
                : 'RACE!'}
            </span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-6 border-t border-[var(--wiki-border)] text-center text-xs text-[var(--wiki-muted)] flex items-center justify-between flex-wrap gap-2">
        <span>Wiki Hunt Racers • Powered by Wikipedia Public REST API</span>
        <span>Local records saved automatically</span>
      </footer>
    </div>
  );
};
