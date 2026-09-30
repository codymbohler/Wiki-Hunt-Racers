import { ArticleParseResponse, WikipediaSummary } from '../types/game';

// Clean and normalize titles for robust comparison
export function normalizeTitle(title: string): string {
  return decodeURIComponent(title)
    .replace(/_/g, ' ')
    .replace(/#.*$/, '')
    .trim()
    .toLowerCase();
}

export function areTitlesEqual(a: string, b: string): boolean {
  return normalizeTitle(a) === normalizeTitle(b);
}

// Format raw wiki title for display
export function cleanTitleDisplay(title: string): string {
  try {
    return decodeURIComponent(title).replace(/_/g, ' ').trim();
  } catch {
    return title.replace(/_/g, ' ').trim();
  }
}

/**
 * Fetch parsed HTML for a Wikipedia article
 */
export async function fetchArticleHtml(pageTitle: string): Promise<ArticleParseResponse> {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
    pageTitle
  )}&format=json&origin=*&redirects=1&prop=text|displaytitle`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia request failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.info || 'Failed to load Wikipedia article');
  }

  const rawHtml = data.parse?.text?.['*'] || '';
  const resolvedTitle = data.parse?.title || pageTitle;
  const displayTitle = data.parse?.displaytitle || resolvedTitle;

  return {
    title: resolvedTitle,
    html: rawHtml,
    displayTitle,
  };
}

/**
 * Fetch summary and thumbnail for an article
 */
export async function fetchArticleSummary(pageTitle: string): Promise<WikipediaSummary | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || pageTitle,
      extract: data.extract || '',
      description: data.description || '',
      thumbnail: data.thumbnail,
    };
  } catch {
    return null;
  }
}

/**
 * Autocomplete search for articles
 */
export async function searchArticles(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      query.trim()
    )}&limit=8&namespace=0&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // data[1] is the array of title results
    return Array.isArray(data[1]) ? data[1] : [];
  } catch {
    return [];
  }
}

/**
 * Curated pool of high-connectivity seed articles for reliable random hunts
 */
const HIGH_CONNECTIVITY_ARTICLES = [
  'Moon',
  'Neil Armstrong',
  'Apollo 11',
  'Sun',
  'Solar System',
  'Earth',
  'Mars',
  'Albert Einstein',
  'Isaac Newton',
  'Physics',
  'Quantum mechanics',
  'Leonardo da Vinci',
  'Mona Lisa',
  'Paris',
  'France',
  'Europe',
  'World War II',
  'Winston Churchill',
  'United Kingdom',
  'London',
  'William Shakespeare',
  'Cinema',
  'Hollywood',
  'United States',
  'New York City',
  'The Beatles',
  'Rock music',
  'Guitar',
  'Music',
  'Internet',
  'Computer',
  'Artificial intelligence',
  'Alan Turing',
  'Alexander the Great',
  'Ancient Greece',
  'Philosophy',
  'Aristotle',
  'Olympic Games',
  'Ancient Rome',
  'Julius Caesar',
  'Coffee',
  'Tea',
  'Chocolate',
  'Pizza',
  'Italy',
  'Biology',
  'DNA',
  'Charles Darwin',
  'Evolution',
  'Dinosaur',
  'Pacific Ocean',
  'Antarctica',
  'Mount Everest',
  'Aviation',
  'Wright brothers',
  'Automobile',
  'Henry Ford',
  'Electricity',
  'Thomas Edison',
  'Nikola Tesla',
  'Video game',
  'Nintendo',
  'Super Mario',
  'Japan',
  'Tokyo',
  'Sushi',
  'Animation',
  'Walt Disney',
];

/**
 * Fetch a purely random or high-connectivity random article pair
 */
export async function fetchRandomHuntPair(pureRandom: boolean = false): Promise<{ startTitle: string; targetTitle: string }> {
  if (!pureRandom) {
    // Pick two distinct high-connectivity topics from our curated pool
    const pool = [...HIGH_CONNECTIVITY_ARTICLES];
    const startIndex = Math.floor(Math.random() * pool.length);
    const start = pool.splice(startIndex, 1)[0];
    const targetIndex = Math.floor(Math.random() * pool.length);
    const target = pool[targetIndex];
    return { startTitle: start, targetTitle: target };
  }

  // Purely random via Wikipedia Random API
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=2&format=json&origin=*`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const randomItems = data.query?.random;
      if (Array.isArray(randomItems) && randomItems.length >= 2) {
        return {
          startTitle: randomItems[0].title,
          targetTitle: randomItems[1].title,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch pure random articles from API, falling back to curated pool', err);
  }

  // Fallback
  const pool = [...HIGH_CONNECTIVITY_ARTICLES];
  const idx1 = Math.floor(Math.random() * pool.length);
  const start = pool.splice(idx1, 1)[0];
  const idx2 = Math.floor(Math.random() * pool.length);
  const target = pool[idx2];
  return { startTitle: start, targetTitle: target };
}
