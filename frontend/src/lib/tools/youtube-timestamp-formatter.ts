export interface ParsedChapterLine {
  lineNumber: number;
  rawLine: string;
  seconds: number;
  formattedTimestamp: string;
  title: string;
}

export interface MalformedTimestampLine {
  lineNumber: number;
  rawLine: string;
  reason: string;
}

export interface ShortChapterWarning {
  chapterTitle: string;
  timestamp: string;
  durationSeconds: number;
}

export interface YouTubeTimestampAnalysis {
  parsedChapters: ParsedChapterLine[];
  normalizedChapters: ParsedChapterLine[];
  formattedOutput: string;
  malformedLines: MalformedTimestampLine[];
  duplicateTimestamps: string[];
  outOfOrderLines: Array<{
    lineNumber: number;
    timestamp: string;
    previousTimestamp: string;
  }>;
  shortChapters: ShortChapterWarning[];
  startsAtZero: boolean;
  hasMinimumThreeChapters: boolean;
  isChronological: boolean;
  allChaptersAtLeastTenSeconds: boolean;
  readyForYouTube: boolean;
}

const TIMESTAMP_TOKEN_SOURCE = "(?:\\d{1,2}:)?\\d{1,2}:\\d{1,2}";
const LEADING_TS_REGEX = new RegExp(
  `^\\s*(?:[-*•]|\\d+\\.)?\\s*\\[?(${TIMESTAMP_TOKEN_SOURCE})\\]?(?:\\s*(?:[-–—:|]|\\s)\\s*(.+))?\\s*$`
);
const TRAILING_TS_REGEX = new RegExp(
  `^\\s*(.+?)(?:\\s*(?:[-–—:|]|\\s)\\s*)\\[?(${TIMESTAMP_TOKEN_SOURCE})\\]?\\s*$`
);

export function parseTimestampToken(token: string): {
  valid: boolean;
  seconds?: number;
  error?: string;
} {
  const parts = token.trim().split(":");
  if (parts.length !== 2 && parts.length !== 3) {
    return {
      valid: false,
      error: `Invalid timestamp "${token}". Expected MM:SS or HH:MM:SS.`,
    };
  }

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0)) {
    return {
      valid: false,
      error: `Timestamp "${token}" contains non-numeric values.`,
    };
  }

  if (parts.length === 2) {
    const minutes = nums[0]!;
    const seconds = nums[1]!;
    if (parts[1]!.length !== 2) {
      return {
        valid: false,
        error: `Seconds in "${token}" must be two digits (00–59).`,
      };
    }
    if (seconds >= 60) {
      return {
        valid: false,
        error: `Seconds in "${token}" must be between 00 and 59.`,
      };
    }
    return {
      valid: true,
      seconds: minutes * 60 + seconds,
    };
  }

  const hours = nums[0]!;
  const minutes = nums[1]!;
  const seconds = nums[2]!;

  if (parts[1]!.length !== 2 || parts[2]!.length !== 2) {
    return {
      valid: false,
      error: `Minutes and seconds in "${token}" must be two digits (00–59).`,
    };
  }

  if (minutes >= 60 || seconds >= 60) {
    return {
      valid: false,
      error: `Minutes and seconds in "${token}" must be between 00 and 59.`,
    };
  }

  return {
    valid: true,
    seconds: hours * 3600 + minutes * 60 + seconds,
  };
}

export function formatSecondsToTimestamp(
  totalSeconds: number,
  forceHours = false
): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const pad2 = (n: number) => String(n).padStart(2, "0");

  if (hours > 0 || forceHours) {
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function cleanChapterTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^[-–—:|•\s]+/, "")
    .replace(/[-–—:|•\s]+$/, "")
    .trim();
}

