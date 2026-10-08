export const MAX_JSON_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB limit for smooth browser editing

export interface JsonErrorDetails {
  message: string;
  line?: number;
  column?: number;
}

export interface JsonProcessResult {
  valid: boolean;
  output?: string;
  error?: JsonErrorDetails;
  inputBytes: number;
  outputBytes?: number;
}

export function getUtf8ByteSize(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB (${bytes.toLocaleString()} B)`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} B)`;
}

function extractLineAndColumn(
  rawInput: string,
  errorMessage: string
): { line?: number; column?: number } {
  // Check explicit line/column in Firefox/Safari/modern V8 messages
  const lineColMatch = errorMessage.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch?.[1] && lineColMatch[2]) {
    return {
      line: Number.parseInt(lineColMatch[1], 10),
      column: Number.parseInt(lineColMatch[2], 10),
    };
  }

  // Check position offset in V8 messages ("at position 42")
  const posMatch = errorMessage.match(/position\s+(\d+)/i);
  if (posMatch?.[1]) {
    const position = Number.parseInt(posMatch[1], 10);
    if (!Number.isNaN(position) && position >= 0 && position <= rawInput.length) {
      const slice = rawInput.slice(0, position);
      const lines = slice.split("\n");
      const line = lines.length;
      const lastLine = lines[lines.length - 1] ?? "";
      const column = lastLine.length + 1;
      return { line, column };
    }
  }

  return {};
}

export function validateAndFormatJson(
  input: string,
  indent: 2 | 4 | 0 = 2
): JsonProcessResult {
  const inputBytes = getUtf8ByteSize(input);

  if (inputBytes === 0 || input.trim().length === 0) {
    return {
      valid: false,
      inputBytes,
      error: {
        message: "Please enter or upload a JSON document to validate or format.",
      },
    };
  }

  if (inputBytes > MAX_JSON_SIZE_BYTES) {
    return {
      valid: false,
      inputBytes,
      error: {
        message: `Input size (${formatByteSize(inputBytes)}) exceeds the 2 MB browser safety limit.`,
      },
    };
  }

  try {
    const parsed: unknown = JSON.parse(input);
    const output =
      indent === 0
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indent);
    const outputBytes = getUtf8ByteSize(output);

    return {
      valid: true,
      output,
      inputBytes,
      outputBytes,
    };
  } catch (err) {
    const rawMessage =
      err instanceof Error ? err.message : "Invalid JSON syntax.";
    const { line, column } = extractLineAndColumn(input, rawMessage);

    return {
      valid: false,
      inputBytes,
      error: {
        message: rawMessage,
        line,
        column,
      },
    };
  }
}

export const SAMPLE_JSON_DOCUMENT = JSON.stringify(
  {
    platform: "OneToolHub",
    version: "1.0.0",
    active: true,
    categories: ["Student Tools", "Freelancer Tools", "YouTube Tools", "Developer Tools"],
    metadata: {
      processedLocally: true,
      maxFileSizeMB: 2,
    },
  },
  null,
  2
);
