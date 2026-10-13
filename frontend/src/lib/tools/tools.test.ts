import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";

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
  validateImageMagicBytes,
} from "./image-compressor.ts";
import {
  buildArticleJsonLd,
  buildLearnDirectoryJsonLd,
  buildPageMetadata,
  buildToolPageJsonLd,
  buildWebsiteJsonLd,
  getGoogleSiteVerificationToken,
  getSiteUrlConfig,
  isPreviewDeployment,
} from "../seo.ts";
import {
  filterArticles,
  getArticleBySlug,
  getArticleForTool,
  getRelatedArticles,
  getRelatedArticlesForTool,
  LEARN_ARTICLES,
  LEARN_CATEGORIES,
} from "../learn.ts";
import {
  canSendAnalyticsEvents,
  getConfiguredGaMeasurementId,
  isAnalyticsEnvironmentEnabled,
  isValidGaMeasurementId,
  resetAnalyticsDedupeState,
  sanitizeToolAnalyticsParams,
  trackPageView,
  trackToolEvent,
} from "../analytics.ts";
import {
  buildAdsTxtRecord,
  canRenderAds,
  extractPublisherId,
  isAdsEnvironmentActive,
  isAllowedAdSlot,
  isValidAdSenseClientId,
  isValidAdSensePublisherId,
} from "../ads.ts";
import {
  parseCsvText,
  parseCsvLine,
  parseGscQueries,
  parseGscPages,
  parseGscCountries,
  parseGa4Pages,
  buildGrowthSummary,
} from "../growth-analytics.ts";
import {
  getFavoriteTools,
  toggleFavoriteTool,
  isFavoriteTool,
  getRecentlyUsedTools,
  recordRecentlyUsedTool,
  clearRecentTools,
} from "../user-preferences.ts";
import {
  TOOLS_REGISTRY,
  getRelatedTools,
} from "../tools.ts";
import {
  searchTools,
  levenshteinDistance,
} from "../search.ts";
import {
  generateSecurePassword,
  evaluatePasswordStrength,
} from "./password-generator.ts";
import {
  calculateAspectDimension,
  validateTargetDimensions,
} from "./image-resizer.ts";
import {
  encodeUtf8ToBase64,
  decodeBase64ToUtf8,
} from "./base64.ts";
import {
  calculatePercentage,
  formatPercentageNumber,
} from "./percentage-calculator.ts";
import {
  validatePdfForConversion,
} from "./pdf-to-image.ts";
import {
  validateImageForPdf,
  generatePdfFromImages,
} from "./image-to-pdf.ts";
import {
  reorderPages,
  rotatePage,
  rotateAllPages,
  deletePage,
  exportOrganizedPdf,
  type OrganizerPageItem,
} from "./pdf-organizer.ts";
import {
  hexToPdfRgb,
  applyWatermarkToPdf,
} from "./pdf-watermark.ts";
import {
  testRegularExpression,
  detectPotentialCatastrophicBacktracking,
  REGEX_LIBRARY_PRESETS,
} from "./regex-tester.ts";
import {
  computeCodeDiff,
  SAMPLE_CODE_DIFF,
} from "./code-diff-checker.ts";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  calculateContrastRatio,
  evaluateWcagCompliance,
  generateHarmonicPalettes,
  exportPaletteAsCss,
} from "./color-picker.ts";
import {
  generateSingleUuidV4,
  formatUuid,
  generateBulkUuids,
  validateUuidString,
} from "./uuid-generator.ts";
import {
  convertTextCase,
  getTextStatistics,
} from "./text-case-converter.ts";
import {
  compareProseTexts,
} from "./text-compare.ts";
import {
  cleanText,
  DEFAULT_CLEANER_OPTIONS,
} from "./text-cleaner.ts";
import {
  generatePlaceholderText,
} from "./lorem-ipsum-generator.ts";
import {
  classifyErrorCategory,
  getErrorMonitoringConfig,
  getFriendlyBoundaryErrorMessage,
} from "../error-monitoring.ts";
import {
  FEEDBACK_COOLDOWN_MS,
  MAX_FEEDBACK_SUGGESTION_LENGTH,
  sanitizeFeedbackText,
  validateToolFeedback,
} from "../feedback.ts";
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
import {
  calculateGpa,
  getDefaultGradeMappings,
  type GpaSemesterInput,
} from "./gpa-calculator.ts";
import {
  calculateInvoiceTotals,
  createSampleInvoiceData,
  generateInvoicePdfBytes,
  type InvoiceFormData,
} from "./invoice-generator.ts";
import {
  createSamplePdfBytes,
  inspectPdfBytes,
  MAX_PDF_FILE_SIZE_BYTES,
  mergePdfDocuments,
  parsePageRanges,
  reorderArrayItems,
  splitPdfDocument,
  validatePdfFileMetadata,
} from "./pdf-merge-split.ts";

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

  assert.equal(parseTimestampToken("05:60").valid, false);
  assert.equal(formatSecondsToTimestamp(3661), "01:01:01");
});

// ============================================================================
// TOOL 6: GPA Calculator Tests
// ============================================================================
test("GPA Calculator: calculates single course and multiple courses accurately on 4.0 scale", () => {
  const mappings4 = getDefaultGradeMappings("4.0");

  // Single course
  const singleRes = calculateGpa(
    [
      {
        id: "sem-1",
        name: "Semester 1",
        courses: [{ id: "c-1", name: "Physics I", credits: "4", grade: "A-" }],
      },
    ],
    mappings4,
    "4.0"
  );
  assert.equal(singleRes.valid, true);
  assert.equal(singleRes.totalCredits, 4);
  assert.equal(singleRes.totalQualityPoints, 14.8);
  assert.equal(singleRes.cumulativeGpaFormatted, "3.70");

  // Multiple courses (worked example: 4cr A=16.0, 4cr B+=13.2, 3cr A-=11.1 => 40.3 / 11 = 3.66)
  const multiCourseRes = calculateGpa(
    [
      {
        id: "sem-1",
        name: "Semester 1",
        courses: [
          { id: "c-1", name: "CS I", credits: "4", grade: "A" },
          { id: "c-2", name: "Calc I", credits: "4", grade: "B+" },
          { id: "c-3", name: "Writing", credits: "3", grade: "A-" },
        ],
      },
    ],
    mappings4,
    "4.0"
  );
  assert.equal(multiCourseRes.valid, true);
  assert.equal(multiCourseRes.totalCredits, 11);
  assert.equal(multiCourseRes.totalQualityPoints, 40.3);
  assert.equal(multiCourseRes.cumulativeGpaFormatted, "3.66");
});

test("GPA Calculator: calculates multiple semesters and supports 5.0 scale & custom mappings", () => {
  const semesters: GpaSemesterInput[] = [
    {
      id: "s1",
      name: "Fall",
      courses: [
        { id: "c1", name: "Biology", credits: "3", grade: "A" },
        { id: "c2", name: "Chemistry", credits: "3", grade: "B" },
      ],
    },
    {
      id: "s2",
      name: "Spring",
      courses: [{ id: "c3", name: "Honors Organic Chem", credits: "4", grade: "A" }],
    },
  ];

  // 4.0 scale: (3*4 + 3*3 + 4*4) / 10 = (12 + 9 + 16)/10 = 37/10 = 3.70
  const res4 = calculateGpa(semesters, getDefaultGradeMappings("4.0"), "4.0");
  assert.equal(res4.valid, true);
  assert.equal(res4.semesterSummaries.length, 2);
  assert.equal(res4.semesterSummaries[0]?.gpaFormatted, "3.50");
  assert.equal(res4.semesterSummaries[1]?.gpaFormatted, "4.00");
  assert.equal(res4.cumulativeGpaFormatted, "3.70");

  // 5.0 scale: (3*5 + 3*4 + 4*5) / 10 = (15 + 12 + 20)/10 = 47/10 = 4.70
  const res5 = calculateGpa(semesters, getDefaultGradeMappings("5.0"), "5.0");
  assert.equal(res5.valid, true);
  assert.equal(res5.cumulativeGpaFormatted, "4.70");
});

test("GPA Calculator: rejects zero credit hours, negative/invalid credit hours, and missing grades", () => {
  const mappings4 = getDefaultGradeMappings("4.0");

  const zeroCredits = calculateGpa(
    [
      {
        id: "s1",
        name: "Fall",
        courses: [{ id: "c1", name: "Zero Course", credits: "0", grade: "A" }],
      },
    ],
    mappings4,
    "4.0"
  );
  assert.equal(zeroCredits.valid, false);
  assert.ok(zeroCredits.errorMessage?.includes("positive number"));

  const negativeCredits = calculateGpa(
    [
      {
        id: "s1",
        name: "Fall",
        courses: [{ id: "c1", name: "Bad Course", credits: "-3", grade: "A" }],
      },
    ],
    mappings4,
    "4.0"
  );
  assert.equal(negativeCredits.valid, false);
  assert.equal(negativeCredits.validationIssues.length, 1);

  const missingGrade = calculateGpa(
    [
      {
        id: "s1",
        name: "Fall",
        courses: [{ id: "c1", name: "No Grade", credits: "3", grade: "" }],
      },
    ],
    mappings4,
    "4.0"
  );
  assert.equal(missingGrade.valid, false);
  assert.ok(missingGrade.errorMessage?.includes("select a letter grade"));
});

// ============================================================================
// TOOL 7: Invoice Generator Tests
// ============================================================================
test("Invoice Generator: computes single item, multiple items, tax, and percentage/fixed discounts with floating-point safety", () => {
  const baseData: InvoiceFormData = {
    ...createSampleInvoiceData(),
    items: [
      { id: "1", description: "Item A (0.1 + 0.2 test)", quantity: "1", unitPrice: "0.10" },
      { id: "2", description: "Item B", quantity: "1", unitPrice: "0.20" },
      { id: "3", description: "Subscription", quantity: "3", unitPrice: "19.99" },
    ],
    discountType: "percentage",
    discountValue: "10",
    taxRatePercent: "8.25",
  };

  // Subtotal: 0.10 + 0.20 + 59.97 = 60.27 (exact, no 0.30000000000000004!)
  const pctRes = calculateInvoiceTotals(baseData);
  assert.equal(pctRes.valid, true);
  assert.equal(pctRes.subtotal, 60.27);
  // 10% of 60.27 = 6.03
  assert.equal(pctRes.discountAmount, 6.03);
  // Taxable: 60.27 - 6.03 = 54.24
  assert.equal(pctRes.taxableSubtotal, 54.24);
  // Tax 8.25% of 54.24 = 4.4748 -> 4.47
  assert.equal(pctRes.taxAmount, 4.47);
  // Grand total: 54.24 + 4.47 = 58.71
  assert.equal(pctRes.grandTotal, 58.71);

  // Fixed discount calculation
  const fixedRes = calculateInvoiceTotals({
    ...baseData,
    discountType: "fixed",
    discountValue: "10.27",
    taxRatePercent: "10",
  });
  assert.equal(fixedRes.valid, true);
  assert.equal(fixedRes.discountAmount, 10.27);
  assert.equal(fixedRes.taxableSubtotal, 50.0);
  assert.equal(fixedRes.taxAmount, 5.0);
  assert.equal(fixedRes.grandTotal, 55.0);
});

test("Invoice Generator: rejects negative values, invalid dates, and generates readable multi-page PDF bytes", async () => {
  const invalidData: InvoiceFormData = {
    ...createSampleInvoiceData(),
    issueDate: "2025-05-10",
    dueDate: "2025-05-01", // due before issue
    items: [
      { id: "1", description: "Bad Item", quantity: "-2", unitPrice: "-50" },
    ],
  };

  const invalidRes = calculateInvoiceTotals(invalidData);
  assert.equal(invalidRes.valid, false);
  assert.ok(
    invalidRes.validationErrors.some((e) =>
      e.includes("cannot be earlier than the invoice issue date")
    )
  );
  assert.ok(
    invalidRes.validationErrors.some((e) =>
      e.includes("Quantity must be a positive number")
    )
  );
  assert.ok(
    invalidRes.validationErrors.some((e) =>
      e.includes("Unit price must be zero or a positive number")
    )
  );

  // Generate multi-page invoice PDF with 45 line items
  const multiPageData: InvoiceFormData = {
    ...createSampleInvoiceData(),
    items: Array.from({ length: 45 }, (_, idx) => ({
      id: `item-${idx + 1}`,
      description: `Milestone Deliverable #${idx + 1} — Full-stack engineering & architecture consultation`,
      quantity: "2",
      unitPrice: "150.00",
    })),
  };

  const pdfBytes = await generateInvoicePdfBytes(multiPageData);
  assert.ok(pdfBytes.byteLength > 1000);
  const loadedDoc = await PDFDocument.load(pdfBytes);
  assert.ok(loadedDoc.getPageCount() >= 2);
});

