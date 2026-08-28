import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X, Play, Volume2, SkipForward, SkipBack, RotateCcw, RotateCw, Shuffle, Repeat } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space / K', desc: 'Play or Pause current song', icon: Play },
    { key: 'Left Arrow / J', desc: 'Rewind 5 / 10 seconds', icon: RotateCcw },
    { key: 'Right Arrow / L', desc: 'Fast forward 5 / 10 seconds', icon: RotateCw },
    { key: 'N', desc: 'Skip to next song', icon: SkipForward },
    { key: 'P', desc: 'Previous song (or restart)', icon: SkipBack },
    { key: 'Up / Down Arrow', desc: 'Adjust volume (+ / - 10%)', icon: Volume2 },
    { key: 'M', desc: 'Toggle Mute / Unmute', icon: Volume2 },
    { key: 'S', desc: 'Toggle Shuffle mode', icon: Shuffle },
    { key: 'R', desc: 'Cycle Repeat mode (Off / All / One)', icon: Repeat },
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#25160B] border border-[#A37F3B]/60 text-[#F7F5F0] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#4A2D17] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#3A2312] border border-[#A37F3B]/50 text-[#A37F3B]">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h3 id="shortcuts-modal-title" className="text-base font-cinzel font-bold text-white">
                  Keyboard Shortcuts
                </h3>
                <p className="text-xs text-[#8A7463]">Quick worship player controls</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A7463] hover:text-white hover:bg-[#3A2312] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {shortcuts.map((sc, idx) => {
              const Icon = sc.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#1D1108] border border-[#4A2D17]/60 text-xs"
                >
                  <div className="flex items-center gap-2.5 text-[#F7F5F0]">
                    <Icon className="h-3.5 w-3.5 text-[#A37F3B]" />
                    <span>{sc.desc}</span>
                  </div>
                  <kbd className="px-2.5 py-1 rounded-lg bg-[#3A2312] border border-[#A37F3B]/60 text-[#E5B869] font-mono text-[11px] font-bold shadow-xs whitespace-nowrap">
                    {sc.key}
                  </kbd>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#4A2D17] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white font-semibold text-xs cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
