/**
 * Lyrics Helper Utility
 * Provides clean text formatting, document download, and clipboard utilities for song lyrics.
 * Strips all timestamp brackets [mm:ss] / [mm:ss.xx] and formats clean readable lyrics.
 */

export interface FormattedLyrics {
  plainText: string;
  lines: string[];
  hasLyrics: boolean;
}

/**
 * Strips timestamps (e.g. [01:23], [02:34.50], (01:20)) from raw lyrics
 * and returns clean, human-readable lyric text formatted for viewing and text file export.
 */
export function cleanLyricsText(rawLyrics?: string): string {
  if (!rawLyrics || !rawLyrics.trim()) {
    return '';
  }

  const timestampRegex = /^(?:\[|\()\d{1,2}:\d{2}(?:\.\d{1,3})?(?:\]|\))\s*/gm;
  const innerTimestampRegex = /\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g;
  
  // Remove starting and inline timestamp tags
  let cleaned = rawLyrics
    .replace(timestampRegex, '')
    .replace(innerTimestampRegex, '')
    .trim();

  // Normalize excessive blank lines (max 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

/**
 * Generates and triggers the download of a clean .txt lyrics document for a song.
 */
export function downloadLyricsFile(title: string, artist: string, album: string, rawLyrics?: string): boolean {
  const cleaned = cleanLyricsText(rawLyrics);
  if (!cleaned) {
    return false;
  }

  const documentContent = `=====================================================
${title.toUpperCase()}
Artist: ${artist || 'Crossworship'}
Album: ${album || 'Edifice Worship Collection'}
God's Edifice Church • Crossworship Ministry
=====================================================

${cleaned}

=====================================================
Downloaded from God's Edifice Church Songs Portal
=====================================================`;

  try {
    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `${safeTitle}_Lyrics.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Failed to download lyrics file:', error);
    return false;
  }
}

/**
 * Copies clean lyrics to the user's clipboard.
 */
export async function copyLyricsToClipboard(title: string, artist: string, rawLyrics?: string): Promise<boolean> {
  const cleaned = cleanLyricsText(rawLyrics);
  if (!cleaned) return false;

  const textToCopy = `${title} - ${artist}\n\n${cleaned}`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy lyrics to clipboard:', err);
    return false;
  }
}