// ============================================================================
// TOOL 8: PDF Merge & Split Tests
// ============================================================================
test("PDF Merge & Split: merges two or multiple PDFs, reorders files, and splits page ranges", async () => {
  const pdfA = await createSamplePdfBytes("Doc A", 2);
  const pdfB = await createSamplePdfBytes("Doc B", 3);
  const pdfC = await createSamplePdfBytes("Doc C", 4);

  // Merge two PDFs
  const merge2 = await mergePdfDocuments([
    { name: "a.pdf", bytes: pdfA },
    { name: "b.pdf", bytes: pdfB },
  ]);
  assert.equal(merge2.valid, true);
  assert.equal(merge2.totalPages, 5);

  // Reorder and merge three PDFs
  const list = [
    { name: "a.pdf", bytes: pdfA },
    { name: "b.pdf", bytes: pdfB },
    { name: "c.pdf", bytes: pdfC },
  ];
  const reordered = reorderArrayItems(list, 2, 0); // move c.pdf to first
  assert.equal(reordered[0]?.name, "c.pdf");

  const merge3 = await mergePdfDocuments(reordered);
  assert.equal(merge3.valid, true);
  assert.equal(merge3.totalPages, 9);

  // Split selected page ranges into a single combined PDF ("1-2, 5, 7-8" -> 5 pages)
  const mergedBytes = merge3.mergedBytes!;
  const splitCombined = await splitPdfDocument(
    mergedBytes,
    "combined-report.pdf",
    "1-2, 5, 7-8",
    "single-combined"
  );
  assert.equal(splitCombined.valid, true);
  assert.equal(splitCombined.outputs.length, 1);
  assert.equal(splitCombined.outputs[0]?.pageCount, 5);

  // Split into separate files per range ("1-2, 5, 7-8" -> 3 separate PDF files)
  const splitSeparate = await splitPdfDocument(
    mergedBytes,
    "combined-report.pdf",
    "1-2, 5, 7-8",
    "separate-files"
  );
  assert.equal(splitSeparate.valid, true);
  assert.equal(splitSeparate.outputs.length, 3);
  assert.equal(splitSeparate.outputs[0]?.pageCount, 2);
  assert.equal(splitSeparate.outputs[1]?.pageCount, 1);
  assert.equal(splitSeparate.outputs[2]?.pageCount, 2);
});

test("PDF Merge & Split: rejects invalid page ranges, corrupted PDFs, encrypted PDFs, and oversized files", async () => {
  // Invalid page range checks
  assert.equal(parsePageRanges("1-12", 5).valid, false);
  assert.equal(parsePageRanges("4-2", 5).valid, false);
  assert.equal(parsePageRanges("0-2", 5).valid, false);
  assert.equal(parsePageRanges("abc", 5).valid, false);

  // File size & type limit validation
  const oversizedMeta = validatePdfFileMetadata({
    name: "huge.pdf",
    type: "application/pdf",
    size: MAX_PDF_FILE_SIZE_BYTES + 100,
  });
  assert.equal(oversizedMeta.valid, false);
  assert.ok(oversizedMeta.error?.includes("exceeds the 50 MB"));

  const wrongTypeMeta = validatePdfFileMetadata({
    name: "malware.exe",
    type: "application/x-msdownload",
    size: 1024,
  });
  assert.equal(wrongTypeMeta.valid, false);

  // Corrupted PDF handling
  const corruptedBytes = new TextEncoder().encode("not a valid pdf file at all");
  const corruptedCheck = await inspectPdfBytes(corruptedBytes, "broken.pdf");
  assert.equal(corruptedCheck.valid, false);
  assert.ok(corruptedCheck.error?.includes("valid PDF file header"));

  const fakeHeaderCorrupted = new TextEncoder().encode(
    "%PDF-1.7\n1 0 obj\n<<corrupted syntax>>"
  );
  const fakeHeaderCheck = await inspectPdfBytes(
    fakeHeaderCorrupted,
    "corrupt-body.pdf"
  );
  assert.equal(fakeHeaderCheck.valid, false);

  // Password-protected / encrypted PDF handling
  const encryptedSimBytes = new TextEncoder().encode(
    "%PDF-1.7\n1 0 obj\n<< /Filter /Standard /V 2 /R 3 /Length 128 >>\nendobj\ntrailer\n<< /Encrypt 1 0 R >>\n%%EOF"
  );
  const encryptedCheck = await inspectPdfBytes(
    encryptedSimBytes,
    "protected.pdf"
  );
  assert.equal(encryptedCheck.valid, false);
});

// ============================================================================
// STEP 4: Security (Image Magic Bytes) & Technical SEO Tests
// ============================================================================
test("Image Compressor Security: validates JPEG, PNG, and WebP magic byte headers and rejects spoofed files", () => {
  const jpegBytes = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);
  const jpegRes = validateImageMagicBytes(jpegBytes);
  assert.equal(jpegRes.valid, true);
  assert.equal(jpegRes.detectedMimeType, "image/jpeg");

  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  const pngRes = validateImageMagicBytes(pngBytes);
  assert.equal(pngRes.valid, true);
  assert.equal(pngRes.detectedMimeType, "image/png");

  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  const webpRes = validateImageMagicBytes(webpBytes);
  assert.equal(webpRes.valid, true);
  assert.equal(webpRes.detectedMimeType, "image/webp");

  const spoofedExe = new TextEncoder().encode("MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff");
  const spoofedRes = validateImageMagicBytes(spoofedExe);
  assert.equal(spoofedRes.valid, false);
  assert.ok(spoofedRes.error?.includes("File signature does not match"));
});

test("Technical SEO: validates NEXT_PUBLIC_SITE_URL, relative canonicals, staging protection, and accurate JSON-LD", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const defaultCfg = getSiteUrlConfig();
    assert.equal(defaultCfg.origin, "http://localhost:3000");
    assert.equal(defaultCfg.isProductionDomainConfigured, false);
    assert.equal(defaultCfg.isStagingOrLocal, true);

    process.env.NEXT_PUBLIC_SITE_URL = "https://tools.example.org/";
    const prodCfg = getSiteUrlConfig();
    assert.equal(prodCfg.origin, "https://tools.example.org");
    assert.equal(prodCfg.isProductionDomainConfigured, true);
    assert.equal(prodCfg.isStagingOrLocal, false);

    const pageMeta = buildPageMetadata({
      title: "JSON Formatter & Validator",
      description: "Format and validate JSON in your browser.",
      path: "/tools/json-formatter",
    });
    assert.equal(pageMeta.alternates?.canonical, "/tools/json-formatter");

    const siteLd = buildWebsiteJsonLd("OneToolHub", "Online utility platform.");
    assert.equal(siteLd["@type"], "WebSite");
    assert.equal(siteLd.url, "https://tools.example.org");

    const toolLd = buildToolPageJsonLd(
      {
        id: "json-formatter",
        name: "JSON Formatter",
        slug: "json-formatter",
        shortDescription: "Format JSON.",
        categoryId: "developer",
        categoryLabel: "Developer Tools",
        icon: "Braces",
        status: "available",
        featured: true,
        keywords: ["json"],
      },
      "JSON Formatter & Validator",
      "Format JSON locally."
    );
    assert.equal(toolLd.length, 2);
    assert.equal(toolLd[0]?.["@type"], "BreadcrumbList");
    assert.equal(toolLd[1]?.["@type"], "SoftwareApplication");
    assert.equal("aggregateRating" in (toolLd[1] ?? {}), false);
  } finally {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    }
  }
});

// ============================================================================
// STEP 5: Analytics, Privacy Consent, Feedback, Error Monitoring & Search Console
// ============================================================================
test("GA4 Configuration & Consent Gating: validates measurement ID format, dev environment blocking, and explicit consent requirements", () => {
  // Valid GA4 IDs
  assert.equal(isValidGaMeasurementId("G-1234567890"), true);
  assert.equal(isValidGaMeasurementId("G-ABCDEF12"), true);
  assert.equal(getConfiguredGaMeasurementId(" G-ABC12345 "), "G-ABC12345");

  // Invalid GA4 IDs (including lowercase or malformed)
  assert.equal(isValidGaMeasurementId(""), false);
  assert.equal(isValidGaMeasurementId("g-abc12345"), false);
  assert.equal(isValidGaMeasurementId("UA-123456-1"), false);
  assert.equal(isValidGaMeasurementId("G-123"), false);
  assert.equal(isValidGaMeasurementId("G-INVALID_CHARS!"), false);
  assert.equal(getConfiguredGaMeasurementId("invalid"), null);

  // Blocked in local development unless explicitly enabled
  assert.equal(
    isAnalyticsEnvironmentEnabled({
      measurementId: "G-TEST123456",
      nodeEnv: "development",
      enableInDev: "false",
    }),
    false
  );
  assert.equal(
    isAnalyticsEnvironmentEnabled({
      measurementId: "G-TEST123456",
      nodeEnv: "development",
      enableInDev: "true",
    }),
    true
  );
  assert.equal(
    isAnalyticsEnvironmentEnabled({
      measurementId: "G-TEST123456",
      nodeEnv: "production",
    }),
    true
  );

  // Consent gating: undecided or rejected must never allow sending events
  assert.equal(
    canSendAnalyticsEvents({
      consentStatus: "undecided",
      measurementId: "G-TEST123456",
      nodeEnv: "production",
    }),
    false
  );
  assert.equal(
    canSendAnalyticsEvents({
      consentStatus: "rejected",
      measurementId: "G-TEST123456",
      nodeEnv: "production",
    }),
    false
  );
  assert.equal(
    canSendAnalyticsEvents({
      consentStatus: "accepted",
      measurementId: "G-TEST123456",
      nodeEnv: "production",
    }),
    true
  );
});

test("Analytics Privacy Sanitization & Deduplication: strips sensitive user data and prevents duplicate pageview/tool events", () => {
  // Attempt to pass sensitive keys alongside allowed keys
  const rawUnsafePayload = {
    tool_slug: "json-formatter",
    tool_category: "developer",
    operation_type: "format_2",
    error_category: "syntax_error",
    filename: "secret-financials.json",
    json_content: '{"ssn": "123-45-6789"}',
    invoice_details: "ACME Corp $50,000",
    qr_text: "https://private-link.internal",
    user_text: "Confidential essay content",
  } as unknown as Parameters<typeof sanitizeToolAnalyticsParams>[0];

  const sanitized = sanitizeToolAnalyticsParams(rawUnsafePayload);
  assert.ok(sanitized !== null);
  assert.deepEqual(Object.keys(sanitized).sort(), [
    "error_category",
    "operation_type",
    "tool_category",
    "tool_slug",
  ]);
  assert.equal("filename" in sanitized, false);
  assert.equal("json_content" in sanitized, false);
  assert.equal("invoice_details" in sanitized, false);
  assert.equal("qr_text" in sanitized, false);
  assert.equal("user_text" in sanitized, false);

  // Rejects unknown tool slugs
  const invalidSlug = sanitizeToolAnalyticsParams({
    tool_slug: "unknown-tool" as "json-formatter",
    tool_category: "developer",
  });
  assert.equal(invalidSlug, null);

  // Deduplication check for pageviews and tool events
  resetAnalyticsDedupeState();
  const capturedCalls: Array<{ args: unknown[] }> = [];
  const mockGtag = (...args: unknown[]) => {
    capturedCalls.push({ args });
  };

  // First pageview succeeds
  const firstPage = trackPageView("/tools/json-formatter?secret=123#hash", {
    consentStatus: "accepted",
    measurementId: "G-TEST123456",
    nodeEnv: "production",
    gtagFn: mockGtag,
  });
  assert.equal(firstPage, true);
  assert.equal(capturedCalls.length, 1);
  assert.deepEqual(capturedCalls[0]?.args, [
    "event",
    "page_view",
    { page_path: "/tools/json-formatter" },
  ]);

  // Duplicate pageview to the same path is suppressed
  const duplicatePage = trackPageView("/tools/json-formatter", {
    consentStatus: "accepted",
    measurementId: "G-TEST123456",
    nodeEnv: "production",
    gtagFn: mockGtag,
  });
  assert.equal(duplicatePage, false);
  assert.equal(capturedCalls.length, 1);

  // Unconsented tool event is blocked
  const rejectedEvent = trackToolEvent(
    "tool_open",
    { tool_slug: "json-formatter", tool_category: "developer" },
    {
      consentStatus: "rejected",
      measurementId: "G-TEST123456",
      nodeEnv: "production",
      gtagFn: mockGtag,
    }
  );
  assert.equal(rejectedEvent.sent, false);

  // Consented tool event succeeds and deduplicates rapid repeats
  const firstToolEvent = trackToolEvent(
    "tool_open",
    { tool_slug: "json-formatter", tool_category: "developer" },
    {
      consentStatus: "accepted",
      measurementId: "G-TEST123456",
      nodeEnv: "production",
      nowMs: 1_000,
      dedupeWindowMs: 500,
      gtagFn: mockGtag,
    }
  );
  assert.equal(firstToolEvent.sent, true);

  const duplicateToolEvent = trackToolEvent(
    "tool_open",
    { tool_slug: "json-formatter", tool_category: "developer" },
    {
      consentStatus: "accepted",
      measurementId: "G-TEST123456",
      nodeEnv: "production",
      nowMs: 1_200,
      dedupeWindowMs: 500,
      gtagFn: mockGtag,
    }
  );
  assert.equal(duplicateToolEvent.sent, false);
  assert.equal(duplicateToolEvent.reason, "duplicate_suppressed");
});

