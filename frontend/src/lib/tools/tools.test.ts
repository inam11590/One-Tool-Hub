import test from "node:test";
import assert from "node:assert/strict";

import {
  formatByteSize,
  getUtf8ByteSize,
  MAX_JSON_SIZE_BYTES,
  validateAndFormatJson,
} from "./json-formatter.ts";
import {
  buildCompressedFileName,
  calculateSizeReduction,
  MAX_IMAGE_FILE_SIZE_BYTES,
  validateImageDimensions,
  validateImageFileMetadata,
} from "./image-compressor.ts";
import {
  generateQrCodeAssets,
  getContrastRatio,
  MAX_QR_INPUT_LENGTH,
  validateQrOptions,
} from "./qr-code-generator.ts";
import { analyzeTextMetrics } from "./word-counter.ts";
import {
  analyzeAndFormatYouTubeTimestamps,
  formatSecondsToTimestamp,
  parseTimestampToken,
} from "./youtube-timestamp-formatter.ts";

// ============================================================================
// TOOL 1: JSON Formatter & Validator Tests
// ============================================================================
test("JSON Formatter: formats valid JSON with 2-space, 4-space, and minify (0)", () => {
  const raw = '{"b":1,"a":[true,null,"hello"]}';
  const res2 = validateAndFormatJson(raw, 2);
  assert.equal(res2.valid, true);
  assert.equal(
    res2.output,
    '{\n  "b": 1,\n  "a": [\n    true,\n    null,\n    "hello"\n  ]\n}'
  );

  const res4 = validateAndFormatJson(raw, 4);
  assert.equal(res4.valid, true);
  assert.ok(res4.output?.includes('    "b": 1'));

  const resMin = validateAndFormatJson(res2.output ?? "", 0);
  assert.equal(resMin.valid, true);
  assert.equal(resMin.output, raw);
});

test("JSON Formatter: handles nested JSON structures and byte sizes accurately", () => {
  const nested = JSON.stringify({
    level1: {
      level2: {
        level3: [{ id: 1, title: "Nested" }],
      },
    },
  });
  const res = validateAndFormatJson(nested, 2);
  assert.equal(res.valid, true);
  assert.equal(res.inputBytes, getUtf8ByteSize(nested));
  assert.ok((res.outputBytes ?? 0) > res.inputBytes);
  assert.equal(formatByteSize(512), "512 B");
});

test("JSON Formatter: rejects empty input and invalid JSON with helpful error", () => {
  const emptyRes = validateAndFormatJson("   ", 2);
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error?.message.includes("Please enter or upload"));

  const invalidRes = validateAndFormatJson('{"name": "OneToolHub",}', 2);
  assert.equal(invalidRes.valid, false);
  assert.ok(invalidRes.error?.message.length);
});

test("JSON Formatter: rejects oversized payloads exceeding 2 MB limit", () => {
  const oversized = "a".repeat(MAX_JSON_SIZE_BYTES + 10);
  const res = validateAndFormatJson(oversized, 2);
  assert.equal(res.valid, false);
  assert.ok(res.error?.message.includes("exceeds the 2 MB"));
});

// ============================================================================
// TOOL 2: Image Compressor Tests
// ============================================================================
test("Image Compressor: accepts supported JPEG, PNG, and WebP files", () => {
  for (const mime of ["image/jpeg", "image/png", "image/webp"]) {
    const res = validateImageFileMetadata({
      name: "photo.jpg",
      type: mime,
      size: 1024 * 500,
    });
    assert.equal(res.valid, true);
  }
});

test("Image Compressor: rejects unsupported file types and oversized files", () => {
  const unsupported = validateImageFileMetadata({
    name: "anim.gif",
    type: "image/gif",
    size: 2048,
  });
  assert.equal(unsupported.valid, false);
  assert.ok(unsupported.error?.includes("Unsupported file format"));

  const oversized = validateImageFileMetadata({
    name: "huge.png",
    type: "image/png",
    size: MAX_IMAGE_FILE_SIZE_BYTES + 1,
  });
  assert.equal(oversized.valid, false);
  assert.ok(oversized.error?.includes("exceeds the 25 MB limit"));
});

test("Image Compressor: validates dimensions and computes size reduction & filenames", () => {
  assert.equal(validateImageDimensions(1920, 1080).valid, true);
  assert.equal(validateImageDimensions(9000, 1000).valid, false);

  const reduction = calculateSizeReduction(1000, 400);
  assert.equal(reduction.isSmaller, true);
  assert.equal(reduction.percentageChange, 60);
  assert.equal(reduction.summaryLabel, "-60.0% smaller");

  const increase = calculateSizeReduction(1000, 1250);
  assert.equal(increase.isSmaller, false);
  assert.equal(increase.summaryLabel, "+25.0% larger");

  assert.equal(
    buildCompressedFileName("my_thumbnail.png", "image/webp"),
    "my_thumbnail-compressed.webp"
  );
});

