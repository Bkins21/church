import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Copy, Check, X, BookOpen, Music, Type } from 'lucide-react';
import { Song } from '../types';
import { cleanLyricsText, downloadLyricsFile, copyLyricsToClipboard } from '../utils/lyricsHelper';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export default function LyricsModal({ isOpen, onClose, song }: LyricsModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  if (!isOpen || !song) return null;

  const cleanedText = cleanLyricsText(song.lyrics);

  const handleCopy = async () => {
    if (!song) return;
    const success = await copyLyricsToClipboard(song.title, song.artist, song.lyrics);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!song) return;
    const success = downloadLyricsFile(song.title, song.artist, song.album, song.lyrics);
    if (success) {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
        id="lyrics-document-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lyrics-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#25160B] border border-[#A37F3B]/60 text-[#F7F5F0] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 relative flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#4A2D17] flex items-center justify-between gap-4 bg-[#1D1108]/90">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#3A2312] border border-[#A37F3B]/50 text-[#A37F3B] shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A37F3B] font-bold">
                  Lyrics Document
                </span>
                <h3 id="lyrics-modal-title" className="text-lg sm:text-xl font-cinzel font-bold text-white truncate">
                  {song.title}
                </h3>
                <p className="text-xs text-[#E4DCD0]/70 truncate">
                  {song.artist} • {song.album}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#E4DCD0]/70 hover:text-white hover:bg-[#3A2312] transition-colors cursor-pointer shrink-0"
              aria-label="Close lyrics modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="px-5 sm:px-6 py-3 bg-[#180E07] border-b border-[#4A2D17] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1.5 text-xs text-[#A37F3B] font-mono">
              <Type className="h-3.5 w-3.5" />
              <span>Size:</span>
              <div className="flex rounded-lg bg-[#25160B] border border-[#4A2D17] p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    fontSize === 'sm' ? 'bg-[#A37F3B] text-white font-bold' : 'text-[#8A7463] hover:text-white'
                  }`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('base')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    fontSize === 'base' ? 'bg-[#A37F3B] text-white font-bold' : 'text-[#8A7463] hover:text-white'
                  }`}
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    fontSize === 'lg' ? 'bg-[#A37F3B] text-white font-bold' : 'text-[#8A7463] hover:text-white'
                  }`}
                >
                  L
                </button>
              </div>
            </div>

            {/* Quick Actions: Copy & Download */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!cleanedText}
                className="px-3 py-1.5 rounded-xl bg-[#25160B] hover:bg-[#3A2312] border border-[#4A2D17] hover:border-[#A37F3B] text-[#F7F5F0] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
                title="Copy full lyrics to clipboard"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#A37F3B]" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!cleanedText}
                className="px-3.5 py-1.5 rounded-xl bg-[#A37F3B] hover:bg-[#8F6D2F] text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40"
                title="Download lyrics as a .txt document"
              >
                {downloaded ? <Check className="h-3.5 w-3.5 text-white" /> : <Download className="h-3.5 w-3.5 text-white" />}
                <span>{downloaded ? 'Downloaded!' : 'Download Lyrics (.txt)'}</span>
              </button>
            </div>
          </div>

          {/* Lyrics Content Container */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-sans space-y-4">
            {cleanedText ? (
              <div 
                className={`whitespace-pre-line leading-relaxed text-[#F7F5F0]/90 select-text ${
                  fontSize === 'sm' ? 'text-sm' : fontSize === 'base' ? 'text-base' : 'text-lg'
                }`}
              >
                {cleanedText}
              </div>
            ) : (
              <div className="py-12 text-center text-[#8A7463] space-y-2">
                <Music className="h-10 w-10 mx-auto text-[#A37F3B]/50" />
                <p className="text-sm font-medium text-[#F7F5F0]/70">No lyrics text document available for this song.</p>
                <p className="text-xs text-[#8A7463]">
                  Worship ministers and church admins can add lyrics in the Admin Portal.
                </p>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-[#1D1108] border-t border-[#4A2D17] flex items-center justify-between text-[11px] font-mono text-[#8A7463]">
            <span>God's Edifice Church • Crossworship Collection</span>
            <button
              onClick={onClose}
              className="hover:text-white underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
