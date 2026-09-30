export type Difficulty = 'CASUAL' | 'STANDARD' | 'PRO';

export type HuntMode = 'DAILY' | 'RANDOM' | 'CUSTOM' | 'SIX_DEGREES';

export type GameState = 'LOBBY' | 'RACING' | 'VICTORY' | 'GIVE_UP' | 'GAME_OVER';

export interface HuntPair {
  startTitle: string;
  targetTitle: string;
  category?: string;
  description?: string;
}

export interface StepRecord {
  title: string;
  timestamp: number;
}

export interface RunRecord {
  id: string;
  date: string;
  mode: HuntMode;
  difficulty: Difficulty;
  startTitle: string;
  targetTitle: string;
  clicks: number;
  elapsedMs: number;
  path: string[];
  completed: boolean;
}

export interface UserStats {
  totalRuns: number;
  totalWins: number;
  currentDailyStreak: number;
  bestDailyStreak: number;
  lastDailyCompletedDate: string | null;
  bestTimeMs: number | null;
  fewestClicks: number | null;
  history: RunRecord[];
}

export interface WikipediaSummary {
  title: string;
  extract: string;
  description?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export interface ArticleParseResponse {
  title: string;
  html: string;
  displayTitle: string;
}