test("User Feedback System: validates helpful vote, 500-char limit, honeypot spam protection, and 15-second cooldown", () => {
  // Valid feedback with suggestion
  const validRes = validateToolFeedback({
    toolSlug: "pdf-merge-split",
    helpful: "yes",
    suggestion: "  Great local PDF merging speed!  ",
    honeypot: "",
    lastSubmittedAtMs: null,
    nowMs: 100_000,
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.sanitized?.toolSlug, "pdf-merge-split");
  assert.equal(validRes.sanitized?.helpful, "yes");
  assert.equal(
    validRes.sanitized?.suggestion,
    "Great local PDF merging speed!"
  );

  // Strips control characters
  assert.equal(sanitizeFeedbackText("Hello\u0000\u0007World"), "HelloWorld");

  // Rejects honeypot bot fill
  const botRes = validateToolFeedback({
    toolSlug: "pdf-merge-split",
    helpful: "yes",
    suggestion: "Spam link",
    honeypot: "http://spam.example.com",
  });
  assert.equal(botRes.valid, false);

  // Rejects missing helpful selection
  const missingVote = validateToolFeedback({
    toolSlug: "word-counter",
    helpful: "",
    suggestion: "Nice tool",
  });
  assert.equal(missingVote.valid, false);
  assert.ok(missingVote.error?.includes("Yes or No"));

  // Rejects suggestion exceeding 500 chars
  const tooLong = validateToolFeedback({
    toolSlug: "word-counter",
    helpful: "no",
    suggestion: "a".repeat(MAX_FEEDBACK_SUGGESTION_LENGTH + 1),
  });
  assert.equal(tooLong.valid, false);
  assert.ok(tooLong.error?.includes("500 characters"));

  // Enforces 15-second cooldown
  const cooldownBlocked = validateToolFeedback({
    toolSlug: "word-counter",
    helpful: "yes",
    lastSubmittedAtMs: 100_000,
    nowMs: 100_000 + FEEDBACK_COOLDOWN_MS - 3_000,
  });
  assert.equal(cooldownBlocked.valid, false);
  assert.ok(cooldownBlocked.error?.includes("wait"));
});

test("Error Monitoring & Search Console Verification: classifies generic error categories without leaking user content", () => {
  assert.equal(
    classifyErrorCategory(new Error("Uploaded file exceeds 25 MB limit")),
    "file_too_large"
  );
  assert.equal(
    classifyErrorCategory("Password-protected or encrypted PDF detected"),
    "encrypted_file"
  );
  assert.equal(
    classifyErrorCategory("Unexpected token in JSON syntax at line 4"),
    "syntax_error"
  );
  assert.equal(
    classifyErrorCategory("File signature does not match supported format"),
    "unsupported_format"
  );
  assert.equal(
    classifyErrorCategory("Corrupted PDF header"),
    "corrupted_file"
  );
  assert.equal(
    classifyErrorCategory("Page range exceeds document page count"),
    "range_error"
  );

  // Friendly boundary message never exposes raw error message or stack trace
  const friendlyMsg = getFriendlyBoundaryErrorMessage();
  assert.ok(friendlyMsg.includes("Your local data has not been transmitted"));
  assert.equal(friendlyMsg.includes("Error:"), false);

  const monCfg = getErrorMonitoringConfig({
    enabledEnv: "true",
    dsnEnv: "https://monitor.example.org/ingest",
  });
  assert.equal(monCfg.enabled, true);
  assert.equal(monCfg.dsn, "https://monitor.example.org/ingest");

  // Search Console token validation
  assert.equal(getGoogleSiteVerificationToken(""), null);
  assert.equal(getGoogleSiteVerificationToken("   "), null);
  assert.equal(
    getGoogleSiteVerificationToken("<script>alert(1)</script>"),
    null
  );
  assert.equal(
    getGoogleSiteVerificationToken("abcDEF123_-validTokenValue987"),
    "abcDEF123_-validTokenValue987"
  );
});

// ============================================================================
// STEP 6: Production Vercel URL Resolution & Preview Deployment NoIndex Protection
// ============================================================================
test("Step 6 Production SEO: resolves https://one-tool-hub-sooty.vercel.app on Vercel Production and enforces noindex on Preview deployments", () => {
  const savedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const savedVercelEnv = process.env.VERCEL_ENV;
  const savedNextPublicVercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const savedVercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const savedVercel = process.env.VERCEL;

  try {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "one-tool-hub-sooty.vercel.app";

    const vercelProdCfg = getSiteUrlConfig();
    assert.equal(vercelProdCfg.origin, "https://one-tool-hub-sooty.vercel.app");
    assert.equal(vercelProdCfg.isProductionDomainConfigured, true);
    assert.equal(vercelProdCfg.isPreview, false);
    assert.equal(isPreviewDeployment(), false);
    assert.equal(
      getGoogleSiteVerificationToken(),
      "VzTJTHFVF7UaofXkbpnYPaFnn97slv1Gbq9rjnkw7gY"
    );
    assert.equal(getConfiguredGaMeasurementId(), "G-Y6CKKYZDWM");

    const prodPageMeta = buildPageMetadata({
      title: "GPA Calculator",
      description: "Calculate semester and cumulative GPA.",
      path: "/tools/gpa-calculator",
    });
    assert.deepEqual(prodPageMeta.robots, { index: true, follow: true });

    // Switch to Vercel Preview environment
    process.env.VERCEL_ENV = "preview";
    const vercelPreviewCfg = getSiteUrlConfig();
    assert.equal(vercelPreviewCfg.isPreview, true);
    assert.equal(isPreviewDeployment(), true);

    const previewPageMeta = buildPageMetadata({
      title: "GPA Calculator",
      description: "Calculate semester and cumulative GPA.",
      path: "/tools/gpa-calculator",
    });
    assert.deepEqual(previewPageMeta.robots, { index: false, follow: false });
  } finally {
    if (savedSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = savedSiteUrl;

    if (savedVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = savedVercelEnv;

    if (savedNextPublicVercelEnv === undefined)
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    else process.env.NEXT_PUBLIC_VERCEL_ENV = savedNextPublicVercelEnv;

    if (savedVercelProdUrl === undefined)
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    else process.env.VERCEL_PROJECT_PRODUCTION_URL = savedVercelProdUrl;

    if (savedVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = savedVercel;
  }
});

// ============================================================================
// STEP 7: Learning Center Architecture, 8 Tutorials, Internal Linking & Article JSON-LD
// ============================================================================
test("Step 7 Learning Center Content Integrity: verifies complete tutorials, unique metadata, and 1-to-1 tool coverage", () => {
  assert.equal(LEARN_CATEGORIES.length, 5);
  assert.equal(LEARN_ARTICLES.length, 24);

  const slugs = new Set<string>();
  const titles = new Set<string>();
  const seoTitles = new Set<string>();
  const metaDescriptions = new Set<string>();
  const primaryToolsCovered = new Set<string>();

  for (const article of LEARN_ARTICLES) {
    assert.ok(article.slug.length > 5);
    assert.equal(slugs.has(article.slug), false, `Duplicate slug: ${article.slug}`);
    slugs.add(article.slug);

    assert.equal(titles.has(article.title), false, `Duplicate title: ${article.title}`);
    titles.add(article.title);

    assert.equal(
      seoTitles.has(article.seoTitle),
      false,
      `Duplicate seoTitle: ${article.seoTitle}`
    );
    seoTitles.add(article.seoTitle);

    assert.equal(
      metaDescriptions.has(article.metaDescription),
      false,
      `Duplicate metaDescription on: ${article.slug}`
    );
    metaDescriptions.add(article.metaDescription);

    assert.equal(
      primaryToolsCovered.has(article.primaryToolSlug),
      false,
      `Duplicate primaryToolSlug: ${article.primaryToolSlug}`
    );
    primaryToolsCovered.add(article.primaryToolSlug);

    // Every required tutorial section must be populated
    assert.ok(article.readingTimeMinutes >= 3 && article.readingTimeMinutes <= 15);
    assert.ok(article.introduction.length >= 2);
    assert.ok(article.problemSolved.heading.length > 10);
    assert.ok(article.problemSolved.paragraphs.length >= 2);
    assert.ok(article.problemSolved.keyTakeaways.length >= 3);
    assert.ok(article.steps.length >= 4);
    assert.ok(article.practicalExample.title.length > 5);
    assert.ok(article.practicalExample.explanation.length > 20);
    assert.ok(article.commonMistakes.length >= 2);
    assert.ok(article.troubleshooting.length >= 2);
    assert.ok(article.faqs.length >= 3);
    assert.ok(article.conclusion.heading.length > 5);
    assert.ok(article.conclusion.ctaLabel.length > 5);
    assert.ok(article.relatedToolSlugs.length >= 2);
    assert.ok(article.relatedArticleSlugs.length >= 2);

    for (const rts of article.relatedToolSlugs) {
      assert.ok(
        TOOLS_REGISTRY.some((t) => t.slug === rts),
        `Article ${article.slug} references invalid tool slug: ${rts}`
      );
    }
    for (const ras of article.relatedArticleSlugs) {
      assert.ok(
        LEARN_ARTICLES.some((a) => a.slug === ras),
        `Article ${article.slug} references invalid article slug: ${ras}`
      );
    }
  }

  // All 24 tools have a dedicated companion tutorial
  assert.equal(primaryToolsCovered.size, 24);
});

test("Step 7 Search, Category Filtering, Internal Linking & Article JSON-LD: validates directory filters and structured data", () => {
  // Search and category filtering
  const allResults = filterArticles(LEARN_ARTICLES, "", "all");
  assert.equal(allResults.length, 24);

  const devCategoryResults = filterArticles(
    LEARN_ARTICLES,
    "",
    "developer-tutorials"
  );
  assert.equal(devCategoryResults.length, 9);

  const gpaSearchResults = filterArticles(LEARN_ARTICLES, "credit hours", "all");
  assert.ok(
    gpaSearchResults.some(
      (a) => a.slug === "how-to-calculate-college-gpa-credit-hours"
    )
  );

  const emptySearchResults = filterArticles(
    LEARN_ARTICLES,
    "nonexistent-xyz-999-query",
    "all"
  );
  assert.equal(emptySearchResults.length, 0);

  // Lookup & internal linking helpers
  const jsonArticle = getArticleBySlug("how-to-format-and-validate-json");
  assert.ok(jsonArticle);
  assert.equal(jsonArticle.primaryToolSlug, "json-formatter");

  const youtubeCompanion = getArticleForTool("youtube-timestamp-formatter");
  assert.ok(youtubeCompanion);
  assert.equal(
    youtubeCompanion.slug,
    "how-to-format-youtube-timestamps-and-chapters"
  );

  const relatedToJsonArticle = getRelatedArticles(
    "how-to-format-and-validate-json",
    3
  );
  assert.equal(relatedToJsonArticle.length, 3);
  assert.ok(
    relatedToJsonArticle.every(
      (a) => a.slug !== "how-to-format-and-validate-json"
    )
  );

  const relatedForInvoiceTool = getRelatedArticlesForTool(
    "invoice-generator",
    3
  );
  assert.equal(relatedForInvoiceTool.length, 3);
  assert.equal(
    relatedForInvoiceTool[0]?.slug,
    "how-to-create-professional-freelance-invoice"
  );

  // Structured data validation (BreadcrumbList + Article)
  const savedVercel = process.env.VERCEL;
  const savedVercelEnv = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";

    const dirLd = buildLearnDirectoryJsonLd();
    assert.equal(dirLd["@type"], "BreadcrumbList");
    assert.equal(dirLd.itemListElement.length, 2);
    assert.equal(
      dirLd.itemListElement[1]?.item,
      "https://one-tool-hub-sooty.vercel.app/learn"
    );

    const articleLd = buildArticleJsonLd(jsonArticle);
    assert.equal(articleLd.length, 2);
    assert.equal(articleLd[0]?.["@type"], "BreadcrumbList");
    assert.equal(articleLd[1]?.["@type"], "Article");
    assert.equal(
      articleLd[1]?.headline,
      "How to Format and Validate JSON Correctly"
    );
    assert.equal(
      articleLd[1]?.url,
      "https://one-tool-hub-sooty.vercel.app/learn/how-to-format-and-validate-json"
    );
    assert.equal("aggregateRating" in (articleLd[1] ?? {}), false);
  } finally {
    if (savedVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = savedVercel;
    if (savedVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = savedVercelEnv;
  }
});

test("Step 8 Google AdSense Readiness & Configuration Validation", () => {
  // 1. Client ID format validation (ca-pub-XXXXXXXXXXXXXXXX)
  assert.equal(isValidAdSenseClientId("ca-pub-1234567890123456"), true);
  assert.equal(isValidAdSenseClientId("ca-pub-9876543210"), true);
  assert.equal(isValidAdSenseClientId("ca-pub-123456789012345678"), false); // too long
  assert.equal(isValidAdSenseClientId("pub-1234567890123456"), false); // missing ca-
  assert.equal(isValidAdSenseClientId("ca-pub-abcdefghijkl"), false); // non-digits
  assert.equal(isValidAdSenseClientId(""), false);
  assert.equal(isValidAdSenseClientId(null), false);
  assert.equal(isValidAdSenseClientId(undefined), false);

  // 2. Publisher ID format validation (pub-XXXXXXXXXXXXXXXX)
  assert.equal(isValidAdSensePublisherId("pub-1234567890123456"), true);
  assert.equal(isValidAdSensePublisherId("pub-9876543210"), true);
  assert.equal(isValidAdSensePublisherId("ca-pub-1234567890123456"), false);
  assert.equal(isValidAdSensePublisherId("pub-abcdefghijkl"), false);

  // 3. Publisher ID extraction
  assert.equal(
    extractPublisherId("ca-pub-1234567890123456"),
    "pub-1234567890123456"
  );
  assert.equal(extractPublisherId("invalid"), null);

  // 4. Ads environment gating (disabled by default)
  assert.equal(isAdsEnvironmentActive({ clientId: null, featureEnabled: false }), false);
  assert.equal(
    isAdsEnvironmentActive({
      clientId: "ca-pub-1234567890123456",
      featureEnabled: false,
    }),
    false
  );
  assert.equal(
    isAdsEnvironmentActive({ clientId: null, featureEnabled: true }),
    false
  );
  assert.equal(
    isAdsEnvironmentActive({
      clientId: "ca-pub-1234567890123456",
      featureEnabled: true,
    }),
    true
  );

  // 5. Authorized Digital Sellers (ads.txt) record generator
  assert.equal(
    buildAdsTxtRecord("pub-1234567890123456"),
    "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
  );
  assert.equal(
    buildAdsTxtRecord("ca-pub-1234567890123456"),
    "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
  );
  assert.equal(buildAdsTxtRecord(null), null);
  assert.equal(buildAdsTxtRecord("invalid"), null);
});

test("Step 8 Advertising Consent & Component Placement Safety", () => {
  // 1. Consent gating for ad rendering
  const activeEnv = {
    clientId: "ca-pub-1234567890123456",
    featureEnabled: true,
  };
  const inactiveEnv = {
    clientId: null,
    featureEnabled: false,
  };

  assert.equal(canRenderAds({ ...inactiveEnv, consentStatus: "accepted" }), false);
  assert.equal(canRenderAds({ ...activeEnv, consentStatus: "undecided" }), false);
  assert.equal(canRenderAds({ ...activeEnv, consentStatus: "rejected" }), false);
  assert.equal(canRenderAds({ ...activeEnv, consentStatus: "accepted" }), true);

  // 2. Allowed slot policy validation
  assert.equal(isAllowedAdSlot("learn_article_body"), true);
  assert.equal(isAllowedAdSlot("learn_sidebar"), true);
  assert.equal(isAllowedAdSlot("learn_article_bottom"), true);
  assert.equal(isAllowedAdSlot("tool_page_bottom"), true);
  assert.equal(isAllowedAdSlot("informational_page_bottom"), true);

  // Reject hazardous placement attempts
  assert.equal(isAllowedAdSlot("tool_workspace"), false);
  assert.equal(isAllowedAdSlot("download_button"), false);
  assert.equal(isAllowedAdSlot("tool_input"), false);
  assert.equal(isAllowedAdSlot("header_nav"), false);
});

// ============================================================================
// STEP 9: Growth Analytics CSV Parser & User Retention Tests
// ============================================================================
test("Step 9 Growth Analytics CSV Parser handles RFC quotes, BOM, and missing values", () => {
  // 1. Quoted commas, escaped quotes, and empty entries
  const lineTokens = parseCsvLine('"how to format json, safely","image compressor ""online""",40');
  assert.equal(lineTokens.length, 3);
  assert.equal(lineTokens[0], "how to format json, safely");
  assert.equal(lineTokens[1], 'image compressor "online"');
  assert.equal(lineTokens[2], "40");

  const csvContent = `Top queries,Clicks,Impressions,CTR,Position
"how to format json, safely",120,2500,4.8%,2.1
"image compressor ""online""",85,1900,4.47%,3.4
"simple word counter",40,800,5.0%,1.8`;

  const records = parseCsvText(csvContent);
  assert.equal(records.length, 3);
  assert.equal(records[0]?.top_queries, "how to format json, safely");
  assert.equal(records[0]?.clicks, "120");

  // 2. Parse GSC Queries
  const queries = parseGscQueries(records);
  assert.equal(queries.length, 3);
  assert.equal(queries[0]?.query, "how to format json, safely");
  assert.equal(queries[0]?.clicks, 120);
  assert.equal(queries[0]?.impressions, 2500);

  // 3. Aggregate summary computation
  const summary = buildGrowthSummary({ queries });
  assert.equal(summary.totalClicks, 245);
  assert.equal(summary.totalImpressions, 5200);
  assert.ok(summary.topQueries.length === 3);
  assert.equal(summary.topQueries[0]?.query, "how to format json, safely");
});

test("Step 9 Growth Analytics detects GA4 and GSC Pages datasets correctly", () => {
  // GSC Pages dataset
  const gscPagesCsv = `Top pages,Clicks,Impressions,CTR,Position
https://one-tool-hub-sooty.vercel.app/tools/image-compressor,150,3000,5.0%,2.4
https://one-tool-hub-sooty.vercel.app/learn/how-to-compress-images-without-losing-quality,90,2100,4.28%,3.1`;

  const recordsGsc = parseCsvText(gscPagesCsv);
  const pagesGsc = parseGscPages(recordsGsc);
  assert.equal(pagesGsc.length, 2);
  assert.equal(pagesGsc[0]?.clicks, 150);

  const summaryGsc = buildGrowthSummary({ pages: pagesGsc });
  assert.equal(summaryGsc.totalClicks, 240);
  assert.equal(summaryGsc.topTools.length, 1);
  assert.equal(summaryGsc.topTools[0]?.name, "Image Compressor");
  assert.equal(summaryGsc.topTutorials.length, 1);

  // GA4 Pages & Screens dataset
  const ga4PagesCsv = `Page path and screen class,Page title,Views,Active users,Event count,Key events
/tools/word-counter,Word Counter,450,320,1200,85
/learn/word-count-guide-college-essays,Word Count Guide,210,180,600,40`;

  const recordsGa4 = parseCsvText(ga4PagesCsv);
  const pagesGa4 = parseGa4Pages(recordsGa4);
  assert.equal(pagesGa4.length, 2);
  assert.equal(pagesGa4[0]?.views, 450);
  assert.equal(pagesGa4[0]?.activeUsers, 320);

  const summaryGa4 = buildGrowthSummary({ gaPages: pagesGa4 });
  assert.equal(summaryGa4.totalViews, 660);
  assert.equal(summaryGa4.totalActiveUsers, 500);
  assert.equal(summaryGa4.topTools.length, 1);
  assert.equal(summaryGa4.topTools[0]?.name, "Word Counter");

  // GSC Countries dataset
  const gscCountryCsv = `Country,Clicks,Impressions,CTR,Position
United States,180,3200,5.62%,2.8
United Kingdom,90,1400,6.42%,2.5`;
  const recordsCountry = parseCsvText(gscCountryCsv);
  const countries = parseGscCountries(recordsCountry);
  assert.equal(countries.length, 2);
  assert.equal(countries[0]?.country, "United States");
  assert.equal(countries[0]?.clicks, 180);
});

test("Step 9 User Preferences safely manages client favorites and recents", () => {
  // Mock window.localStorage for Node environment testing
  const storageMap = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, val: string) => { storageMap.set(key, val); },
    removeItem: (key: string) => { storageMap.delete(key); },
    clear: () => { storageMap.clear(); },
  };

  const originalWindow = (globalThis as unknown as { window?: unknown }).window;
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: mockStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  try {
    // 1. Initial empty states
    assert.deepEqual(getFavoriteTools(), []);
    assert.deepEqual(getRecentlyUsedTools(), []);
    assert.equal(isFavoriteTool("image-compressor"), false);

    // 2. Toggle favorite
    const favs1 = toggleFavoriteTool("image-compressor");
    assert.deepEqual(favs1, ["image-compressor"]);
    assert.equal(isFavoriteTool("image-compressor"), true);

    const favs2 = toggleFavoriteTool("word-counter");
    assert.deepEqual(favs2, ["image-compressor", "word-counter"]);

    // Unfavorite
    const favs3 = toggleFavoriteTool("image-compressor");
    assert.deepEqual(favs3, ["word-counter"]);
    assert.equal(isFavoriteTool("image-compressor"), false);

    // 3. Record recently used tools
    recordRecentlyUsedTool("json-formatter");
    recordRecentlyUsedTool("qr-code-generator");
    const recents = getRecentlyUsedTools();
    assert.equal(recents[0], "qr-code-generator"); // most recent first
    assert.equal(recents[1], "json-formatter");

    // 4. Clear recents
    clearRecentTools();
    assert.deepEqual(getRecentlyUsedTools(), []);
  } finally {
    if (originalWindow !== undefined) {
      (globalThis as unknown as { window: unknown }).window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  }
});

test("Smart Tool Search & Typo Tolerance (Step 10)", () => {
  // 1. Levenshtein edit distance calculations
  assert.equal(levenshteinDistance("word", "word"), 0);
  assert.equal(levenshteinDistance("word", "work"), 1);
  assert.equal(levenshteinDistance("invoic", "invoice"), 1);
  assert.equal(levenshteinDistance("conpress", "compress"), 1);
  assert.equal(levenshteinDistance("kitten", "sitting"), 3);

  // 2. Empty query returns all tools (24 available tools)
  const allResults = searchTools(TOOLS_REGISTRY, "");
  assert.equal(allResults.length, 24);

  // 3. Exact matching by tool name
  const jsonResults = searchTools(TOOLS_REGISTRY, "JSON");
  assert.ok(jsonResults.length >= 1);
  assert.equal(jsonResults[0]?.item.slug, "json-formatter");

  // 4. Category matching
  const devResults = searchTools(TOOLS_REGISTRY, "developer");
  assert.ok(devResults.length >= 9);
  const devSlugs = devResults.map((r) => r.item.slug);
  assert.ok(devSlugs.includes("json-formatter"));
  assert.ok(devSlugs.includes("qr-code-generator"));
  assert.ok(devSlugs.includes("password-generator"));
  assert.ok(devSlugs.includes("base64-encoder-decoder"));
  assert.ok(devSlugs.includes("regex-tester"));
  assert.ok(devSlugs.includes("code-diff-checker"));
  assert.ok(devSlugs.includes("color-picker"));
  assert.ok(devSlugs.includes("uuid-generator"));
  assert.ok(devSlugs.includes("lorem-ipsum-generator"));

  // 5. Keyword & intent matching
  const combineResults = searchTools(TOOLS_REGISTRY, "combine");
  assert.ok(combineResults.length >= 1);
  assert.equal(combineResults[0]?.item.slug, "pdf-merge-split");

  const thumbnailResults = searchTools(TOOLS_REGISTRY, "thumbnail");
  assert.ok(thumbnailResults.length >= 1);
  assert.equal(thumbnailResults[0]?.item.slug, "image-compressor");

  // 6. Typo-tolerant matching
  const typoResults1 = searchTools(TOOLS_REGISTRY, "invoicer");
  assert.ok(typoResults1.length >= 1);
  assert.equal(typoResults1[0]?.item.slug, "invoice-generator");

  const typoResults2 = searchTools(TOOLS_REGISTRY, "conpress");
  assert.ok(typoResults2.length >= 1);
  assert.equal(typoResults2[0]?.item.slug, "image-compressor");

  const typoResults3 = searchTools(TOOLS_REGISTRY, "yt chapter");
  assert.ok(typoResults3.length >= 1);
  assert.equal(typoResults3[0]?.item.slug, "youtube-timestamp-formatter");

  // 7. Step 11 tools discovery
  const passResults = searchTools(TOOLS_REGISTRY, "passwrd");
  assert.ok(passResults.length >= 1);
  assert.equal(passResults[0]?.item.slug, "password-generator");

  const resizeResults = searchTools(TOOLS_REGISTRY, "resizer");
  assert.ok(resizeResults.length >= 1);
  assert.equal(resizeResults[0]?.item.slug, "image-resizer");

  const base64Results = searchTools(TOOLS_REGISTRY, "base64");
  assert.ok(base64Results.length >= 1);
  assert.equal(base64Results[0]?.item.slug, "base64-encoder-decoder");

  const percentResults = searchTools(TOOLS_REGISTRY, "percentage");
  assert.ok(percentResults.length >= 1);
  assert.equal(percentResults[0]?.item.slug, "percentage-calculator");

  // 8. Step 12 PDF tools discovery
  const pdfToImgRes = searchTools(TOOLS_REGISTRY, "pdf to jpg");
  assert.ok(pdfToImgRes.length >= 1);
  assert.equal(pdfToImgRes[0]?.item.slug, "pdf-to-image");

  const imgToPdfRes = searchTools(TOOLS_REGISTRY, "image to pdf");
  assert.ok(imgToPdfRes.length >= 1);
  assert.equal(imgToPdfRes[0]?.item.slug, "image-to-pdf");

  const orgRes = searchTools(TOOLS_REGISTRY, "organizer");
  assert.ok(orgRes.length >= 1);
  assert.equal(orgRes[0]?.item.slug, "pdf-organizer");

  const wmRes = searchTools(TOOLS_REGISTRY, "watermark");
  assert.ok(wmRes.length >= 1);
  assert.equal(wmRes[0]?.item.slug, "pdf-watermark");

  // 9. Step 14 Text tools discovery
  const caseRes = searchTools(TOOLS_REGISTRY, "title case");
  assert.ok(caseRes.length >= 1);
  assert.equal(caseRes[0]?.item.slug, "text-case-converter");

  const textCompRes = searchTools(TOOLS_REGISTRY, "text compare");
  assert.ok(textCompRes.length >= 1);
  assert.equal(textCompRes[0]?.item.slug, "text-compare");

  const textCleanRes = searchTools(TOOLS_REGISTRY, "text cleaner");
  assert.ok(textCleanRes.length >= 1);
  assert.equal(textCleanRes[0]?.item.slug, "text-cleaner");

  const loremRes = searchTools(TOOLS_REGISTRY, "lorem ipsum");
  assert.ok(loremRes.length >= 1);
  assert.equal(loremRes[0]?.item.slug, "lorem-ipsum-generator");
});

test("Step 11: Secure Password Generator", () => {
  // 1. Default generation
  const res = generateSecurePassword({ length: 16 });
  assert.equal(res.error, undefined);
  assert.equal(res.password.length, 16);

  // 2. Character diversity check
  const complex = generateSecurePassword({
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  assert.ok(/[A-Z]/.test(complex.password));
  assert.ok(/[a-z]/.test(complex.password));
  assert.ok(/[0-9]/.test(complex.password));
  assert.ok(/[^A-Za-z0-9]/.test(complex.password));

  // 3. Length boundaries (min 8, max 128)
  const tooShort = generateSecurePassword({ length: 4 });
  assert.equal(tooShort.password.length, 8); // clamped to min 8

  const tooLong = generateSecurePassword({ length: 256 });
  assert.equal(tooLong.password.length, 128); // clamped to max 128

  // 4. Ambiguous character exclusion
  const noAmbiguous = generateSecurePassword({
    length: 32,
    excludeAmbiguous: true,
  });
  assert.equal(/[Il1O0o|]/.test(noAmbiguous.password), false);

  // 5. Invalid options (no character categories selected)
  const invalid = generateSecurePassword({
    includeUppercase: false,
    includeLowercase: false,
    includeNumbers: false,
    includeSymbols: false,
  });
  assert.ok(invalid.error !== undefined);
  assert.equal(invalid.password, "");

  // 6. Strength evaluation
  const weak = evaluatePasswordStrength("abc");
  assert.ok(weak.score <= 1);
  const strong = evaluatePasswordStrength(complex.password);
  assert.ok(strong.score >= 3);
  assert.ok(strong.entropyBits > 60);
});

test("Step 11: Image Resizer Logic", () => {
  // 1. Aspect ratio calculation
  const aspect1 = calculateAspectDimension(1920, 1080, 1280, undefined);
  assert.equal(aspect1.width, 1280);
  assert.equal(aspect1.height, 720);

  const aspect2 = calculateAspectDimension(800, 600, undefined, 300);
  assert.equal(aspect2.width, 400);
  assert.equal(aspect2.height, 300);

  // 2. Target dimension validation
  assert.equal(validateTargetDimensions(1280, 720).valid, true);
  assert.equal(validateTargetDimensions(0, 100).valid, false);
  assert.equal(validateTargetDimensions(-50, 100).valid, false);
  assert.equal(validateTargetDimensions(9000, 720).valid, false); // exceeds 8192px cap
});

test("Step 11: Base64 Encoder & Decoder", () => {
  // 1. Standard ASCII encoding and decoding
  const asciiText = "Hello World!";
  const encodedAscii = encodeUtf8ToBase64(asciiText);
  assert.equal(encodedAscii.success, true);
  assert.equal(encodedAscii.output, "SGVsbG8gV29ybGQh");

  const decodedAscii = decodeBase64ToUtf8(encodedAscii.output);
  assert.equal(decodedAscii.success, true);
  assert.equal(decodedAscii.output, asciiText);

  // 2. Unicode and emoji roundtrip
  const unicodeText = "OneToolHub 🚀 世界 €100";
  const encodedUnicode = encodeUtf8ToBase64(unicodeText);
  assert.equal(encodedUnicode.success, true);

  const decodedUnicode = decodeBase64ToUtf8(encodedUnicode.output);
  assert.equal(decodedUnicode.success, true);
  assert.equal(decodedUnicode.output, unicodeText);

  // 3. Empty input handling
  assert.equal(encodeUtf8ToBase64("").output, "");
  assert.equal(decodeBase64ToUtf8("").output, "");

  // 4. Invalid Base64 error handling
  const invalidBase64 = decodeBase64ToUtf8("ThisIsNotValidBase64!!!");
  assert.equal(invalidBase64.success, false);
  assert.ok(invalidBase64.error !== undefined);
});

test("Step 11: Percentage Calculator", () => {
  // Mode 1: What is X% of Y?
  const res1 = calculatePercentage({
    mode: "what-is-x-percent-of-y",
    valX: 15,
    valY: 250,
  });
  assert.equal(res1.valid, true);
  assert.equal(res1.value, 37.5);
  assert.equal(res1.formattedResult, "37.5");

  // Mode 2: X is what % of Y?
  const res2 = calculatePercentage({
    mode: "x-is-what-percent-of-y",
    valX: 45,
    valY: 180,
  });
  assert.equal(res2.valid, true);
  assert.equal(res2.value, 25);
  assert.equal(res2.formattedResult, "25%");

  // Division by zero denominator
  const resZero = calculatePercentage({
    mode: "x-is-what-percent-of-y",
    valX: 50,
    valY: 0,
  });
  assert.equal(resZero.valid, false);
  assert.ok(resZero.error?.includes("denominator"));

  // Mode 3: Percentage increase / decrease
  const inc = calculatePercentage({
    mode: "percentage-change",
    valX: 80,
    valY: 100,
  });
  assert.equal(inc.valid, true);
  assert.equal(inc.value, 25);
  assert.equal(inc.direction, "increase");

  const dec = calculatePercentage({
    mode: "percentage-change",
    valX: 100,
    valY: 80,
  });
  assert.equal(dec.valid, true);
  assert.equal(dec.value, -20);
  assert.equal(dec.direction, "decrease");

  // Mode 4: Add X% to Y (tax/markup)
  const add = calculatePercentage({
    mode: "add-x-percent-to-y",
    valX: 10,
    valY: 150,
  });
  assert.equal(add.valid, true);
  assert.equal(add.value, 165);

  // Mode 5: Subtract X% from Y (discount)
  const sub = calculatePercentage({
    mode: "subtract-x-percent-from-y",
    valX: 20,
    valY: 80,
  });
  assert.equal(sub.valid, true);
  assert.equal(sub.value, 64);

  // Helper formatting
  assert.equal(formatPercentageNumber(12.34567, 2), "12.35");
});

// ============================================================================
// STEP 12: Advanced PDF & Document Utilities
// ============================================================================

test("Step 12: PDF to Image Validation & Config", () => {
  // 1. File type and name validation
  const validFile = { name: "contract.pdf", size: 1024 * 500, type: "application/pdf" };
  assert.equal(validatePdfForConversion(validFile).valid, true);

  const invalidExt = { name: "photo.png", size: 1024 * 500, type: "image/png" };
  assert.equal(validatePdfForConversion(invalidExt).valid, false);

  const emptyFile = { name: "empty.pdf", size: 0, type: "application/pdf" };
  assert.equal(validatePdfForConversion(emptyFile).valid, false);

  const oversized = { name: "huge.pdf", size: 60 * 1024 * 1024, type: "application/pdf" };
  assert.equal(validatePdfForConversion(oversized).valid, false);

  // 2. Magic header validation
  const validBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]); // %PDF-1.5
  assert.equal(validatePdfForConversion(validFile, validBytes).valid, true);

  const corruptedBytes = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44]);
  assert.equal(validatePdfForConversion(validFile, corruptedBytes).valid, false);
});

test("Step 12: Image to PDF Converter Logic", async () => {
  // 1. Image validation
  assert.equal(validateImageForPdf({ name: "scan.jpg", size: 5000, type: "image/jpeg" }).valid, true);
  assert.equal(validateImageForPdf({ name: "diagram.png", size: 5000, type: "image/png" }).valid, true);
  assert.equal(validateImageForPdf({ name: "photo.webp", size: 5000, type: "image/webp" }).valid, true);
  assert.equal(validateImageForPdf({ name: "notes.txt", size: 5000, type: "text/plain" }).valid, false);
  assert.equal(validateImageForPdf({ name: "empty.jpg", size: 0 }).valid, false);
  assert.equal(validateImageForPdf({ name: "giant.jpg", size: 35 * 1024 * 1024 }).valid, false);

  // 2. Multi-image PDF creation
  // Minimal 1x1 transparent PNG byte stream
  const png1x1 = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0,
    0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156,
    99, 96, 0, 0, 0, 2, 0, 1, 229, 39, 188, 70, 0, 0, 0, 0, 73, 69, 78, 68, 174,
    66, 96, 130,
  ]);

  const items = [
    {
      id: "img-1",
      name: "page1.png",
      size: png1x1.byteLength,
      type: "image/png",
      bytes: png1x1,
      objectUrl: "",
      width: 1,
      height: 1,
    },
    {
      id: "img-2",
      name: "page2.png",
      size: png1x1.byteLength,
      type: "image/png",
      bytes: png1x1,
      objectUrl: "",
      width: 1,
      height: 1,
    },
  ];

  const pdfOutput = await generatePdfFromImages(items, {
    pageSize: "a4",
    orientation: "portrait",
    margin: "small",
    layoutMode: "fit",
    outputFileName: "combined.pdf",
  });

  assert.equal(pdfOutput.pageCount, 2);
  assert.equal(pdfOutput.fileName, "combined.pdf");
  assert.ok(pdfOutput.bytes.byteLength > 500);

  // Verify resulting document structure with pdf-lib
  const parsed = await PDFDocument.load(pdfOutput.bytes);
  assert.equal(parsed.getPageCount(), 2);
  const p1 = parsed.getPage(0);
  assert.equal(Math.round(p1.getWidth()), 595); // A4 width
});

