export interface LyricLine {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  isHeader?: boolean;
  headerType?: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'tag' | 'vamp' | 'other';
  rawTimestamp?: string;
}

/**
 * Parses timestamped (LRC) or plain-text lyrics into a list of timed lines.
 * If timestamps [mm:ss] or [mm:ss.xx] or [mm:ss - mm:ss] are present, parses them directly.
 * If plain text without timestamps is provided, it intelligently distributes timings
 * across the total duration of the song with natural worship music phrasing and vocal pauses,
 * ensuring seamless playback synchronization, click-to-seek, and pause holding.
 */
export function parseSyncedLyrics(rawLyrics: string, totalDuration: number = 240): LyricLine[] {
  if (!rawLyrics || !rawLyrics.trim()) return [];

  const rawLines = rawLyrics.split('\n');
  // Matches [mm:ss], [mm:ss.xx], [mm:ss.xxx], (mm:ss), [hh:mm:ss], [mm:ss - mm:ss], [mm:ss][mm:ss]
  const timestampRegex = /^(?:\[|\()(\d{1,2}):(\d{2}(?:\.\d{1,3})?)(?:\]|\))(?:(?:\s*[-–—to]+\s*|\s*)(?:\[|\()(\d{1,2}):(\d{2}(?:\.\d{1,3})?)(?:\]|\)))?(.*)$/;
  const headerRegex = /^(?:\[|\()?(verse\s*\d*|chorus\s*\d*|bridge\s*\d*|intro|outro|vamp|hook|tag|interlude|pre-chorus|refrain)(?:\]|\))?$/i;

  let hasExplicitTimestamps = false;
  const parsedItems: {
    text: string;
    explicitStartTime: number | null;
    explicitEndTime: number | null;
    isHeader: boolean;
    headerType?: LyricLine['headerType'];
    rawTimestamp?: string;
  }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i].trim();
    if (!raw) continue;

    const timeMatch = raw.match(timestampRegex);
    if (timeMatch) {
      hasExplicitTimestamps = true;
      const startMins = parseInt(timeMatch[1], 10);
      const startSecs = parseFloat(timeMatch[2]);
      const explicitStartTime = startMins * 60 + startSecs;

      let explicitEndTime: number | null = null;
      if (timeMatch[3] !== undefined && timeMatch[4] !== undefined) {
        const endMins = parseInt(timeMatch[3], 10);
        const endSecs = parseFloat(timeMatch[4]);
        explicitEndTime = endMins * 60 + endSecs;
      }

      let content = (timeMatch[5] || '').trim();
      
      // Check if content begins with another section header like "[Verse 1]" or "[Chorus]"
      let isHeader = headerRegex.test(content);
      let headerType: LyricLine['headerType'] = undefined;

      const innerHeaderMatch = content.match(/^(?:\[|\()([a-zA-Z0-9\s]+)(?:\]|\))(.*)$/);
      if (innerHeaderMatch) {
        const potentialHeader = innerHeaderMatch[1].trim();
        const remaining = innerHeaderMatch[2].trim();
        if (headerRegex.test(potentialHeader)) {
          if (!remaining) {
            isHeader = true;
            content = potentialHeader;
          } else {
            // Keep content as header + text or separate
            content = `${potentialHeader}: ${remaining}`;
          }
        }
      }

      if (isHeader || headerRegex.test(content)) {
        isHeader = true;
        const lower = content.toLowerCase();
        if (lower.includes('verse')) headerType = 'verse';
        else if (lower.includes('chorus')) headerType = 'chorus';
        else if (lower.includes('bridge')) headerType = 'bridge';
        else if (lower.includes('intro')) headerType = 'intro';
        else if (lower.includes('outro')) headerType = 'outro';
        else if (lower.includes('vamp') || lower.includes('tag')) headerType = 'tag';
        else headerType = 'other';
      }

      parsedItems.push({
        text: content,
        explicitStartTime,
        explicitEndTime,
        isHeader,
        headerType,
        rawTimestamp: timeMatch[0]
      });
    } else {
      const isHeader = headerRegex.test(raw);
      let headerType: LyricLine['headerType'] = undefined;
      if (isHeader) {
        const lower = raw.toLowerCase();
        if (lower.includes('verse')) headerType = 'verse';
        else if (lower.includes('chorus')) headerType = 'chorus';
        else if (lower.includes('bridge')) headerType = 'bridge';
        else if (lower.includes('intro')) headerType = 'intro';
        else if (lower.includes('outro')) headerType = 'outro';
        else if (lower.includes('vamp') || lower.includes('tag')) headerType = 'tag';
        else headerType = 'other';
      }

      parsedItems.push({
        text: raw,
        explicitStartTime: null,
        explicitEndTime: null,
        isHeader,
        headerType
      });
    }
  }

  if (parsedItems.length === 0) return [];

  const duration = Math.max(totalDuration > 0 ? totalDuration : 240, 30);

  // If explicit timestamps exist for lines
  if (hasExplicitTimestamps) {
    const timedLines: LyricLine[] = [];

    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      let startTime = item.explicitStartTime;

      // If a line in the middle missed a timestamp, interpolate between adjacent timestamps
      if (startTime === null) {
        let prevTime = 0;
        let prevIdx = -1;
        for (let p = i - 1; p >= 0; p--) {
          if (parsedItems[p].explicitStartTime !== null) {
            prevTime = parsedItems[p].explicitStartTime!;
            prevIdx = p;
            break;
          }
        }

        let nextTime = duration;
        let nextIdx = parsedItems.length;
        for (let n = i + 1; n < parsedItems.length; n++) {
          if (parsedItems[n].explicitStartTime !== null) {
            nextTime = parsedItems[n].explicitStartTime!;
            nextIdx = n;
            break;
          }
        }

        const steps = Math.max(nextIdx - prevIdx, 1);
        const currentStep = i - prevIdx;
        startTime = prevTime + ((nextTime - prevTime) / steps) * currentStep;
      }

      timedLines.push({
        id: `lyric-${i}`,
        text: item.text,
        startTime,
        endTime: item.explicitEndTime || (startTime + 4),
        isHeader: item.isHeader,
        headerType: item.headerType
      });
    }

    // Set endTimes properly based on next line's startTime to hold through natural singer pauses
    for (let i = 0; i < timedLines.length; i++) {
      if (i < timedLines.length - 1) {
        const nextStart = timedLines[i + 1].startTime;
        // Hold current lyric until the next line begins (natural vocal pause holding)
        timedLines[i].endTime = Math.max(timedLines[i].startTime + 0.5, nextStart);
      } else {
        // Last line holds until song ends or +6s
        timedLines[i].endTime = Math.max(timedLines[i].startTime + 6, duration);
      }
    }

    return timedLines;
  }

  // If plain text lyrics without timestamps:
  // Intelligently distribute timings across duration with musical phrasing and pause holds!
  const introBuffer = Math.min(10, duration * 0.06); // 6-10s intro
  const outroBuffer = Math.min(12, duration * 0.08); // 8-12s outro
  const usableDuration = Math.max(duration - introBuffer - outroBuffer, 15);

  const totalWeight = parsedItems.reduce((acc, item) => {
    if (item.isHeader) return acc + 0.5;
    const wordCount = item.text.split(/\s+/).filter(Boolean).length;
    return acc + Math.max(wordCount, 3);
  }, 0);

  const timedLines: LyricLine[] = [];
  let accumulatedTime = introBuffer;

  for (let i = 0; i < parsedItems.length; i++) {
    const item = parsedItems[i];
    const weight = item.isHeader
      ? 0.5
      : Math.max(item.text.split(/\s+/).filter(Boolean).length, 3);
    
    const lineDuration = (weight / totalWeight) * usableDuration;
    const startTime = accumulatedTime;
    const endTime = startTime + lineDuration;
    accumulatedTime = endTime;

    timedLines.push({
      id: `lyric-${i}`,
      text: item.text,
      startTime,
      endTime,
      isHeader: item.isHeader,
      headerType: item.headerType
    });
  }

  return timedLines;
}

/**
 * Finds the active lyric line index for a given playback timestamp.
 * Includes a subtle 0.20s anticipation lead time so the lyric highlights
 * and scrolls into view smoothly as the singer begins the phrase.
 * When the singer pauses, the current lyric remains held until the next phrase begins.
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number, anticipationLead: number = 0.20): number {
  if (!lines || lines.length === 0) return -1;
  const effectiveTime = Math.max(0, currentTime + anticipationLead);

  // Before the very first line starts, keep line 0 focused/ready
  if (effectiveTime < lines[0].startTime) return 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (effectiveTime >= line.startTime && effectiveTime < line.endTime) {
      return i;
    }
  }

  // If past the last line, retain the final line
  return lines.length - 1;
}

/**
 * Formats seconds to mm:ss format
 */
export function formatLyricTime(timeInSeconds: number): string {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
  const mins = Math.floor(timeInSeconds / 60);
  const secs = Math.floor(timeInSeconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

