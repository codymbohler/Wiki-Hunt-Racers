import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Difficulty,
  GameState,
  HuntMode,
  HuntPair,
  RunRecord,
  UserStats,
} from './types/game';
import { HeaderHUD } from './components/HeaderHUD';
import { ArticleViewer } from './components/ArticleViewer';
import { Lobby } from './components/Lobby';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { StatsModal } from './components/StatsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AntiSearchModal } from './components/AntiSearchModal';
import {
  areTitlesEqual,
  fetchArticleHtml,
  cleanTitleDisplay,
} from './services/wikipedia';
import { soundManager } from './services/sound';
import { getRandomSixDegreesPair } from './services/sixDegreesHunts';
import {
  loadUserStats,
  recordRunOutcome,
  resetUserStats,
} from './services/storage';

export default function App() {
  // Theme state (Dark theme default as requested, optional light theme)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('wiki_hunt_theme');
    return saved !== 'light';
  });

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  // Stats state
  const [stats, setStats] = useState<UserStats>(() => loadUserStats());

  // Active game configuration
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [currentMode, setCurrentMode] = useState<HuntMode>('DAILY');
  const [difficulty, setDifficulty] = useState<Difficulty>('STANDARD');

  // Hunt targets & progress
  const [startTitle, setStartTitle] = useState<string>('');
  const [targetTitle, setTargetTitle] = useState<string>('');
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [path, setPath] = useState<string[]>([]);
  const [clicks, setClicks] = useState<number>(0);

  // Time tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalElapsedMs, setFinalElapsedMs] = useState<number>(0);

  // Article viewer state
  const [articleHtml, setArticleHtml] = useState<string>('');
  const [isLoadingArticle, setIsLoadingArticle] = useState<boolean>(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Modals state
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isAntiSearchActive, setIsAntiSearchActive] = useState<boolean>(false);

  // Reference for anti-search auto-dismiss timer
  const antiSearchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Apply dark/light theme classes to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('wiki_hunt_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('wiki_hunt_theme', 'light');
    }
  }, [isDark]);

  // Anti-Search Shield: Block Ctrl+F and Cmd+F across all game modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        e.stopPropagation();
        soundManager.playWarning();
        setIsAntiSearchActive(true);

        if (antiSearchTimerRef.current) {
          clearTimeout(antiSearchTimerRef.current);
        }
        antiSearchTimerRef.current = setTimeout(() => {
          setIsAntiSearchActive(false);
        }, 3200);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      if (antiSearchTimerRef.current) {
        clearTimeout(antiSearchTimerRef.current);
      }
    };
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Sound toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  // Load article content helper
  const loadArticle = useCallback(
    async (titleToLoad: string, isVictoryCheckTarget?: string) => {
      setIsLoadingArticle(true);
      setArticleError(null);

      try {
        const response = await fetchArticleHtml(titleToLoad);
        setArticleHtml(response.html);
        setCurrentTitle(response.title);

        // Check if the loaded article matches target (including redirects resolved by Wikipedia)
        const checkTarget = isVictoryCheckTarget || targetTitle;
        if (
          checkTarget &&
          (areTitlesEqual(response.title, checkTarget) ||
            areTitlesEqual(titleToLoad, checkTarget))
        ) {
          handleVictory(response.title);
        }
      } catch (err) {
        setArticleError(
          err instanceof Error
            ? err.message
            : 'Could not load article from Wikipedia. Please check your connection and try again.'
        );
      } finally {
        setIsLoadingArticle(false);
      }
    },
    [targetTitle]
  );

  // Start a new race
  const handleStartHunt = async (
    pair: HuntPair,
    mode: HuntMode,
    diff: Difficulty
  ) => {
    setStartTitle(pair.startTitle);
    setTargetTitle(pair.targetTitle);
    setCurrentTitle(pair.startTitle);
    setCurrentMode(mode);
    setDifficulty(diff);
    setClicks(0);
    setPath([pair.startTitle]);
    setStartTime(Date.now());
    setFinalElapsedMs(0);
    setGameState('RACING');

    soundManager.playClick();
    await loadArticle(pair.startTitle, pair.targetTitle);
  };

  // Navigate to next article when a link is clicked
  const handleNavigate = async (nextTitle: string) => {
    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Direct match check
    if (areTitlesEqual(nextTitle, targetTitle)) {
      const finalPath = [...path, nextTitle];
      setPath(finalPath);
      handleVictory(nextTitle, newClicks, finalPath);
      return;
    }

    // 6 Degrees Mode Hard Limit: If 6 clicks are consumed without reaching target -> Game Over!
    if (currentMode === 'SIX_DEGREES' && newClicks >= 6) {
      const finalPath = [...path, nextTitle];
      setPath(finalPath);
      handleGameOver(nextTitle, newClicks, finalPath);
      return;
    }

    soundManager.playClick();
    const nextPath = [...path, nextTitle];
    setPath(nextPath);
    await loadArticle(nextTitle);
  };

  // Step back / Undo (Standard mode: costs +1 click penalty)
  const handleUndo = async () => {
    if (path.length <= 1) return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    const newPath = path.slice(0, -1);
    const prevTitle = newPath[newPath.length - 1];

    // If in 6 Degrees mode, undo click penalty can exhaust remaining degree budget
    if (currentMode === 'SIX_DEGREES' && newClicks >= 6) {
      setPath(newPath);
      handleGameOver(prevTitle, newClicks, newPath);
      return;
    }

    soundManager.playUndo();
    setPath(newPath);
    await loadArticle(prevTitle);
  };

  // Game Over trigger (Specifically for 6 Degrees mode when 6 hops limit is reached)
  const handleGameOver = (
    finalTitle: string,
    finalClicks: number,
    finalPath: string[]
  ) => {
    const now = Date.now();
    const elapsed = startTime ? now - startTime : 0;
    setFinalElapsedMs(elapsed);
    setClicks(finalClicks);
    setPath(finalPath);
    setCurrentTitle(finalTitle);
    setGameState('GAME_OVER');
    soundManager.playGameOver();

    const runRecord: RunRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString(),
      mode: currentMode,
      difficulty,
      startTitle,
      targetTitle,
      clicks: finalClicks,
      elapsedMs: elapsed,
      path: finalPath,
      completed: false,
    };

    const updatedStats = recordRunOutcome(runRecord);
    setStats(updatedStats);
  };

  // 6 Degrees retry same matchup
  const handleRetrySixDegrees = () => {
    handleStartHunt({ startTitle, targetTitle }, 'SIX_DEGREES', 'STANDARD');
  };

  // 6 Degrees pick fresh curated pair
  const handleNewSixDegreesPair = () => {
    const nextPair = getRandomSixDegreesPair(startTitle);
    handleStartHunt(nextPair, 'SIX_DEGREES', 'STANDARD');
  };

  // Victory trigger
  const handleVictory = (
    winningTitle?: string,
    overrideClicks?: number,
    overridePath?: string[]
  ) => {
    const now = Date.now();
    const elapsed = startTime ? now - startTime : 0;
    setFinalElapsedMs(elapsed);
    setGameState('VICTORY');
    soundManager.playVictory();

    const usedClicks = overrideClicks !== undefined ? overrideClicks : clicks;
    const usedPath =
      overridePath !== undefined
        ? overridePath
        : winningTitle
        ? [...path, winningTitle]
        : path;

    const runRecord: RunRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString(),
      mode: currentMode,
      difficulty,
      startTitle,
      targetTitle,
      clicks: usedClicks,
      elapsedMs: elapsed,
      path: usedPath,
      completed: true,
    };

    const updatedStats = recordRunOutcome(runRecord);
    setStats(updatedStats);
  };

  // Give up / Forfeit - returns directly to the home page
  const handleGiveUp = () => {
    const now = Date.now();
    const elapsed = startTime ? now - startTime : 0;

    const runRecord: RunRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString(),
      mode: currentMode,
      difficulty,
      startTitle,
      targetTitle,
      clicks,
      elapsedMs: elapsed,
      path,
      completed: false,
    };

    const updatedStats = recordRunOutcome(runRecord);
    setStats(updatedStats);
    setGameState('LOBBY');
  };

  // Play Again (Restart with same or fresh pair)
  const handlePlayAgain = () => {
    setGameState('LOBBY');
  };

  // Reset career stats
  const handleResetCareerStats = () => {
    const fresh = resetUserStats();
    setStats(fresh);
  };

  return (
    <div className="min-h-screen bg-[var(--wiki-bg)] text-[var(--wiki-text)] flex flex-col transition-colors duration-200">
      {/* Anti-Search Shield Alert */}
      <AntiSearchModal
        isOpen={isAntiSearchActive}
        onClose={() => setIsAntiSearchActive(false)}
      />

      {/* Career Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={handleResetCareerStats}
      />

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={gameState === 'VICTORY'}
        isVictory={true}
        startTitle={startTitle}
        targetTitle={targetTitle}
        clicks={clicks}
        elapsedMs={finalElapsedMs}
        path={path}
        difficulty={difficulty}
        mode={currentMode}
        onPlayAgain={handlePlayAgain}
        onReturnLobby={() => setGameState('LOBBY')}
      />

      {/* 6 Degrees Connection Severed / Game Over Modal */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        startTitle={startTitle}
        targetTitle={targetTitle}
        path={path}
        clicks={clicks}
        onRetry={handleRetrySixDegrees}
        onNewPair={handleNewSixDegreesPair}
        onReturnLobby={() => setGameState('LOBBY')}
      />

      {/* View Routing: Lobby vs Active Race */}
      {gameState === 'LOBBY' ? (
        <Lobby
          stats={stats}
          isMuted={isMuted}
          isDark={isDark}
          onToggleMute={toggleMute}
          onToggleTheme={toggleTheme}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onStartHunt={handleStartHunt}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Anchored Top HUD Banner */}
          <HeaderHUD
            startTitle={startTitle}
            targetTitle={targetTitle}
            currentTitle={currentTitle}
            clicks={clicks}
            startTime={startTime}
            isRunning={gameState === 'RACING'}
            difficulty={difficulty}
            mode={currentMode}
            path={path}
            isMuted={isMuted}
            isDark={isDark}
            onToggleMute={toggleMute}
            onToggleTheme={toggleTheme}
            onUndo={handleUndo}
            onGiveUp={handleGiveUp}
            canUndo={path.length > 1}
          />

          {/* Authentic Wikipedia Article Content */}
          <ArticleViewer
            currentTitle={currentTitle}
            targetTitle={targetTitle}
            htmlContent={articleHtml}
            isLoading={isLoadingArticle}
            error={articleError}
            difficulty={difficulty}
            onNavigate={handleNavigate}
            onRetry={() => loadArticle(currentTitle)}
          />
        </div>
      )}
    </div>
  );
}
