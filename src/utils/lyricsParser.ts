export interface LyricLine {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  isHeader?: boolean;
  headerType?: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'tag' | 'vamp' | 'other';
}

/**
 * Parses timestamped (LRC) or plain-text lyrics into a list of timed lines.
 * If timestamps [mm:ss] or [mm:ss.xx] are present, parses them directly.
 * If plain text without timestamps is provided, it intelligently distributes timings
 * across the total duration of the song, so that words spoken match playback,
 * rewinding, and fast-forwarding seamlessly!
 */
export function parseSyncedLyrics(rawLyrics: string, totalDuration: number = 240): LyricLine[] {
  if (!rawLyrics || !rawLyrics.trim()) return [];

  const rawLines = rawLyrics.split('\n');
  const timestampRegex = /^(?:\[|\()(\d{1,2}):(\d{2}(?:\.\d{1,3})?)(?:\]|\))(.*)$/;
  const headerRegex = /^(?:\[|\()?(verse\s*\d*|chorus\s*\d*|bridge\s*\d*|intro|outro|vamp|hook|tag)(?:\]|\))?$/i;

  let hasExplicitTimestamps = false;
  const parsedItems: {
    text: string;
    explicitTime: number | null;
    isHeader: boolean;
    headerType?: LyricLine['headerType'];
  }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i].trim();
    if (!raw) continue;

    const timeMatch = raw.match(timestampRegex);
    if (timeMatch) {
      hasExplicitTimestamps = true;
      const mins = parseInt(timeMatch[1], 10);
      const secs = parseFloat(timeMatch[2]);
      const content = timeMatch[3].trim();
      const explicitTime = mins * 60 + secs;

      const isHeader = headerRegex.test(content);
      let headerType: LyricLine['headerType'] = undefined;
      if (isHeader) {
        const lower = content.toLowerCase();
        if (lower.includes('verse')) headerType = 'verse';
        else if (lower.includes('chorus')) headerType = 'chorus';
        else if (lower.includes('bridge')) headerType = 'bridge';
        else if (lower.includes('intro')) headerType = 'intro';
        else if (lower.includes('outro')) headerType = 'outro';
        else headerType = 'other';
      }

      parsedItems.push({
        text: content,
        explicitTime,
        isHeader,
        headerType
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
        else headerType = 'other';
      }

      parsedItems.push({
        text: raw,
        explicitTime: null,
        isHeader,
        headerType
      });
    }
  }

  if (parsedItems.length === 0) return [];

  // If explicit timestamps exist for lines
  if (hasExplicitTimestamps) {
    const duration = totalDuration > 0 ? totalDuration : 240;
    const timedLines: LyricLine[] = [];

    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      let startTime = item.explicitTime;

      if (startTime === null) {
        let prevTime = 0;
        let prevIdx = -1;
        for (let p = i - 1; p >= 0; p--) {
          if (parsedItems[p].explicitTime !== null) {
            prevTime = parsedItems[p].explicitTime!;
            prevIdx = p;
            break;
          }
        }

        let nextTime = duration;
        let nextIdx = parsedItems.length;
        for (let n = i + 1; n < parsedItems.length; n++) {
          if (parsedItems[n].explicitTime !== null) {
            nextTime = parsedItems[n].explicitTime!;
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
        endTime: startTime + 4,
        isHeader: item.isHeader,
        headerType: item.headerType
      });
    }

    // Set endTimes properly based on next line's startTime
    for (let i = 0; i < timedLines.length; i++) {
      if (i < timedLines.length - 1) {
        timedLines[i].endTime = Math.max(timedLines[i].startTime + 1, timedLines[i + 1].startTime);
      } else {
        timedLines[i].endTime = Math.max(timedLines[i].startTime + 5, duration);
      }
    }

    return timedLines;
  }

  // If plain text lyrics without timestamps:
  // Dynamically calculate timing checkpoints across the song duration!
  const duration = Math.max(totalDuration || 240, 30);
  const introBuffer = Math.min(6, duration * 0.05);
  const outroBuffer = Math.min(8, duration * 0.06);
  const usableDuration = Math.max(duration - introBuffer - outroBuffer, 10);

  const totalWeight = parsedItems.reduce((acc, item) => {
    if (item.isHeader) return acc + 0.4;
    const wordCount = item.text.split(/\s+/).filter(Boolean).length;
    return acc + Math.max(wordCount, 3);
  }, 0);

  const timedLines: LyricLine[] = [];
  let accumulatedTime = introBuffer;

  for (let i = 0; i < parsedItems.length; i++) {
    const item = parsedItems[i];
    const weight = item.isHeader
      ? 0.4
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
 * Includes a subtle 0.25s anticipation lead time so the lyric lights up
 * and scrolls into view right as the singer begins the phrase.
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number, anticipationLead: number = 0.25): number {
  if (!lines || lines.length === 0) return -1;
  const effectiveTime = Math.max(0, currentTime + anticipationLead);

  if (effectiveTime < lines[0].startTime) return 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (effectiveTime >= line.startTime && effectiveTime < line.endTime) {
      return i;
    }
  }

  // If past the last line, return last line
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