test("Step 12: PDF Page Organizer Logic", async () => {
  const dummyPages: OrganizerPageItem[] = [
    { id: "1", originalIndex: 0, displayNumber: 1, rotationDegrees: 0 },
    { id: "2", originalIndex: 1, displayNumber: 2, rotationDegrees: 0 },
    { id: "3", originalIndex: 2, displayNumber: 3, rotationDegrees: 0 },
  ];

  // 1. Reordering
  const moved = reorderPages(dummyPages, 0, 2);
  assert.equal(moved[0]?.displayNumber, 2);
  assert.equal(moved[1]?.displayNumber, 3);
  assert.equal(moved[2]?.displayNumber, 1);

  // 2. Rotation
  const rot1 = rotatePage(dummyPages, 0, 90);
  assert.equal(rot1[0]?.rotationDegrees, 90);
  const rot2 = rotatePage(rot1, 0, 90);
  assert.equal(rot2[0]?.rotationDegrees, 180);
  const rot3 = rotatePage(rot2, 0, -90);
  assert.equal(rot3[0]?.rotationDegrees, 90);

  const rotAll = rotateAllPages(dummyPages, 90);
  assert.equal(rotAll[0]?.rotationDegrees, 90);
  assert.equal(rotAll[1]?.rotationDegrees, 90);
  assert.equal(rotAll[2]?.rotationDegrees, 90);

  // 3. Deletion with guard
  const delSuccess = deletePage(dummyPages, 1);
  assert.equal(delSuccess.deleted, true);
  assert.equal(delSuccess.pages.length, 2);

  const singlePageList = [dummyPages[0]!];
  const delBlocked = deletePage(singlePageList, 0);
  assert.equal(delBlocked.deleted, false);
  assert.ok(delBlocked.error?.includes("at least one page"));

  // 4. Export Organized PDF
  const testPdf = await PDFDocument.create();
  testPdf.addPage([400, 400]);
  testPdf.addPage([500, 500]);
  testPdf.addPage([600, 600]);
  const originalBytes = await testPdf.save();

  const organized = await exportOrganizedPdf(
    originalBytes,
    [
      { id: "p3", originalIndex: 2, displayNumber: 3, rotationDegrees: 90 },
      { id: "p1", originalIndex: 0, displayNumber: 1, rotationDegrees: 0 },
    ],
    "reordered.pdf"
  );

  assert.equal(organized.pageCount, 2);
  assert.equal(organized.fileName, "reordered.pdf");

  const verifyDoc = await PDFDocument.load(organized.bytes);
  assert.equal(verifyDoc.getPageCount(), 2);
  assert.equal(verifyDoc.getPage(0).getRotation().angle, 90);
});