export function analyzeAndFormatYouTubeTimestamps(
  input: string,
  options: { sortChronologically?: boolean } = { sortChronologically: false }
): YouTubeTimestampAnalysis {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const parsedChapters: ParsedChapterLine[] = [];
  const malformedLines: MalformedTimestampLine[] = [];

  lines.forEach((rawLine, idx) => {
    const lineNumber = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed) {
      return;
    }

    // Check if line has multiple timestamp-like patterns making it ambiguous
    const allTsTokens = trimmed.match(/\b(?:\d{1,2}:)?\d{1,2}:\d{1,2}\b/g) ?? [];
    if (allTsTokens.length > 1) {
      malformedLines.push({
        lineNumber,
        rawLine,
        reason:
          "Line contains multiple timestamps and is ambiguous. Place one timestamp and title per line.",
      });
      return;
    }

    const leadingMatch = trimmed.match(LEADING_TS_REGEX);
    if (leadingMatch?.[1]) {
      const tsToken = leadingMatch[1];
      const titleCandidate = cleanChapterTitle(leadingMatch[2] ?? "");
      const parsedTs = parseTimestampToken(tsToken);
      if (!parsedTs.valid || parsedTs.seconds === undefined) {
        malformedLines.push({
          lineNumber,
          rawLine,
          reason: parsedTs.error ?? "Invalid timestamp format.",
        });
        return;
      }
      if (!titleCandidate) {
        malformedLines.push({
          lineNumber,
          rawLine,
          reason: `Missing chapter title for timestamp "${tsToken}".`,
        });
        return;
      }

      parsedChapters.push({
        lineNumber,
        rawLine,
        seconds: parsedTs.seconds,
        formattedTimestamp: formatSecondsToTimestamp(parsedTs.seconds),
        title: titleCandidate,
      });
      return;
    }

    const trailingMatch = trimmed.match(TRAILING_TS_REGEX);
    if (trailingMatch?.[1] && trailingMatch[2]) {
      const titleCandidate = cleanChapterTitle(trailingMatch[1]);
      const tsToken = trailingMatch[2];
      const parsedTs = parseTimestampToken(tsToken);
      if (!parsedTs.valid || parsedTs.seconds === undefined) {
        malformedLines.push({
          lineNumber,
          rawLine,
          reason: parsedTs.error ?? "Invalid timestamp format.",
        });
        return;
      }
      if (!titleCandidate) {
        malformedLines.push({
          lineNumber,
          rawLine,
          reason: `Missing chapter title for timestamp "${tsToken}".`,
        });
        return;
      }

      parsedChapters.push({
        lineNumber,
        rawLine,
        seconds: parsedTs.seconds,
        formattedTimestamp: formatSecondsToTimestamp(parsedTs.seconds),
        title: titleCandidate,
      });
      return;
    }

    malformedLines.push({
      lineNumber,
      rawLine,
      reason:
        "Could not find a valid MM:SS or HH:MM:SS timestamp paired with a chapter title.",
    });
  });

  // Determine whether any chapter is >= 1 hour so we can format consistently
  const hasHourLongTimestamp = parsedChapters.some((c) => c.seconds >= 3600);
  const chaptersWithConsistentFormat = parsedChapters.map((c) => ({
    ...c,
    formattedTimestamp: formatSecondsToTimestamp(
      c.seconds,
      hasHourLongTimestamp
    ),
  }));

  // Detect duplicates
  const seenCounts = new Map<number, number>();
  for (const chapter of chaptersWithConsistentFormat) {
    seenCounts.set(chapter.seconds, (seenCounts.get(chapter.seconds) ?? 0) + 1);
  }
  const duplicateTimestamps: string[] = [];
  for (const [sec, count] of seenCounts.entries()) {
    if (count > 1) {
      duplicateTimestamps.push(
        formatSecondsToTimestamp(sec, hasHourLongTimestamp)
      );
    }
  }

  // Detect out-of-order entries in the input order
  const outOfOrderLines: Array<{
    lineNumber: number;
    timestamp: string;
    previousTimestamp: string;
  }> = [];
  let maxSecondsSoFar = -1;
  let maxTimestampLabelSoFar = "";
  for (const chapter of chaptersWithConsistentFormat) {
    if (chapter.seconds < maxSecondsSoFar) {
      outOfOrderLines.push({
        lineNumber: chapter.lineNumber,
        timestamp: chapter.formattedTimestamp,
        previousTimestamp: maxTimestampLabelSoFar,
      });
    } else {
      maxSecondsSoFar = chapter.seconds;
      maxTimestampLabelSoFar = chapter.formattedTimestamp;
    }
  }

  const normalizedChapters = options.sortChronologically
    ? [...chaptersWithConsistentFormat].sort((a, b) => a.seconds - b.seconds)
    : chaptersWithConsistentFormat;

  // Check chapter durations (< 10 seconds between consecutive chapters)
  const shortChapters: ShortChapterWarning[] = [];
  for (let i = 0; i < normalizedChapters.length - 1; i++) {
    const current = normalizedChapters[i]!;
    const next = normalizedChapters[i + 1]!;
    const duration = next.seconds - current.seconds;
    if (duration > 0 && duration < 10) {
      shortChapters.push({
        chapterTitle: current.title,
        timestamp: current.formattedTimestamp,
        durationSeconds: duration,
      });
    }
  }

  const startsAtZero =
    normalizedChapters.length > 0 && normalizedChapters[0]!.seconds === 0;
  const hasMinimumThreeChapters = normalizedChapters.length >= 3;
  const isChronological = options.sortChronologically
    ? true
    : outOfOrderLines.length === 0;
  const allChaptersAtLeastTenSeconds = shortChapters.length === 0;

  const readyForYouTube =
    malformedLines.length === 0 &&
    duplicateTimestamps.length === 0 &&
    startsAtZero &&
    hasMinimumThreeChapters &&
    isChronological &&
    allChaptersAtLeastTenSeconds;

  const formattedOutput = normalizedChapters
    .map((c) => `${c.formattedTimestamp} ${c.title}`)
    .join("\n");

  return {
    parsedChapters: chaptersWithConsistentFormat,
    normalizedChapters,
    formattedOutput,
    malformedLines,
    duplicateTimestamps,
    outOfOrderLines,
    shortChapters,
    startsAtZero,
    hasMinimumThreeChapters,
    isChronological,
    allChaptersAtLeastTenSeconds,
    readyForYouTube,
  };
}

export const SAMPLE_YOUTUBE_TIMESTAMPS = `0:00 Introduction & Overview
01:15 Setting Up the Project
03:40 Core Features Walkthrough
07:05 Performance Tips & Best Practices
10:30 Summary & Next Steps`;
