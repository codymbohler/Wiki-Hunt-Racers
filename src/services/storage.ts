import { RunRecord, UserStats } from '../types/game';

const STATS_KEY = 'wiki_link_hunt_racers_stats';

const DEFAULT_STATS: UserStats = {
  totalRuns: 0,
  totalWins: 0,
  currentDailyStreak: 0,
  bestDailyStreak: 0,
  lastDailyCompletedDate: null,
  bestTimeMs: null,
  fewestClicks: null,
  history: [],
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats to localStorage', err);
  }
}

export function recordRunOutcome(record: RunRecord): UserStats {
  const current = loadUserStats();

  const totalRuns = current.totalRuns + 1;
  const totalWins = record.completed ? current.totalWins + 1 : current.totalWins;

  let bestTimeMs = current.bestTimeMs;
  let fewestClicks = current.fewestClicks;

  if (record.completed) {
    if (bestTimeMs === null || record.elapsedMs < bestTimeMs) {
      bestTimeMs = record.elapsedMs;
    }
    if (fewestClicks === null || record.clicks < fewestClicks) {
      fewestClicks = record.clicks;
    }
  }

  // Handle Daily streak calculation
  let currentDailyStreak = current.currentDailyStreak;
  let bestDailyStreak = current.bestDailyStreak;
  let lastDailyCompletedDate = current.lastDailyCompletedDate;

  if (record.mode === 'DAILY' && record.completed) {
    const today = new Date().toISOString().slice(0, 10);
    if (lastDailyCompletedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastDailyCompletedDate === yesterday) {
        currentDailyStreak += 1;
      } else {
        currentDailyStreak = 1;
      }
      lastDailyCompletedDate = today;
      if (currentDailyStreak > bestDailyStreak) {
        bestDailyStreak = currentDailyStreak;
      }
    }
  }

  // Keep last 30 runs in history
  const history = [record, ...current.history].slice(0, 30);

  const updated: UserStats = {
    totalRuns,
    totalWins,
    currentDailyStreak,
    bestDailyStreak,
    lastDailyCompletedDate,
    bestTimeMs,
    fewestClicks,
    history,
  };

  saveUserStats(updated);
  return updated;
}

export function resetUserStats(): UserStats {
  saveUserStats(DEFAULT_STATS);
  return DEFAULT_STATS;
}
