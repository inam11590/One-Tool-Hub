/**
 * Client-Side PDF Metadata Viewer & Editor Core Logic
 * 
 * Features:
 * - Reads standard PDF Info Dictionary metadata (Title, Author, Subject, Keywords, Creator, Producer, Dates).
 * - Allows in-place editing of Title, Author, Subject, Keywords, Creator, Producer.
 * - Supports 1-click "Clear All Metadata" action.
 * - Saves updated document with pdf-lib without modifying content streams or visual layouts.
 * - Includes clear privacy notices regarding info dictionary scope vs forensic sanitization.
 * - 100% in-browser processing with zero server uploads.
 */

import { PDFDocument } from "pdf-lib";
import { hasPdfMagicHeader } from "./pdf-merge-split.ts";

export const MAX_METADATA_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export interface PdfMetadataFields {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string; // ISO or formatted string
  modificationDate: string; // ISO or formatted string
}

export interface PdfMetadataInspectionResult {
  valid: boolean;
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  metadata: PdfMetadataFields;
  isEncrypted?: boolean;
  error?: string;
}

/**
 * Formats a Date object or returns empty string.
 */
function formatDateSafe(date: Date | undefined): string {
  if (!date || isNaN(date.getTime())) return "";
  try {
    return date.toISOString();
  } catch {
    return "";
  }
}

/**
 * Inspects a PDF and reads its Info dictionary metadata.
 */
export async function readPdfMetadata(
  bytes: Uint8Array,
  fileName: string
): Promise<PdfMetadataInspectionResult> {
  if (bytes.length === 0) {
    return {
      valid: false,
      fileName,
      fileSizeBytes: 0,
      pageCount: 0,
      metadata: getEmptyMetadata(),
      error: `"${fileName}" is empty (0 bytes).`,
    };
  }
  if (bytes.length > MAX_METADATA_FILE_SIZE) {
    return {
      valid: false,
      fileName,
      fileSizeBytes: bytes.length,
      pageCount: 0,
      metadata: getEmptyMetadata(),
      error: `"${fileName}" exceeds the 50 MB limit.`,
    };
  }
  if (!hasPdfMagicHeader(bytes)) {
    return {
      valid: false,
      fileName,
      fileSizeBytes: bytes.length,
      pageCount: 0,
      metadata: getEmptyMetadata(),
      error: `"${fileName}" is not a valid PDF document.`,
    };
  }

  try {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: false });
    const pageCount = pdfDoc.getPageCount();

    const rawKeywords = pdfDoc.getKeywords();
    const keywordsStr = typeof rawKeywords === "string" ? rawKeywords : "";

    const metadata: PdfMetadataFields = {
      title: pdfDoc.getTitle() || "",
      author: pdfDoc.getAuthor() || "",
      subject: pdfDoc.getSubject() || "",
      keywords: keywordsStr,
      creator: pdfDoc.getCreator() || "",
      producer: pdfDoc.getProducer() || "",
      creationDate: formatDateSafe(pdfDoc.getCreationDate()),
      modificationDate: formatDateSafe(pdfDoc.getModificationDate()),
    };

    return {
      valid: true,
      fileName,
      fileSizeBytes: bytes.length,
      pageCount,
      metadata,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isEncrypted = msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password");
    return {
      valid: false,
      fileName,
      fileSizeBytes: bytes.length,
      pageCount: 0,
      metadata: getEmptyMetadata(),
      isEncrypted,
      error: isEncrypted
        ? `"${fileName}" is password-protected or encrypted. Please decrypt it first to view or edit metadata.`
        : `Could not parse "${fileName}": ${msg}`,
    };
  }
}

/**
 * Returns blank metadata fields.
 */
export function getEmptyMetadata(): PdfMetadataFields {
  return {
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
    creationDate: "",
    modificationDate: "",
  };
}

/**
 * Updates PDF metadata in the Info dictionary and returns the updated PDF bytes.
 */
export async function updatePdfMetadata(
  originalBytes: Uint8Array,
  updatedFields: Partial<PdfMetadataFields>,
  outputFileName = "updated-metadata.pdf"
): Promise<{ bytes: Uint8Array; fileName: string; sizeBytes: number }> {
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: false });

  if (updatedFields.title !== undefined) {
    pdfDoc.setTitle(updatedFields.title.trim());
  }
  if (updatedFields.author !== undefined) {
    pdfDoc.setAuthor(updatedFields.author.trim());
  }
  if (updatedFields.subject !== undefined) {
    pdfDoc.setSubject(updatedFields.subject.trim());
  }
  if (updatedFields.keywords !== undefined) {
    const kwArray = updatedFields.keywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    pdfDoc.setKeywords(kwArray);
  }
  if (updatedFields.creator !== undefined) {
    pdfDoc.setCreator(updatedFields.creator.trim());
  }
  if (updatedFields.producer !== undefined) {
    pdfDoc.setProducer(updatedFields.producer.trim());
  }

  // Update modification date to current timestamp
  pdfDoc.setModificationDate(new Date());

  const savedBytes = await pdfDoc.save();
  const safeName = outputFileName.trim().toLowerCase().endsWith(".pdf")
    ? outputFileName.trim()
    : `${outputFileName.trim() || "document"}.pdf`;

  return {
    bytes: savedBytes,
    fileName: safeName,
    sizeBytes: savedBytes.byteLength,
  };
}

/**
 * Wipes all supported standard metadata fields from the PDF document.
 */
export async function clearAllPdfMetadata(
  originalBytes: Uint8Array,
  outputFileName = "cleared-metadata.pdf"
): Promise<{ bytes: Uint8Array; fileName: string; sizeBytes: number }> {
  return updatePdfMetadata(
    originalBytes,
    {
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
    },
    outputFileName
  );
}
