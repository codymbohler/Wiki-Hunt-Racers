import { HuntPair } from '../types/game';

// Curated daily challenge pairs designed for clever pathfinding
export const DAILY_CHALLENGES: HuntPair[] = [
  {
    startTitle: 'Moon',
    targetTitle: 'Neil Armstrong',
    category: 'Space Exploration',
    description: 'Race from Earth’s natural satellite to the first human to walk on its surface.',
  },
  {
    startTitle: 'Pizza',
    targetTitle: 'Leonardo da Vinci',
    category: 'Culture & Renaissance',
    description: 'Find your way from world-famous Neapolitan cuisine to the Italian polymath.',
  },
  {
    startTitle: 'Guitar',
    targetTitle: 'Albert Einstein',
    category: 'Music to Relativity',
    description: 'Connect stringed acoustic vibrations with the father of modern physics.',
  },
  {
    startTitle: 'Antarctica',
    targetTitle: 'Coffee',
    category: 'Geography & Agriculture',
    description: 'Navigate from the coldest continent on Earth to the steaming morning brew.',
  },
  {
    startTitle: 'Super Mario',
    targetTitle: 'Ancient Rome',
    category: 'Gaming to History',
    description: 'Trace the Italian plumber back to the grandeur of the Roman Empire.',
  },
  {
    startTitle: 'Dinosaur',
    targetTitle: 'Aviation',
    category: 'Biology to Engineering',
    description: 'From prehistoric titans to humanity taking flight across the skies.',
  },
  {
    startTitle: 'Internet',
    targetTitle: 'William Shakespeare',
    category: 'Tech to Literature',
    description: 'Journey from the global web of computers to the legendary English playwright.',
  },
  {
    startTitle: 'Chocolate',
    targetTitle: 'Solar System',
    category: 'Sweet Sciences',
    description: 'From Mesoamerican cocoa beans to planetary orbits around our Sun.',
  },
  {
    startTitle: 'Olympic Games',
    targetTitle: 'Artificial intelligence',
    category: 'Athletics to Computing',
    description: 'Travel from ancient athletic competitions to modern neural networks.',
  },
  {
    startTitle: 'Sushi',
    targetTitle: 'Julius Caesar',
    category: 'World History',
    description: 'Hop from traditional Japanese gastronomy to the Roman dictator.',
  },
  {
    startTitle: 'Rock music',
    targetTitle: 'Nikola Tesla',
    category: 'Sound to Power',
    description: 'From electrifying guitar riffs to alternating electrical current.',
  },
  {
    startTitle: 'Mount Everest',
    targetTitle: 'Hollywood',
    category: 'Landmarks to Cinema',
    description: 'From the highest peak above sea level to the motion picture capital.',
  },
  {
    startTitle: 'Tea',
    targetTitle: 'Alan Turing',
    category: 'British Heritage',
    description: 'From dried Camellia sinensis leaves to the father of theoretical computer science.',
  },
  {
    startTitle: 'Photography',
    targetTitle: 'Alexander the Great',
    category: 'Visual Arts to Conquest',
    description: 'From light-capturing lenses to the king of the ancient Greek kingdom of Macedon.',
  },
  {
    startTitle: 'Basketball',
    targetTitle: 'Pyramid',
    category: 'Sports to Antiquity',
    description: 'From Springfield peach baskets to monumental ancient masonry.',
  },
];

/**
 * Get the daily challenge for a given date string (YYYY-MM-DD)
 */
export function getDailyChallenge(dateStr?: string): { date: string; pair: HuntPair } {
  const now = new Date();
  const dateKey = dateStr || now.toISOString().slice(0, 10);

  // Compute a simple hash from the date string
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % DAILY_CHALLENGES.length;
  return {
    date: dateKey,
    pair: DAILY_CHALLENGES[index],
  };
}
