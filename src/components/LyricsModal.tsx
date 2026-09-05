import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Copy, Check, X, Music, Type } from 'lucide-react';
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
        id="lyrics-document-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lyrics-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#FCFBF9] border border-[#E4DCD0] text-[#141416] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 relative flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#EFEAE1] flex items-center justify-between gap-4 bg-[#F7F5F0]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#EFEAE1] border border-[#E4DCD0] text-[#A36B3B] shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8D5A30] font-bold">
                  Worship Lyrics
                </span>
                <h3 id="lyrics-modal-title" className="text-lg sm:text-xl font-cinzel font-bold text-[#141416] truncate">
                  {song.title}
                </h3>
                <p className="text-xs text-[#54575E] truncate">
                  {song.artist} {song.album ? `• ${song.album}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8A8E96] hover:text-[#141416] hover:bg-[#EFEAE1] transition-colors cursor-pointer shrink-0"
              aria-label="Close lyrics modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="px-5 sm:px-6 py-2.5 bg-[#FCFBF9] border-b border-[#EFEAE1] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1.5 text-xs text-[#8D5A30] font-mono">
              <Type className="h-3.5 w-3.5" />
              <span>Size:</span>
              <div className="flex rounded-lg bg-[#EFEAE1] border border-[#E4DCD0] p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    fontSize === 'sm' ? 'bg-[#A36B3B] text-white font-bold' : 'text-[#54575E] hover:text-[#141416]'
                  }`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('base')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    fontSize === 'base' ? 'bg-[#A36B3B] text-white font-bold' : 'text-[#54575E] hover:text-[#141416]'
                  }`}
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    fontSize === 'lg' ? 'bg-[#A36B3B] text-white font-bold' : 'text-[#54575E] hover:text-[#141416]'
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
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFEAE1] border border-[#E4DCD0] text-[#141416] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
                title="Copy full lyrics to clipboard"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#8D5A30]" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!cleanedText}
                className="px-3.5 py-1.5 rounded-xl bg-[#A36B3B] hover:bg-[#8D5A30] text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-40"
                title="Download lyrics as a .txt document"
              >
                {downloaded ? <Check className="h-3.5 w-3.5 text-white" /> : <Download className="h-3.5 w-3.5 text-white" />}
                <span>{downloaded ? 'Downloaded!' : 'Download (.txt)'}</span>
              </button>
            </div>
          </div>

          {/* Lyrics Content Container */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-sans space-y-4 bg-[#FCFBF9]">
            {cleanedText ? (
              <div 
                className={`whitespace-pre-line leading-relaxed text-[#222326] select-text font-serif italic ${
                  fontSize === 'sm' ? 'text-sm' : fontSize === 'base' ? 'text-base' : 'text-lg'
                }`}
              >
                {cleanedText}
              </div>
            ) : (
              <div className="py-12 text-center text-[#8A8E96] space-y-2">
                <Music className="h-10 w-10 mx-auto text-[#C28B57]/60" />
                <p className="text-sm font-medium text-[#141416]">No lyrics document published for this song yet.</p>
                <p className="text-xs text-[#8A8E96]">
                  Worship ministers and church admins can add lyrics in the Admin Portal.
                </p>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-[#F7F5F0] border-t border-[#EFEAE1] flex items-center justify-between text-[11px] font-mono text-[#8A8E96]">
            <span>God's Edifice Church • Crossworship Collection</span>
            <button
              onClick={onClose}
              className="text-[#714624] hover:text-[#141416] underline cursor-pointer font-sans"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