// ============================================================================
// TOOL 3: QR Code Generator Tests
// ============================================================================
test("QR Generator: generates valid PNG data URL and SVG string for URLs and Unicode", async () => {
  const urlRes = await generateQrCodeAssets({
    text: "https://onetoolhub.com/tools/qr-code-generator",
    size: 320,
    foregroundColor: "#0F172A",
    backgroundColor: "#FFFFFF",
  });
  assert.equal(urlRes.valid, true);
  assert.ok(urlRes.pngDataUrl?.startsWith("data:image/png;base64,"));
  assert.ok(urlRes.svgString?.includes("<svg"));

  const unicodeRes = await generateQrCodeAssets({
    text: "こんにちは世界 • OneToolHub 🚀",
    size: 256,
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
  });
  assert.equal(unicodeRes.valid, true);
  assert.ok(unicodeRes.pngDataUrl?.startsWith("data:image/png;base64,"));
  assert.ok(unicodeRes.svgString?.includes("<svg"));
});

test("QR Generator: rejects empty or overly long input and warns on low contrast", () => {
  const emptyRes = validateQrOptions({
    text: "   ",
    size: 320,
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
  });
  assert.equal(emptyRes.valid, false);

  const tooLongRes = validateQrOptions({
    text: "x".repeat(MAX_QR_INPUT_LENGTH + 1),
    size: 320,
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
  });
  assert.equal(tooLongRes.valid, false);

  const lowContrast = validateQrOptions({
    text: "https://onetoolhub.com",
    size: 320,
    foregroundColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  });
  assert.equal(lowContrast.valid, true);
  assert.ok(lowContrast.contrastWarning?.includes("Low color contrast"));
  assert.ok((getContrastRatio("#000000", "#FFFFFF") ?? 0) > 20);
});

// ============================================================================
// TOOL 4: Word Counter Tests
// ============================================================================
test("Word Counter: handles empty text, multiple spaces, multiline text, and Unicode", () => {
  const empty = analyzeTextMetrics("   \n\n  ");
  assert.equal(empty.words, 0);
  assert.equal(empty.charactersWithoutSpaces, 0);
  assert.equal(empty.sentences, 0);
  assert.equal(empty.paragraphs, 0);

  const multiSpace = analyzeTextMetrics("Hello    world!   How   are   you?");
  assert.equal(multiSpace.words, 5);
  assert.equal(multiSpace.charactersWithoutSpaces, 21);
  assert.equal(multiSpace.sentences, 2);
  assert.equal(multiSpace.paragraphs, 1);

  const multiline = analyzeTextMetrics(
    "First paragraph line one.\nStill first paragraph.\n\nSecond paragraph here!"
  );
  assert.equal(multiline.words, 10);
  assert.equal(multiline.paragraphs, 2);
  assert.equal(multiline.sentences, 3);

  const unicode = analyzeTextMetrics("Café résumé naïve. Привет мир!");
  assert.equal(unicode.words, 5);
  assert.equal(unicode.sentences, 2);
});

// ============================================================================
// TOOL 5: YouTube Timestamp Formatter Tests
// ============================================================================
test("YouTube Timestamp Formatter: parses valid MM:SS, HH:MM:SS, and trailing timestamps", () => {
  const input = [
    "0:00 Intro",
    "01:30 - Project Setup",
    "Deep Dive 05:45",
    "1:02:15 Final Wrap Up",
  ].join("\n");

  const res = analyzeAndFormatYouTubeTimestamps(input);
  assert.equal(res.malformedLines.length, 0);
  assert.equal(res.startsAtZero, true);
  assert.equal(res.hasMinimumThreeChapters, true);
  assert.equal(res.isChronological, true);
  assert.equal(res.allChaptersAtLeastTenSeconds, true);
  assert.equal(res.readyForYouTube, true);
  // Because 1:02:15 is >= 1 hour, all timestamps normalize to HH:MM:SS
  assert.equal(
    res.formattedOutput,
    [
      "00:00:00 Intro",
      "00:01:30 Project Setup",
      "00:05:45 Deep Dive",
      "01:02:15 Final Wrap Up",
    ].join("\n")
  );
});

test("YouTube Timestamp Formatter: detects invalid, duplicate, out-of-order, and <10s chapters", () => {
  const input = [
    "00:00 Intro",
    "00:05 Too Short Gap",
    "02:00 Section B",
    "01:00 Out of Order Section A",
    "02:00 Duplicate Section",
    "03:75 Invalid Seconds",
  ].join("\n");

  const res = analyzeAndFormatYouTubeTimestamps(input, {
    sortChronologically: false,
  });

  assert.equal(res.malformedLines.length, 1);
  assert.equal(res.malformedLines[0]?.lineNumber, 6);
  assert.deepEqual(res.duplicateTimestamps, ["02:00"]);
  assert.equal(res.outOfOrderLines.length, 1);
  assert.equal(res.shortChapters.length, 1);
  assert.equal(res.shortChapters[0]?.durationSeconds, 5);
  assert.equal(res.readyForYouTube, false);

  // Also test parseTimestampToken directly
  assert.equal(parseTimestampToken("05:60").valid, false);
  assert.equal(formatSecondsToTimestamp(3661), "01:01:01");
});
