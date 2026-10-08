export interface WordCountMetrics {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  readingTimeLabel: string;
}

const WORDS_PER_MINUTE = 200;

function countWordsInText(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
      let count = 0;
      for (const segment of segmenter.segment(trimmed)) {
        if (segment.isWordLike) {
          count += 1;
        }
      }
      return count;
    } catch {
      // Fallback to Unicode regex below
    }
  }

  const matches = trimmed.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return matches ? matches.length : 0;
}

function countSentencesInText(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, {
        granularity: "sentence",
      });
      let count = 0;
      for (const segment of segmenter.segment(trimmed)) {
        if (segment.segment.trim().length > 0) {
          count += 1;
        }
      }
      return count;
    } catch {
      // Fallback below
    }
  }

  const parts = trimmed
    .split(/[.!?。！？]+/u)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.length : 1;
}

export function analyzeTextMetrics(text: string): WordCountMetrics {
  const normalized = text.replace(/\r\n/g, "\n");
  const charactersWithSpaces = Array.from(normalized).length;
  const charactersWithoutSpaces = Array.from(
    normalized.replace(/\s+/gu, "")
  ).length;

  const words = countWordsInText(normalized);
  const sentences = words === 0 && charactersWithoutSpaces === 0
    ? 0
    : countSentencesInText(normalized);

  const paragraphs =
    normalized.trim().length === 0
      ? 0
      : normalized
          .trim()
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean).length;

  let readingTimeMinutes = 0;
  let readingTimeLabel = "0 sec";

  if (words > 0) {
    const totalSeconds = Math.ceil((words / WORDS_PER_MINUTE) * 60);
    readingTimeMinutes = Number((words / WORDS_PER_MINUTE).toFixed(2));
    if (totalSeconds < 60) {
      readingTimeLabel = `${totalSeconds} sec`;
    } else {
      const mins = Math.ceil(words / WORDS_PER_MINUTE);
      readingTimeLabel = `${mins} min read`;
    }
  }

  return {
    words,
    charactersWithSpaces,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    readingTimeLabel,
  };
}