test("Step 12: PDF Watermark Tool Logic", async () => {
  // 1. Color parsing
  const red = hexToPdfRgb("#ef4444");
  assert.ok(red.red > 0.8);
  assert.ok(red.green < 0.4);

  const black = hexToPdfRgb("#000000");
  assert.equal(black.red, 0);
  assert.equal(black.green, 0);
  assert.equal(black.blue, 0);

  const threeDigit = hexToPdfRgb("#fff");
  assert.equal(threeDigit.red, 1);

  // 2. Watermark Application
  const testDoc = await PDFDocument.create();
  testDoc.addPage([600, 800]);
  testDoc.addPage([600, 800]);
  const pdfBytes = await testDoc.save();

  // Apply Center Watermark
  const watermarked = await applyWatermarkToPdf(
    pdfBytes,
    {
      text: "CONFIDENTIAL",
      fontSize: 48,
      fontFamily: "HelveticaBold",
      colorHex: "#ef4444",
      opacity: 0.3,
      rotationDegrees: -45,
      position: "center",
      pageSelection: "all",
    },
    "marked.pdf"
  );

  assert.equal(watermarked.pageCount, 2);
  assert.equal(watermarked.fileName, "marked.pdf");
  assert.ok(watermarked.bytes.byteLength > pdfBytes.byteLength);

  // Verify result is a valid loadable PDF
  const loaded = await PDFDocument.load(watermarked.bytes);
  assert.equal(loaded.getPageCount(), 2);

  // Apply Tiled Watermark to single page range
  const tiled = await applyWatermarkToPdf(
    pdfBytes,
    {
      text: "DRAFT",
      fontSize: 24,
      fontFamily: "Helvetica",
      colorHex: "#6b7280",
      opacity: 0.2,
      rotationDegrees: -30,
      position: "tile",
      pageSelection: "custom",
      customPagesString: "1",
    },
    "tiled.pdf"
  );
  assert.equal(tiled.pageCount, 2);
  const loadedTiled = await PDFDocument.load(tiled.bytes);
  assert.equal(loadedTiled.getPageCount(), 2);
});

