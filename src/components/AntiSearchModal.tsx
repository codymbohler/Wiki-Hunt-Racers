import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AntiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AntiSearchModal: React.FC<AntiSearchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
      <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-md mx-4">
        <div className="p-2 bg-rose-900/80 rounded-lg text-rose-300">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-left">
          <div className="font-bold text-sm text-rose-200">Search is Disabled</div>
          <div className="text-xs text-rose-300/90 leading-tight">
            Ctrl+F and page search are blocked across all game modes in Wiki Hunt Racers! Rely on your memory and pathfinding instincts.
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-rose-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
