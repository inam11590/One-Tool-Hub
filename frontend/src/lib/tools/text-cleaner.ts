/**
 * Client-Side Text Cleaner & Formatter Logic
 *
 * Configurable transformations applied in a deterministic, documented order:
 * 1. Normalize Line Endings (CRLF / CR -> standard LF)
 * 2. Strip HTML Tags (<...>)
 * 3. Convert Tabs to Spaces
 * 4. Remove Extra Inline Spaces (2+ spaces -> 1 space)
 * 5. Trim Line Boundaries (leading and trailing whitespace per line)
 * 6. Blank Line Management (Remove Empty Lines or Reduce to 1 Blank Line)
 * 7. Duplicate Line Removal (with optional case-insensitivity)
 *
 * 100% In-Browser. No data sent to external servers.
 */

export interface TextCleanerOptions {
  normalizeLineEndings: boolean;
  stripHtmlTags: boolean;
  convertTabsToSpaces: boolean;
  removeExtraSpaces: boolean;
  trimLines: boolean;
  removeEmptyLines: boolean;
  reduceBlankLines: boolean;
  removeDuplicateLines: boolean;
  caseInsensitiveDuplicates: boolean;
}

export interface TextCleanerStats {
  originalCharacters: number;
  cleanedCharacters: number;
  charactersRemoved: number;
  originalLines: number;
  cleanedLines: number;
  linesRemoved: number;
}

export interface TextCleanerResult {
  cleanedText: string;
  stats: TextCleanerStats;
}

export const DEFAULT_CLEANER_OPTIONS: TextCleanerOptions = {
  normalizeLineEndings: true,
  stripHtmlTags: false,
  convertTabsToSpaces: true,
  removeExtraSpaces: true,
  trimLines: true,
  removeEmptyLines: false,
  reduceBlankLines: true,
  removeDuplicateLines: false,
  caseInsensitiveDuplicates: false,
};

/**
 * Cleans and reformats text according to configured transformation options.
 */
export function cleanText(
  inputText: string,
  options: Partial<TextCleanerOptions> = {}
): TextCleanerResult {
  const opts: TextCleanerOptions = { ...DEFAULT_CLEANER_OPTIONS, ...options };

  if (!inputText) {
    return {
      cleanedText: "",
      stats: {
        originalCharacters: 0,
        cleanedCharacters: 0,
        charactersRemoved: 0,
        originalLines: 0,
        cleanedLines: 0,
        linesRemoved: 0,
      },
    };
  }

  let text = inputText;

  // Step 1: Normalize Line Endings
  if (opts.normalizeLineEndings) {
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  // Step 2: Strip HTML Tags
  if (opts.stripHtmlTags) {
    text = text.replace(/<[^>]*>/g, "");
  }

  // Step 3: Convert Tabs to Spaces (4 spaces per tab)
  if (opts.convertTabsToSpaces) {
    text = text.replace(/\t/g, "    ");
  }

  // Split into lines for line-level operations
  let lines = text.split("\n");

  // Step 4 & 5: Line trimming and removing extra intra-line spaces
  lines = lines.map((line) => {
    let processedLine = line;
    if (opts.removeExtraSpaces) {
      processedLine = processedLine.replace(/ {2,}/g, " ");
    }
    if (opts.trimLines) {
      processedLine = processedLine.trim();
    }
    return processedLine;
  });

  // Step 6: Empty/Blank line management
  if (opts.removeEmptyLines) {
    lines = lines.filter((line) => line.length > 0);
  } else if (opts.reduceBlankLines) {
    const reduced: string[] = [];
    let prevWasEmpty = false;

    for (const line of lines) {
      const isEmpty = line.length === 0;
      if (isEmpty) {
        if (!prevWasEmpty) {
          reduced.push(line);
          prevWasEmpty = true;
        }
      } else {
        reduced.push(line);
        prevWasEmpty = false;
      }
    }
    lines = reduced;
  }

  // Step 7: Duplicate Line Removal
  if (opts.removeDuplicateLines) {
    const seen = new Set<string>();
    const deduplicated: string[] = [];

    for (const line of lines) {
      // Don't deduplicate blank lines if user wants spacing
      if (line.length === 0) {
        deduplicated.push(line);
        continue;
      }

      const key = opts.caseInsensitiveDuplicates ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(line);
      }
    }
    lines = deduplicated;
  }

  const cleanedText = lines.join("\n");

  const originalCharacters = inputText.length;
  const cleanedCharacters = cleanedText.length;
  const charactersRemoved = Math.max(0, originalCharacters - cleanedCharacters);

  const originalLines = inputText.split("\n").length;
  const cleanedLines = lines.length;
  const linesRemoved = Math.max(0, originalLines - cleanedLines);

  return {
    cleanedText,
    stats: {
      originalCharacters,
      cleanedCharacters,
      charactersRemoved,
      originalLines,
      cleanedLines,
      linesRemoved,
    },
  };
}

export const SAMPLE_MESSY_TEXT = `   Introduction to Artificial Intelligence     
	
A machine learning algorithm analyzes  data  patterns.   
A machine learning algorithm analyzes  data  patterns.   
A MACHINE LEARNING ALGORITHM ANALYZES  DATA  PATTERNS.   


It can categorize images, translate languages, and predict trends.    
	
	
<p>Modern applications utilize neural networks.</p>

Conclusion and summary findings.    `;
