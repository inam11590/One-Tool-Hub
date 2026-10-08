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
