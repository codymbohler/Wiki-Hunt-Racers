import React from 'react';
import {
  HelpCircle,
  X,
  Target,
  Clock,
  Footprints,
  ShieldAlert,
  Zap,
  Link2,
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--wiki-surface)] border border-[var(--wiki-border)] rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-[var(--wiki-text)] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--wiki-border)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">How to Play</h2>
              <p className="text-xs text-[var(--wiki-muted)]">
                Wiki Hunt Racers Rules & Strategies
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

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Rule 1 */}
          <div className="flex gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Target className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">The Objective</div>
              <div className="text-[var(--wiki-muted)] mt-1">
                You begin on a designated starting article and must reach the target article
                strictly by clicking hyperlinks embedded within Wikipedia content.
              </div>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">No Time Limit, But Timed</div>
              <div className="text-[var(--wiki-muted)] mt-1">
                Take as long as you need to explore and strategize. The precision timer tracks your
                elapsed speed and hop count for personal best records.
              </div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">Strict Anti-Search Shield</div>
              <div className="text-[var(--wiki-muted)] mt-1">
                Ctrl+F / Cmd+F and browser search are blocked in all game modes! True speedrunners
                rely on article skimming and contextual knowledge.
              </div>
            </div>
          </div>

          {/* Standard Rules */}
          <div className="flex gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Footprints className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">Standard Racing Rules</div>
              <div className="text-[var(--wiki-muted)] mt-1">
                Explore authentic Wikipedia pages with full article text and infoboxes. Step back/undo is permitted anytime with a +1 click penalty.
              </div>
            </div>
          </div>

          {/* 6 Degrees Mode */}
          <div className="flex gap-3 p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40">
            <Link2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-purple-200 flex items-center gap-1.5">
                <span>6 Degrees Challenge</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.5 rounded border border-purple-500/30">
                  HARD LIMIT: 6 HOPS
                </span>
              </div>
              <div className="text-[var(--wiki-muted)] mt-1">
                Connect two starkly different articles in 6 clicks or fewer. If you consume all 6 hops without finding the destination, the connection is severed and triggers Game Over!
              </div>
            </div>
          </div>

          {/* Strategy Tip */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Pro Tip: </span>
              Broad hub articles (such as countries, scientific fields, major historical eras, or
              world capitals) act as transit junctions connecting almost any two topics within 3–4
              clicks.
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors"
          >
            Got It, Let&apos;s Race!
          </button>
        </div>
      </div>
    </div>
  );
};
