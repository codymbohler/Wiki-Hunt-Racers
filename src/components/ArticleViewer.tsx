import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader2, ArrowUp, AlertCircle, BookOpen, Ban } from 'lucide-react';
import { Difficulty } from '../types/game';
import { areTitlesEqual, cleanTitleDisplay } from '../services/wikipedia';

interface ArticleViewerProps {
  currentTitle: string;
  targetTitle: string;
  htmlContent: string;
  isLoading: boolean;
  error: string | null;
  difficulty: Difficulty;
  onNavigate: (nextTitle: string) => void;
  onRetry: () => void;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({
  currentTitle,
  targetTitle,
  htmlContent,
  isLoading,
  error,
  difficulty,
  onNavigate,
  onRetry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss transient toasts
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Handle scroll detection for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Process raw Wikipedia HTML: sanitize, fix protocol-relative media, prune unwanted chrome
  const processedHtml = useMemo(() => {
    if (!htmlContent) return '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // 1. Remove edit links, TOC, citations, references, and donation/nav chrome
      const unwantedSelectors = [
        '.mw-editsection',
        '.reference',
        '#toc',
        '.toc',
        '.noprint',
        '.mw-jump-link',
        '.reflist',
        '.catlinks',
        '.printfooter',
        '.ambox',
        '.navbox',
      ];

      // Pro Mode: additionally purge all infoboxes, sidebars, and thumbnail boxes
      if (difficulty === 'PRO') {
        unwantedSelectors.push(
          '.infobox',
          '.sidebar',
          '.vertical-navbox',
          '.thumb',
          '.thumbnail',
          '.wikitable'
        );
      }

      unwantedSelectors.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((el) => el.remove());
      });

      // 2. Fix protocol-relative URLs on images and media
      doc.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('//')) {
          img.setAttribute('src', `https:${src}`);
        }
        const srcset = img.getAttribute('srcset');
        if (srcset) {
          const fixedSrcset = srcset
            .split(',')
            .map((entry) => {
              const trimmed = entry.trim();
              if (trimmed.startsWith('//')) return `https:${trimmed}`;
              return trimmed;
            })
            .join(', ');
          img.setAttribute('srcset', fixedSrcset);
        }
        // Lazy load images for fast rendering
        img.setAttribute('loading', 'lazy');
      });

      return doc.body.innerHTML;
    } catch (err) {
      console.error('Failed to parse and sanitize Wikipedia HTML', err);
      return htmlContent;
    }
  }, [htmlContent]);

  // Click interceptor on the entire container
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    e.preventDefault();

    // In-page section jump
    if (href.startsWith('#')) {
      const elementId = href.slice(1);
      const targetElement = document.getElementById(elementId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Internal Wikipedia article links
    if (href.startsWith('/wiki/')) {
      const rawTitle = href.replace('/wiki/', '');
      const decoded = decodeURIComponent(rawTitle);

      // Exclude Wikipedia meta namespaces
      const isMetaNamespace = /^(Special|File|Help|Wikipedia|Portal|Talk|Category|Template|Draft):/i.test(
        decoded
      );

      if (isMetaNamespace) {
        setToastMessage(`"${cleanTitleDisplay(decoded)}" is a meta page, not an article.`);
        return;
      }

      // Valid internal article link: proceed to next step
      onNavigate(rawTitle);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // External web links
    setToastMessage('External links are not permitted during the race.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24">
      {/* Toast Banner for invalid links */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/50 text-amber-200 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <Ban className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--wiki-bg)]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center min-h-[500px] text-center p-6">
          <div className="bg-[var(--wiki-surface)] border border-[var(--wiki-border)] p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <h3 className="font-bold text-lg text-[var(--wiki-text)] mb-1">
              Loading Wikipedia Article...
            </h3>
            <p className="text-xs text-[var(--wiki-muted)]">
              Fetching and formatting article content for racing speed.
            </p>
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-rose-200 mb-2">Error Loading Article</h3>
          <p className="text-sm text-rose-300/80 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors shadow-lg"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* Main Article Container */}
      {!error && (
        <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-6">
          {/* Article Title Header */}
          <div className="mb-6 pb-4 border-b border-[var(--wiki-border)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--wiki-muted)] mb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Wikipedia Article</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--wiki-text)] tracking-tight">
              {cleanTitleDisplay(currentTitle)}
            </h1>
          </div>

          {/* Rendered Wikipedia Content */}
          <div
            ref={containerRef}
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
            className="wiki-content"
          />
        </main>
      )}

      {/* Floating Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl hover:shadow-blue-500/25 transition-all active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