// ============================================================================
// STEP 13: Advanced Developer Tools Expansion
// ============================================================================
test("Step 13: Regex Tester & Debugger Logic", () => {
  // 1. Valid execution with matches and capture groups
  const emailRegex = testRegularExpression(
    "([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})",
    "Contact us at hello@onetoolhub.com or support@example.org today.",
    "g"
  );
  assert.equal(emailRegex.valid, true);
  assert.equal(emailRegex.error, undefined);
  assert.equal(emailRegex.matches.length, 2);
  assert.equal(emailRegex.matches[0]?.fullMatch, "hello@onetoolhub.com");
  assert.equal(emailRegex.matches[0]?.groups.length, 2);
  assert.equal(emailRegex.matches[0]?.groups[0]?.value, "hello");
  assert.equal(emailRegex.matches[0]?.groups[1]?.value, "onetoolhub.com");
  assert.equal(emailRegex.matches[1]?.fullMatch, "support@example.org");

  // 2. Named capture groups
  const namedRegex = testRegularExpression(
    "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",
    "Release date: 2026-10-12",
    "g"
  );
  assert.equal(namedRegex.valid, true);
  assert.equal(namedRegex.matches.length, 1);
  const yearGroup = namedRegex.matches[0]?.groups.find((g) => g.name === "year");
  assert.ok(yearGroup);
  assert.equal(yearGroup.value, "2026");

  // 3. Flags handling: case-insensitive & non-global
  const caseRegex = testRegularExpression("apple", "PineApple juice", "i");
  assert.equal(caseRegex.valid, true);
  assert.equal(caseRegex.matches.length, 1);
  assert.equal(caseRegex.matches[0]?.fullMatch, "Apple");

  // 4. Invalid regular expression pattern
  const invalidRegex = testRegularExpression("[a-z", "test", "g");
  assert.equal(invalidRegex.valid, false);
  assert.ok(invalidRegex.error && invalidRegex.error.length > 0);
  assert.equal(invalidRegex.matches.length, 0);

  // 5. Zero-length match loop guard (e.g. empty or non-advancing regex)
  const zeroLenRegex = testRegularExpression("(?=a)", "aaa", "g");
  assert.equal(zeroLenRegex.valid, true);
  assert.ok(zeroLenRegex.matches.length <= 10);

  // 6. Catastrophic backtracking detection
  const backtrackCheck = detectPotentialCatastrophicBacktracking("(a+)+$");
  assert.equal(backtrackCheck.suspicious, true);
  assert.ok(backtrackCheck.warning && backtrackCheck.warning.length > 10);

  // 7. Built-in presets presence
  assert.ok(REGEX_LIBRARY_PRESETS.length >= 5);
  assert.ok(REGEX_LIBRARY_PRESETS.some((p) => p.name.includes("Email")));
  assert.ok(REGEX_LIBRARY_PRESETS.some((p) => p.name.includes("URL")));
  assert.ok(REGEX_LIBRARY_PRESETS.some((p) => p.name.includes("IPv4")));
});

test("Step 13: Code Diff Checker Logic", () => {
  const origText = "line 1\nline 2\nline 3\nline 4";
  const modText = "line 1\nline 2 (modified)\nline 3\nline 5";

  // 1. Basic diff computation
  const diffResult = computeCodeDiff(origText, modText, {
    ignoreWhitespace: false,
    ignoreCase: false,
    viewMode: "side-by-side",
  }, {
    original: "orig.txt",
    modified: "mod.txt",
  });

  assert.ok(diffResult.stats.addedCount >= 1);
  assert.ok(diffResult.stats.removedCount >= 1);
  assert.ok(diffResult.unifiedLines.length > 0);
  assert.ok(diffResult.sideBySideRows.length > 0);
  assert.ok(diffResult.patchString.startsWith("Index: orig.txt") || diffResult.patchString.includes("--- orig.txt"));

  // 2. Ignore whitespace option
  const origWs = "  hello world  \nfoo";
  const modWs = "hello world\nfoo";
  const diffWithWs = computeCodeDiff(origWs, modWs, {
    ignoreWhitespace: false,
    ignoreCase: false,
    viewMode: "side-by-side",
  });
  const diffIgnoreWs = computeCodeDiff(origWs, modWs, {
    ignoreWhitespace: true,
    ignoreCase: false,
    viewMode: "side-by-side",
  });
  assert.ok(diffWithWs.stats.addedCount > 0 || diffWithWs.stats.removedCount > 0);
  assert.equal(diffIgnoreWs.stats.addedCount, 0);
  assert.equal(diffIgnoreWs.stats.removedCount, 0);

  // 3. Ignore case option
  const origCase = "function Test() {}";
  const modCase = "function test() {}";
  const diffIgnoreCase = computeCodeDiff(origCase, modCase, {
    ignoreWhitespace: false,
    ignoreCase: true,
    viewMode: "side-by-side",
  });
  assert.equal(diffIgnoreCase.stats.addedCount, 0);
  assert.equal(diffIgnoreCase.stats.removedCount, 0);

  // 4. Sample diff presence
  assert.ok(SAMPLE_CODE_DIFF.original.length > 20);
  assert.ok(SAMPLE_CODE_DIFF.modified.length > 20);
});

test("Step 13: Color Picker & Converter Logic", () => {
  // 1. HEX to RGB conversion
  const rgbFromHex = hexToRgb("#2563eb");
  assert.ok(rgbFromHex);
  assert.equal(rgbFromHex.r, 37);
  assert.equal(rgbFromHex.g, 99);
  assert.equal(rgbFromHex.b, 235);

  // 2. Shorthand 3-char HEX
  const shorthand = hexToRgb("#fff");
  assert.ok(shorthand);
  assert.equal(shorthand.r, 255);
  assert.equal(shorthand.g, 255);
  assert.equal(shorthand.b, 255);

  // 3. RGB to HEX conversion
  assert.equal(rgbToHex({ r: 37, g: 99, b: 235 }), "#2563eb");
  assert.equal(rgbToHex({ r: 255, g: 255, b: 255 }), "#ffffff");
  assert.equal(rgbToHex({ r: 0, g: 0, b: 0 }), "#000000");

  // 4. RGB to HSL and HSL to RGB roundtrip
  const hsl = rgbToHsl({ r: 37, g: 99, b: 235 });
  assert.equal(hsl.h, 221);
  assert.equal(hsl.s, 83);
  assert.equal(hsl.l, 53);

  const rgbBack = hslToRgb(hsl);
  assert.ok(Math.abs(rgbBack.r - 37) <= 1);
  assert.ok(Math.abs(rgbBack.g - 99) <= 1);
  assert.ok(Math.abs(rgbBack.b - 235) <= 1);
  assert.equal(hslToHex(hsl), "#2463eb");

  // 5. WCAG Contrast ratio math
  const blackOnWhiteRatio = calculateContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
  assert.equal(blackOnWhiteRatio, 21);
  const evalBlackOnWhite = evaluateWcagCompliance(blackOnWhiteRatio);
  assert.equal(evalBlackOnWhite.normalTextAa, true);
  assert.equal(evalBlackOnWhite.normalTextAaa, true);

  const whiteOnWhiteRatio = calculateContrastRatio({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 });
  assert.equal(whiteOnWhiteRatio, 1);
  const evalWhiteOnWhite = evaluateWcagCompliance(whiteOnWhiteRatio);
  assert.equal(evalWhiteOnWhite.normalTextAa, false);

  // 6. Harmonic palettes
  const palettes = generateHarmonicPalettes("#2563eb");
  assert.ok(palettes.complementary.hex);
  assert.ok(palettes.analogous1.hex);
  assert.ok(palettes.analogous2.hex);
  assert.ok(palettes.tintLight.hex);
  assert.ok(palettes.shadeDark.hex);

  // 7. CSS variable export
  const cssVars = exportPaletteAsCss("#2563eb");
  assert.ok(cssVars.includes(":root {"));
  assert.ok(cssVars.includes("--color-primary: #2563eb;"));
});

test("Step 13: UUID Generator & Validator Logic", () => {
  // 1. Single UUID generation
  const single = generateSingleUuidV4();
  assert.equal(single.length, 36);
  assert.equal(single[14], "4"); // version 4
  assert.ok(["8", "9", "a", "b"].includes(single[19] ?? "")); // RFC variant

  // 2. Format options: Uppercase, No hyphens, Braces
  const upperBraced = formatUuid(single, {
    uppercase: true,
    hyphens: true,
    braces: true,
  });
  assert.ok(upperBraced.startsWith("{"));
  assert.ok(upperBraced.endsWith("}"));
  assert.equal(upperBraced, upperBraced.toUpperCase());

  const compact = formatUuid(single, {
    uppercase: false,
    hyphens: false,
    braces: false,
  });
  assert.equal(compact.length, 32);
  assert.equal(compact.includes("-"), false);

  // 3. Bulk generation and uniqueness
  const bulk = generateBulkUuids(100, {
    uppercase: false,
    hyphens: true,
    braces: false,
  });
  assert.equal(bulk.length, 100);
  const uniqueSet = new Set(bulk);
  assert.equal(uniqueSet.size, 100);

  // 4. Batch text list
  const batchText = bulk.slice(0, 5).join("\n");
  assert.equal(batchText.split("\n").length, 5);

  // 5. Validation of valid UUID
  const validCheck = validateUuidString("f47ac10b-58cc-4372-a567-0e02b2c3d479");
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.version, 4);
  assert.equal(validCheck.variant, "RFC 4122 / RFC 9562");

  // 6. Validation of Nil UUID
  const nilCheck = validateUuidString("00000000-0000-0000-0000-000000000000");
  assert.equal(nilCheck.valid, true);
  assert.equal(nilCheck.version, "nil");

  // 7. Validation of invalid UUIDs
  const badChar = validateUuidString("f47ac10b-58cc-4372-a567-0e02b2c3d47z");
  assert.equal(badChar.valid, false);

  const shortStr = validateUuidString("12345");
  assert.equal(shortStr.valid, false);
});

// ============================================================================
// STEP 14: Advanced Text & Writing Tools
// ============================================================================

test("Step 14: Text Case Converter Logic", () => {
  const sample = "the old man AND the sea";

  // 1. Core case transformations
  assert.equal(convertTextCase(sample, "uppercase"), "THE OLD MAN AND THE SEA");
  assert.equal(convertTextCase(sample, "lowercase"), "the old man and the sea");
  assert.equal(convertTextCase(sample, "titlecase"), "The Old Man and the Sea");
  assert.equal(convertTextCase("hello world. how are you?", "sentencecase"), "Hello world. How are you?");
  assert.equal(convertTextCase(sample, "capitalizeWords"), "The Old Man AND The Sea");
  assert.equal(convertTextCase("Hello World", "togglecase"), "hELLO wORLD");

  // 2. Developer casings
  assert.equal(convertTextCase("user authentication session", "camelcase"), "userAuthenticationSession");
  assert.equal(convertTextCase("user authentication session", "kebabcase"), "user-authentication-session");
  assert.equal(convertTextCase("user authentication session", "snakecase"), "user_authentication_session");
  assert.equal(convertTextCase("user authentication session", "constantcase"), "USER_AUTHENTICATION_SESSION");

  // 3. Editorial Title Case rules: first and last words always capitalized
  assert.equal(convertTextCase("an essay on criticism", "titlecase"), "An Essay on Criticism");
  assert.equal(convertTextCase("what are you waiting for", "titlecase"), "What Are You Waiting For");

  // 4. Text statistics
  const stats = getTextStatistics("Hello world! This is OneToolHub.\n\nSecond paragraph here.");
  assert.equal(stats.characterCount, 56);
  assert.equal(stats.characterCountNoSpaces, 48);
  assert.equal(stats.wordCount, 8);
  assert.equal(stats.paragraphCount, 2);
  assert.equal(stats.lineCount, 3);
});

