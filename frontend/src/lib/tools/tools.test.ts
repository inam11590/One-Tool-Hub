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
  buildPageMetadata,
  buildToolPageJsonLd,
  buildWebsiteJsonLd,
  getGoogleSiteVerificationToken,
  getSiteUrlConfig,
  isPreviewDeployment,
} from "../seo.ts";
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