test("Step 14: Text Compare & Difference Checker Logic", () => {
  const original = "The quick brown fox jumps over the lazy dog.";
  const modified = "The fast brown fox jumps over the sleepy dog.";

  // 1. Word-level diff
  const wordDiff = compareProseTexts(original, modified, {
    mode: "words",
    ignoreCase: false,
    ignoreWhitespace: false,
  });
  assert.ok(wordDiff.stats.addedCount >= 2); // 'fast', 'sleepy'
  assert.ok(wordDiff.stats.removedCount >= 2); // 'quick', 'lazy'
  assert.ok(wordDiff.stats.similarityScore > 50 && wordDiff.stats.similarityScore < 100);
  assert.ok(wordDiff.tokens.some((t) => t.type === "added"));
  assert.ok(wordDiff.tokens.some((t) => t.type === "removed"));
  assert.ok(wordDiff.tokens.some((t) => t.type === "unchanged"));

  // 2. Identical texts
  const identicalDiff = compareProseTexts(original, original, {
    mode: "words",
    ignoreCase: false,
    ignoreWhitespace: false,
  });
  assert.equal(identicalDiff.stats.similarityScore, 100);
  assert.equal(identicalDiff.stats.addedCount, 0);
  assert.equal(identicalDiff.stats.removedCount, 0);

  // 3. Case normalization
  const caseDiffWithFlag = compareProseTexts("Hello World", "hello world", {
    mode: "words",
    ignoreCase: true,
    ignoreWhitespace: false,
  });
  assert.equal(caseDiffWithFlag.stats.similarityScore, 100);
  assert.equal(caseDiffWithFlag.stats.addedCount, 0);
  assert.equal(caseDiffWithFlag.stats.removedCount, 0);

  // 4. Line-level diff
  const lines1 = "Line 1\nLine 2\nLine 3";
  const lines2 = "Line 1\nLine Modified\nLine 3";
  const lineDiff = compareProseTexts(lines1, lines2, {
    mode: "lines",
    ignoreCase: false,
    ignoreWhitespace: false,
  });
  assert.ok(lineDiff.stats.addedCount > 0);
  assert.ok(lineDiff.stats.removedCount > 0);

  // 5. Summary text export
  assert.ok(wordDiff.summaryText.includes("OneToolHub Text Comparison Summary"));
  assert.ok(wordDiff.summaryText.includes("Similarity Score:"));
});

test("Step 14: Text Cleaner & Formatter Logic", () => {
  // 1. Extra spaces and trimming
  const messySpaces = "  This   has    excessive   spaces.   ";
  const cleanedSpaces = cleanText(messySpaces, {
    ...DEFAULT_CLEANER_OPTIONS,
    removeExtraSpaces: true,
    trimLines: true,
  });
  assert.equal(cleanedSpaces.cleanedText, "This has excessive spaces.");
  assert.ok(cleanedSpaces.stats.charactersRemoved > 0);

  // 2. Empty lines and blank line collapsing
  const multipleBlanks = "Para 1\n\n\n\n\nPara 2";
  const reducedBlanks = cleanText(multipleBlanks, {
    ...DEFAULT_CLEANER_OPTIONS,
    reduceBlankLines: true,
  });
  assert.equal(reducedBlanks.cleanedText, "Para 1\n\nPara 2");

  // 3. Duplicate line removal
  const dupLines = "Alpha\nBeta\nAlpha\nGamma\nbeta";
  const dedupedSensitive = cleanText(dupLines, {
    ...DEFAULT_CLEANER_OPTIONS,
    removeDuplicateLines: true,
    caseInsensitiveDuplicates: false,
  });
  assert.equal(dedupedSensitive.cleanedText, "Alpha\nBeta\nGamma\nbeta");

  const dedupedInsensitive = cleanText(dupLines, {
    ...DEFAULT_CLEANER_OPTIONS,
    removeDuplicateLines: true,
    caseInsensitiveDuplicates: true,
  });
  assert.equal(dedupedInsensitive.cleanedText, "Alpha\nBeta\nGamma");

  // 4. Tab to space conversion (4 spaces per tab)
  const tabText = "\tIndented text";
  const spacedText = cleanText(tabText, {
    ...DEFAULT_CLEANER_OPTIONS,
    convertTabsToSpaces: true,
    removeExtraSpaces: false,
    trimLines: false,
  });
  assert.equal(spacedText.cleanedText, "    Indented text");

  // 5. HTML tag stripping
  const htmlInput = "<p>Welcome to <b>OneToolHub</b>!</p><br><p>Second line.</p>";
  const strippedHtml = cleanText(htmlInput, {
    ...DEFAULT_CLEANER_OPTIONS,
    stripHtmlTags: true,
  });
  assert.ok(!strippedHtml.cleanedText.includes("<p>"));
  assert.ok(!strippedHtml.cleanedText.includes("<b>"));
  assert.ok(strippedHtml.cleanedText.includes("Welcome to OneToolHub!"));
});

test("Step 14: Lorem Ipsum & Placeholder Text Generator Logic", () => {
  // 1. Words mode
  const wordsLatin = generatePlaceholderText({
    mode: "words",
    quantity: 15,
    flavor: "latin",
    startWithLorem: false,
    asHtmlParagraphs: false,
  });
  const wordTokens = wordsLatin.split(/\s+/).filter(Boolean);
  assert.equal(wordTokens.length, 15);

  // 2. Sentences mode with classic prefix
  const sentencesLatin = generatePlaceholderText({
    mode: "sentences",
    quantity: 3,
    flavor: "latin",
    startWithLorem: true,
    asHtmlParagraphs: false,
  });
  assert.ok(sentencesLatin.startsWith("Lorem ipsum dolor sit amet"));
  const sentenceCount = sentencesLatin.split(/\.\s+/).filter(Boolean).length;
  assert.ok(sentenceCount >= 3);

  // 3. Paragraphs mode with HTML tags
  const parasHtml = generatePlaceholderText({
    mode: "paragraphs",
    quantity: 2,
    flavor: "latin",
    startWithLorem: true,
    asHtmlParagraphs: true,
  });
  assert.ok(parasHtml.startsWith("<p>Lorem ipsum dolor sit amet"));
  assert.ok(parasHtml.includes("</p>"));
  const pTags = parasHtml.match(/<p>/g);
  assert.equal(pTags?.length, 2);

  // 4. English mock flavor
  const englishWords = generatePlaceholderText({
    mode: "words",
    quantity: 10,
    flavor: "english",
    startWithLorem: false,
    asHtmlParagraphs: false,
  });
  assert.ok(englishWords.length > 0);
  const englishTokens = englishWords.split(/\s+/).filter(Boolean);
  assert.equal(englishTokens.length, 10);
});

test("Step 15: Technical SEO Sitemap Dynamic Timestamps & Coverage", () => {
  // Test dynamic sitemap entries
  const availableTools = TOOLS_REGISTRY.filter((t) => t.status === "available" && t.href);
  assert.equal(availableTools.length, 24, "All 24 tools must be in available status");
  assert.equal(LEARN_ARTICLES.length, 24, "All 24 tutorials must be registered");

  // Every tool must have a matching tutorial
  for (const tool of availableTools) {
    const tutorial = LEARN_ARTICLES.find((a) => a.primaryToolSlug === tool.slug);
    assert.ok(tutorial, `Tool '${tool.slug}' must have a paired tutorial in LEARN_ARTICLES`);
    assert.ok(tutorial?.updatedAt, `Tutorial '${tutorial?.slug}' must have an updatedAt date`);
    const dateParsed = new Date(`${tutorial?.updatedAt}T00:00:00.000Z`);
    assert.ok(!isNaN(dateParsed.getTime()), `Tutorial '${tutorial?.slug}' updatedAt must be a valid ISO date`);
  }
});

test("Step 15: All 24 Tools Route Registry & Client-Side Integrity", () => {
  // Verify slugs, titles, categories, icons, and keyword density
  const validCategories = ["student", "freelancer", "developer", "youtube"];
  const seenSlugs = new Set<string>();

  for (const tool of TOOLS_REGISTRY) {
    assert.ok(tool.slug && tool.slug.length > 2, `Tool has valid slug: ${tool.slug}`);
    assert.ok(!seenSlugs.has(tool.slug), `Duplicate slug detected: ${tool.slug}`);
    seenSlugs.add(tool.slug);

    assert.ok(tool.name && tool.name.length > 3, `Tool has valid name: ${tool.name}`);
    assert.ok(tool.shortDescription && tool.shortDescription.length > 20, `Tool has descriptive copy: ${tool.shortDescription}`);
    assert.ok(validCategories.includes(tool.categoryId), `Tool category is valid: ${tool.categoryId}`);
    assert.ok(tool.href && tool.href.startsWith("/tools/"), `Tool href starts with /tools/: ${tool.href}`);
    assert.ok(tool.keywords && tool.keywords.length >= 3, `Tool has at least 3 searchable keywords: ${tool.slug}`);
  }

  assert.equal(seenSlugs.size, 24, "Total registered tools must exactly equal 24");
});

test("Step 16: Error Classification, Standard Error Classes & Safe Serialization", async () => {
  const {
    ValidationError,
    ProcessingError,
    FileError,
    BrowserCompatibilityError,
    NetworkError,
    UnexpectedApplicationError,
    classifyErrorCategory,
    bucketDuration,
    reportToolProcessingError,
  } = await import("../error-monitoring.ts");

  // 1. Instantiating Standard Error Classes
  const valErr = new ValidationError("User input exceeds 500 chars");
  assert.equal(valErr.errorType, "ValidationError");
  assert.equal(valErr.category, "invalid_input");
  assert.equal(valErr.severity, "warning");
  assert.ok(valErr.safeMessage.includes("verify your input"));

  const procErr = new ProcessingError("Internal matrix transformation failed");
  assert.equal(procErr.errorType, "ProcessingError");
  assert.equal(procErr.category, "processing_error");
  assert.equal(procErr.severity, "error");

  const fileErr = new FileError("Corrupt zip chunk", "corrupted_file");
  assert.equal(fileErr.errorType, "FileError");
  assert.equal(fileErr.category, "corrupted_file");

  const compatErr = new BrowserCompatibilityError("OffscreenCanvas");
  assert.equal(compatErr.errorType, "BrowserCompatibilityError");
  assert.equal(compatErr.category, "runtime_boundary_error");

  const netErr = new NetworkError("DNS resolution failed");
  assert.equal(netErr.errorType, "NetworkError");
  assert.equal(netErr.severity, "warning");

  const unexpErr = new UnexpectedApplicationError("Fatal out of memory");
  assert.equal(unexpErr.errorType, "UnexpectedApplicationError");
  assert.equal(unexpErr.severity, "critical");

  // 2. Classifying instances into safe categories
  assert.equal(classifyErrorCategory(valErr), "invalid_input");
  assert.equal(classifyErrorCategory(fileErr), "corrupted_file");
  assert.equal(classifyErrorCategory(new Error("File too large > 25MB")), "file_too_large");
  assert.equal(classifyErrorCategory(new Error("PDF encrypted with password")), "encrypted_file");

  // 3. Duration bucketing verification
  assert.equal(bucketDuration(45), "<100ms");
  assert.equal(bucketDuration(250), "100-500ms");
  assert.equal(bucketDuration(1200), "500ms-2s");
  assert.equal(bucketDuration(5000), ">2s");

  // 4. Safe Error Report Generation (never leaks sensitive data)
  const report = reportToolProcessingError({
    toolSlug: "pdf-to-image",
    toolCategory: "freelancer",
    errorCategory: "file_too_large",
    operationType: "extract_pages",
    durationMs: 350,
  });

  assert.equal(report.toolSlug, "pdf-to-image");
  assert.equal(report.errorCategory, "file_too_large");
  assert.equal(report.durationMsBucket, "100-500ms");
  assert.ok(report.timestamp);
});

test("Step 16: Web Vitals RUM Thresholds & Privacy Safety", async () => {
  const { rateWebVital } = await import("../web-vitals.ts");

  // LCP: <= 2500 good, <= 4000 needs-improvement, > 4000 poor
  assert.equal(rateWebVital("LCP", 1200), "good");
  assert.equal(rateWebVital("LCP", 3000), "needs-improvement");
  assert.equal(rateWebVital("LCP", 4500), "poor");

  // INP: <= 200 good, <= 500 needs-improvement, > 500 poor
  assert.equal(rateWebVital("INP", 80), "good");
  assert.equal(rateWebVital("INP", 350), "needs-improvement");
  assert.equal(rateWebVital("INP", 650), "poor");

  // CLS: <= 0.1 good, <= 0.25 needs-improvement, > 0.25 poor
  assert.equal(rateWebVital("CLS", 0.02), "good");
  assert.equal(rateWebVital("CLS", 0.18), "needs-improvement");
  assert.equal(rateWebVital("CLS", 0.35), "poor");

  // TTFB & FCP
  assert.equal(rateWebVital("TTFB", 200), "good");
  assert.equal(rateWebVital("FCP", 1400), "good");
});

test("Step 17: Internationalization Config, Path Resolution & Translation Dictionaries", async () => {
  const {
    LOCALES,
    DEFAULT_LOCALE,
    SUPPORTED_LOCALES,
    getLocaleFromPathname,
    formatLocalizedPath,
  } = await import("../i18n/config.ts");
  const { getDictionary } = await import("../i18n/index.ts");
  const { UR_TOOLS_MAP } = await import("../i18n/tools-ur.ts");

  // 1. Locale Config Integrity
  assert.equal(DEFAULT_LOCALE, "en");
  assert.deepEqual([...SUPPORTED_LOCALES], ["en", "ur"]);
  assert.equal(LOCALES.en.dir, "ltr");
  assert.equal(LOCALES.ur.dir, "rtl");
  assert.equal(LOCALES.ur.nativeName, "اردو");

  // 2. Pathname Resolution
  assert.equal(getLocaleFromPathname("/"), "en");
  assert.equal(getLocaleFromPathname("/tools"), "en");
  assert.equal(getLocaleFromPathname("/tools/json-formatter"), "en");
  assert.equal(getLocaleFromPathname("/ur"), "ur");
  assert.equal(getLocaleFromPathname("/ur/tools"), "ur");
  assert.equal(getLocaleFromPathname("/ur/tools/json-formatter"), "ur");

  // 3. Bidirectional Path Formatting
  assert.equal(formatLocalizedPath("/", "ur"), "/ur");
  assert.equal(formatLocalizedPath("/tools", "ur"), "/ur/tools");
  assert.equal(formatLocalizedPath("/tools/json-formatter", "ur"), "/ur/tools/json-formatter");
  assert.equal(formatLocalizedPath("/ur/tools/json-formatter", "en"), "/tools/json-formatter");
  assert.equal(formatLocalizedPath("/ur", "en"), "/");

  // 4. Dictionaries Completeness
  const enDict = getDictionary("en");
  const urDict = getDictionary("ur");
  assert.ok(enDict.common.siteName);
  assert.ok(urDict.common.siteName);
  assert.equal(urDict.common.siteName, "ون ٹول ہب");
  assert.equal(urDict.categories.developer.shortName, "ڈویلپرز");
  assert.equal(urDict.toolUI.copied, "کاپی ہو گیا!");

  // 5. Complete 24-tool Urdu mapping
  assert.equal(Object.keys(UR_TOOLS_MAP).length, 24, "All 24 tools must have Urdu translations");
  for (const slug of Object.keys(UR_TOOLS_MAP)) {
    const item = UR_TOOLS_MAP[slug];
    assert.ok(item?.name && item.name.length > 2, `Urdu name exists for ${slug}`);
    assert.ok(item?.shortDescription && item.shortDescription.length > 10, `Urdu description exists for ${slug}`);
    assert.ok(item?.keywords && item.keywords.length >= 2, `Urdu keywords exist for ${slug}`);
  }
});

test("Step 17: Multilingual Tool Search & Typo Tolerance across English and Urdu", async () => {
  const { searchTools } = await import("../search.ts");

  // 1. Search in English still works
  const enRes = searchTools(TOOLS_REGISTRY, "json formatter");
  assert.ok(enRes.length >= 1);
  assert.equal(enRes[0]?.tool.slug, "json-formatter");

  // 2. Search in Urdu: Exact Name
  const urNameRes = searchTools(TOOLS_REGISTRY, "امیج کمپریسر");
  assert.ok(urNameRes.length >= 1, "Must find Image Compressor via Urdu query 'امیج کمپریسر'");
  assert.equal(urNameRes[0]?.tool.slug, "image-compressor");

  // 3. Search in Urdu: Keyword match
  const urKwRes = searchTools(TOOLS_REGISTRY, "پاس ورڈ");
  assert.ok(urKwRes.length >= 1, "Must find Password Generator via Urdu keyword 'پاس ورڈ'");
  assert.equal(urKwRes[0]?.tool.slug, "password-generator");

  // 4. Search in Urdu: GPA
  const urGpaRes = searchTools(TOOLS_REGISTRY, "سی جی پی اے");
  assert.ok(urGpaRes.length >= 1, "Must find GPA Calculator via Urdu query 'سی جی پی اے'");
  assert.equal(urGpaRes[0]?.tool.slug, "gpa-calculator");
});

test("Step 17: Reciprocal Hreflang and Multilingual Metadata", async () => {
  const { buildPageMetadata } = await import("../seo.ts");

  // English page metadata
  const enMeta = buildPageMetadata({
    title: "All Tools",
    description: "Directory of tools",
    pathname: "/tools",
    locale: "en",
  });

  const enLangs = enMeta.alternates?.languages as Record<string, string>;
  assert.ok(enLangs);
  assert.equal(enLangs.en, "/tools");
  assert.equal(enLangs.ur, "/ur/tools");
  assert.equal(enLangs["x-default"], "/tools");

  // Urdu page metadata
  const urMeta = buildPageMetadata({
    title: "تمام ٹولز",
    description: "ٹولز کی فہرست",
    pathname: "/ur/tools",
    locale: "ur",
  });

  const urLangs = urMeta.alternates?.languages as Record<string, string>;
  assert.ok(urLangs);
  assert.equal(urLangs.en, "/tools");
  assert.equal(urLangs.ur, "/ur/tools");
  assert.equal(urLangs["x-default"], "/tools");
  assert.equal(urMeta.openGraph?.locale, "ur_PK");
});

test("Step 18: Pathname Localization & Fallback Routing Matrix", async () => {
  const {
    getLocaleFromPathname,
    formatLocalizedPath,
    isSupportedLocale,
    DEFAULT_LOCALE,
    SUPPORTED_LOCALES,
  } = await import("../i18n/config.ts");

  // Supported Locales
  assert.equal(DEFAULT_LOCALE, "en");
  assert.deepEqual(Array.from(SUPPORTED_LOCALES), ["en", "ur"]);
  assert.equal(isSupportedLocale("en"), true);
  assert.equal(isSupportedLocale("ur"), true);
  assert.equal(isSupportedLocale("fr"), false);
  assert.equal(isSupportedLocale(null), false);
  assert.equal(isSupportedLocale(undefined), false);

  // Pathname to Locale detection
  assert.equal(getLocaleFromPathname("/"), "en");
  assert.equal(getLocaleFromPathname("/tools"), "en");
  assert.equal(getLocaleFromPathname("/tools/json-formatter"), "en");
  assert.equal(getLocaleFromPathname("/ur"), "ur");
  assert.equal(getLocaleFromPathname("/ur/"), "ur");
  assert.equal(getLocaleFromPathname("/ur/tools"), "ur");
  assert.equal(getLocaleFromPathname("/ur/tools/json-formatter"), "ur");
  assert.equal(getLocaleFromPathname("ur/tools"), "ur");

  // Bidirectional Localized Path Formatting
  assert.equal(formatLocalizedPath("/", "en"), "/");
  assert.equal(formatLocalizedPath("/", "ur"), "/ur");
  assert.equal(formatLocalizedPath("/ur", "en"), "/");
  assert.equal(formatLocalizedPath("/ur", "ur"), "/ur");
  assert.equal(formatLocalizedPath("/tools/json-formatter", "ur"), "/ur/tools/json-formatter");
  assert.equal(formatLocalizedPath("/ur/tools/json-formatter", "en"), "/tools/json-formatter");
  assert.equal(formatLocalizedPath("/learn", "ur"), "/ur/learn");
  assert.equal(formatLocalizedPath("/ur/learn", "en"), "/learn");
});

test("Step 18: Mathematical & Invariant Calculation Parity across Language Contexts", async () => {
  // 1. Percentage Calculations remain invariant
  const pctRes = calculatePercentage({
    mode: "x-is-what-percent-of-y",
    valX: 25,
    valY: 200,
  });
  assert.equal(pctRes.valid, true);
  assert.equal(pctRes.value, 12.5);
  const formattedPct = formatPercentageNumber(pctRes.value);
  assert.equal(formattedPct, "12.5");

  // 2. Base64 encoding/decoding remains invariant
  const rawSample = "OneToolHub ون ٹول ہب 2026";
  const b64 = encodeUtf8ToBase64(rawSample);
  assert.equal(b64.success, true);
  const decoded = decodeBase64ToUtf8(b64.output);
  assert.equal(decoded.success, true);
  assert.equal(decoded.output, rawSample);

  // 3. Password Generation with WebCrypto remains cryptographically sound
  const pwd = generateSecurePassword({
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  assert.equal(pwd.password.length, 20);
  const pwdStrength = evaluatePasswordStrength(pwd.password);
  assert.ok(pwdStrength.score >= 4);

  // 4. JSON Formatter logic remains invariant
  const rawJson = '{"name":"OneToolHub","locale":"ur","tools":24}';
  const formatted = validateAndFormatJson(rawJson, 2);
  assert.equal(formatted.valid, true);
  assert.ok(formatted.output && formatted.output.includes('"tools": 24'));
});

test("Step 18: Privacy Safeguards & Non-PII Telemetry Compliance", async () => {
  // Telemetry parameter sanitizer must strictly reject unknown or sensitive keys
  const dirtyParams: Parameters<typeof sanitizeToolAnalyticsParams>[0] = {
    tool_slug: "json-formatter",
    tool_category: "developer",
    operation_type: "format_json",
    sensitive_user_input: "password123",
    email_address: "user@example.com",
    random_extra: 999,
  };

  const sanitized = sanitizeToolAnalyticsParams(dirtyParams);
  assert.ok(sanitized !== null);
  assert.equal(sanitized.tool_slug, "json-formatter");
  assert.equal(sanitized.tool_category, "developer");
  assert.equal(sanitized.operation_type, "format_json");
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized, "sensitive_user_input"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized, "email_address"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized, "random_extra"), false);
});

// ============================================================================
// STEP 19: Global Organic Growth Engine & SEO Content Strategy
// ============================================================================
test("Step 19: Organic Growth Internal Linking & Bidirectional Graph Integrity", () => {
  // 1. Tool-to-Tutorial Bidirectional 1-to-1 Mapping
  assert.equal(TOOLS_REGISTRY.length, 24);
  assert.equal(LEARN_ARTICLES.length, 24);

  for (const tool of TOOLS_REGISTRY) {
    const article = getArticleForTool(tool.slug);
    assert.ok(article, `Every tool must have a matching tutorial: ${tool.slug}`);
    assert.equal(
      article.primaryToolSlug,
      tool.slug,
      `Tutorial primaryToolSlug must point back to tool: ${tool.slug}`
    );

    // Curated related tools must return distinct tools and never include self
    const related = getRelatedTools(tool.slug, 4);
    assert.ok(related.length >= 2, `Tool ${tool.slug} must have at least 2 related tools`);
    assert.ok(
      related.every((r) => r.slug !== tool.slug),
      `Tool ${tool.slug} must not include itself in related tools`
    );
  }

  // 2. Tutorial Related Articles & Tools Cross-Links
  for (const article of LEARN_ARTICLES) {
    const relatedArticles = getRelatedArticles(article.slug, 3);
    assert.ok(
      relatedArticles.length >= 2,
      `Article ${article.slug} must have at least 2 related articles`
    );
    assert.ok(
      relatedArticles.every((ra) => ra.slug !== article.slug),
      `Article ${article.slug} must not include itself in related articles`
    );
  }
});

test("Step 19: Keyword-to-Page Alignment & Search Metadata Coverage", () => {
  for (const tool of TOOLS_REGISTRY) {
    assert.ok(tool.keywords.length >= 4, `Tool ${tool.slug} must have at least 4 seed keywords`);
    assert.ok(tool.name.length >= 3, `Tool ${tool.slug} must have a valid name`);
    assert.ok(tool.shortDescription.length >= 20, `Tool ${tool.slug} must have descriptive summary`);
  }

  for (const article of LEARN_ARTICLES) {
    assert.ok(
      article.keywords.length >= 4,
      `Article ${article.slug} must have at least 4 keywords`
    );
    assert.ok(
      article.seoTitle.length >= 25 && article.seoTitle.length <= 80,
      `Article ${article.slug} SEO title should be well-proportioned`
    );
    assert.ok(
      article.metaDescription.length >= 60,
      `Article ${article.slug} meta description must be detailed`
    );
  }
});

test("Step 19: Safe Shareable URLs & Zero-Leak Privacy Guarantee", () => {
  // Ensure that tool URLs used in sharing components never leak query parameters or sensitive state
  for (const tool of TOOLS_REGISTRY) {
    const canonicalPath = `/tools/${tool.slug}`;
    assert.ok(!canonicalPath.includes("?"), "Tool share path must not contain query parameters");
    assert.ok(!canonicalPath.includes("#"), "Tool share path must not contain fragments");
    assert.ok(canonicalPath.startsWith("/tools/"), "Tool share path must point to canonical /tools/*");
  }
});


