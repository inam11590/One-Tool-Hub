import type { PDFFont, PDFPage } from "pdf-lib";

export type InvoiceTemplateId = "modern-indigo" | "classic-slate";
export type InvoiceDiscountType = "percentage" | "fixed";

export interface SupportedCurrency {
  code: string;
  symbol: string;
  pdfSymbol: string;
  name: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  { code: "USD", symbol: "$", pdfSymbol: "USD $", name: "US Dollar (USD)", decimals: 2 },
  { code: "EUR", symbol: "€", pdfSymbol: "EUR ", name: "Euro (EUR)", decimals: 2 },
  { code: "GBP", symbol: "£", pdfSymbol: "GBP £", name: "British Pound (GBP)", decimals: 2 },
  { code: "CAD", symbol: "CA$", pdfSymbol: "CAD $", name: "Canadian Dollar (CAD)", decimals: 2 },
  { code: "AUD", symbol: "A$", pdfSymbol: "AUD $", name: "Australian Dollar (AUD)", decimals: 2 },
  { code: "CHF", symbol: "CHF ", pdfSymbol: "CHF ", name: "Swiss Franc (CHF)", decimals: 2 },
  { code: "SGD", symbol: "S$", pdfSymbol: "SGD $", name: "Singapore Dollar (SGD)", decimals: 2 },
  { code: "AED", symbol: "AED ", pdfSymbol: "AED ", name: "UAE Dirham (AED)", decimals: 2 },
  { code: "INR", symbol: "₹", pdfSymbol: "INR ", name: "Indian Rupee (INR)", decimals: 2 },
  { code: "PKR", symbol: "Rs ", pdfSymbol: "PKR ", name: "Pakistani Rupee (PKR)", decimals: 2 },
  { code: "JPY", symbol: "¥", pdfSymbol: "JPY ¥", name: "Japanese Yen (JPY)", decimals: 0 },
] as const;

export interface InvoiceLineItemInput {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export interface InvoiceFormData {
  templateId: InvoiceTemplateId;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currencyCode: string;
  businessName: string;
  businessAddress: string;
  customerName: string;
  customerAddress: string;
  items: InvoiceLineItemInput[];
  discountType: InvoiceDiscountType;
  discountValue: string;
  taxRatePercent: string;
  notes: string;
  paymentInstructions: string;
}

export interface CalculatedLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unitPriceFormatted: string;
  lineTotalFormatted: string;
}

export interface InvoiceCalculationResult {
  valid: boolean;
  currency: SupportedCurrency;
  items: CalculatedLineItem[];
  subtotal: number;
  discountAmount: number;
  taxableSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  subtotalFormatted: string;
  discountFormatted: string;
  taxableSubtotalFormatted: string;
  taxFormatted: string;
  grandTotalFormatted: string;
  validationErrors: string[];
}

export const INVOICE_STORAGE_CONSENT_KEY = "onetoolhub_invoice_draft_consent_v1";
export const INVOICE_STORAGE_DRAFT_KEY = "onetoolhub_invoice_draft_data_v1";

/**
 * Converts a decimal number into integer cents (or minor units) safely
 * without floating-point accumulation drift.
 */
export function toMinorUnits(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor);
}

/**
 * Converts integer minor units back to a standard decimal number.
 */
export function fromMinorUnits(minorUnits: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return minorUnits / factor;
}

export const DEFAULT_CURRENCY: SupportedCurrency = {
  code: "USD",
  symbol: "$",
  pdfSymbol: "USD $",
  name: "US Dollar (USD)",
  decimals: 2,
};

export function getCurrencyByCode(code: string): SupportedCurrency {
  const found = SUPPORTED_CURRENCIES.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase()
  );
  return found ?? DEFAULT_CURRENCY;
}

export function formatCurrencyAmount(
  amount: number,
  currencyCode = "USD"
): string {
  const currency = getCurrencyByCode(currencyCode);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(safeAmount);
  } catch {
    return `${currency.symbol}${safeAmount.toFixed(currency.decimals)}`;
  }
}

export function formatPdfCurrencyAmount(
  amount: number,
  currencyCode = "USD"
): string {
  const currency = getCurrencyByCode(currencyCode);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formattedNumber = safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
  return `${currency.pdfSymbol}${formattedNumber}`;
}

export function createSampleInvoiceData(): InvoiceFormData {
  return {
    templateId: "modern-indigo",
    invoiceNumber: "INV-2025-001",
    issueDate: "2025-03-01",
    dueDate: "2025-03-15",
    currencyCode: "USD",
    businessName: "Northstar Digital Studio LLC",
    businessAddress:
      "450 Mission Street, Suite 400\nSan Francisco, CA 94105\nbilling@northstardigital.example",
    customerName: "Acme Global Ventures Inc.",
    customerAddress:
      "120 Bishopsgate, Level 14\nLondon EC2N 4AY, United Kingdom\naccounts@acmeglobal.example",
    items: [
      {
        id: "item-1",
        description: "Full-Stack Web Application Architecture & UI Design",
        quantity: "1",
        unitPrice: "2400.00",
      },
      {
        id: "item-2",
        description: "Frontend Component Library Implementation (Next.js + TypeScript)",
        quantity: "18.5",
        unitPrice: "120.00",
      },
      {
        id: "item-3",
        description: "Accessibility (WCAG 2.1 AA) & Performance QA Audit",
        quantity: "1",
        unitPrice: "650.00",
      },
    ],
    discountType: "percentage",
    discountValue: "5",
    taxRatePercent: "8.25",
    notes:
      "Thank you for your business! All deliverables include source code documentation and handoff guides.",
    paymentInstructions:
      "Bank Transfer (ACH / SWIFT): Northstar Digital Studio LLC\nRouting: 021000021 • Account: XXXX-8842\nPlease include invoice number INV-2025-001 as your payment reference.",
  };
}

export function createBlankInvoiceData(): InvoiceFormData {
  return {
    templateId: "modern-indigo",
    invoiceNumber: "INV-001",
    issueDate: "2025-03-01",
    dueDate: "2025-03-15",
    currencyCode: "USD",
    businessName: "",
    businessAddress: "",
    customerName: "",
    customerAddress: "",
    items: [
      {
        id: "item-1",
        description: "",
        quantity: "1",
        unitPrice: "0.00",
      },
    ],
    discountType: "percentage",
    discountValue: "0",
    taxRatePercent: "0",
    notes: "",
    paymentInstructions: "",
  };
}

function isValidIsoDate(dateStr: string): boolean {
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}

export function calculateInvoiceTotals(
  data: InvoiceFormData
): InvoiceCalculationResult {
  const currency = getCurrencyByCode(data.currencyCode);
  const decimals = currency.decimals;
  const validationErrors: string[] = [];

  if (!data.invoiceNumber.trim()) {
    validationErrors.push("Invoice number is required.");
  }
  if (!data.businessName.trim()) {
    validationErrors.push("Business / Sender name is required.");
  }
  if (!data.customerName.trim()) {
    validationErrors.push("Customer / Client name is required.");
  }

  const issueValid = isValidIsoDate(data.issueDate);
  const dueValid = isValidIsoDate(data.dueDate);

  if (!issueValid) {
    validationErrors.push("Please enter a valid invoice issue date (YYYY-MM-DD).");
  }
  if (!dueValid) {
    validationErrors.push("Please enter a valid payment due date (YYYY-MM-DD).");
  }
  if (issueValid && dueValid && data.dueDate.trim() < data.issueDate.trim()) {
    validationErrors.push(
      "Payment due date cannot be earlier than the invoice issue date."
    );
  }

  if (!data.items || data.items.length === 0) {
    validationErrors.push("At least one invoice line item is required.");
  }

  const calculatedItems: CalculatedLineItem[] = [];
  let subtotalMinor = 0;

  (data.items ?? []).forEach((item, index) => {
    const rowLabel = `Item #${index + 1}`;
    const desc = item.description.trim();
    if (!desc) {
      validationErrors.push(`${rowLabel}: Item description is required.`);
    }

    const qty = Number(item.quantity);
    if (! item.quantity.toString().trim() || !Number.isFinite(qty) || qty <= 0) {
      validationErrors.push(
        `${rowLabel}: Quantity must be a positive number greater than 0.`
      );
    }

    const price = Number(item.unitPrice);
    if (
      item.unitPrice.toString().trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      validationErrors.push(
        `${rowLabel}: Unit price must be zero or a positive number.`
      );
    }

    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 0;
    const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;

    // Safe decimal multiplication: convert unit price to minor units, multiply by quantity, and round to nearest minor unit
    const unitPriceMinor = toMinorUnits(safePrice, decimals);
    const lineTotalMinor = Math.round(
      (unitPriceMinor * safeQty) + Number.EPSILON
    );
    subtotalMinor += lineTotalMinor;

    const cleanUnitPrice = fromMinorUnits(unitPriceMinor, decimals);
    const cleanLineTotal = fromMinorUnits(lineTotalMinor, decimals);

    calculatedItems.push({
      id: item.id,
      description: desc || `Untitled Item ${index + 1}`,
      quantity: safeQty,
      unitPrice: cleanUnitPrice,
      lineTotal: cleanLineTotal,
      unitPriceFormatted: formatCurrencyAmount(cleanUnitPrice, currency.code),
      lineTotalFormatted: formatCurrencyAmount(cleanLineTotal, currency.code),
    });
  });

  // Discount validation & calculation
  const rawDiscount = data.discountValue.trim() === "" ? 0 : Number(data.discountValue);
  let discountMinor = 0;

  if (!Number.isFinite(rawDiscount) || rawDiscount < 0) {
    validationErrors.push("Discount cannot be negative or invalid.");
  } else if (data.discountType === "percentage") {
    if (rawDiscount > 100) {
      validationErrors.push("Percentage discount cannot exceed 100%.");
    } else {
      discountMinor = Math.round(
        (subtotalMinor * rawDiscount) / 100 + Number.EPSILON
      );
    }
  } else {
    const fixedMinor = toMinorUnits(rawDiscount, decimals);
    if (fixedMinor > subtotalMinor) {
      validationErrors.push("Fixed discount cannot exceed the invoice subtotal.");
      discountMinor = subtotalMinor;
    } else {
      discountMinor = fixedMinor;
    }
  }

  const taxableSubtotalMinor = Math.max(0, subtotalMinor - discountMinor);

  // Tax validation & calculation
  const rawTax = data.taxRatePercent.trim() === "" ? 0 : Number(data.taxRatePercent);
  let taxMinor = 0;

  if (!Number.isFinite(rawTax) || rawTax < 0 || rawTax > 100) {
    validationErrors.push("Tax percentage must be between 0% and 100%.");
  } else {
    taxMinor = Math.round(
      (taxableSubtotalMinor * rawTax) / 100 + Number.EPSILON
    );
  }

  const grandTotalMinor = taxableSubtotalMinor + taxMinor;

  const subtotal = fromMinorUnits(subtotalMinor, decimals);
  const discountAmount = fromMinorUnits(discountMinor, decimals);
  const taxableSubtotal = fromMinorUnits(taxableSubtotalMinor, decimals);
  const taxAmount = fromMinorUnits(taxMinor, decimals);
  const grandTotal = fromMinorUnits(grandTotalMinor, decimals);

  return {
    valid: validationErrors.length === 0,
    currency,
    items: calculatedItems,
    subtotal,
    discountAmount,
    taxableSubtotal,
    taxAmount,
    grandTotal,
    subtotalFormatted: formatCurrencyAmount(subtotal, currency.code),
    discountFormatted: formatCurrencyAmount(discountAmount, currency.code),
    taxableSubtotalFormatted: formatCurrencyAmount(taxableSubtotal, currency.code),
    taxFormatted: formatCurrencyAmount(taxAmount, currency.code),
    grandTotalFormatted: formatCurrencyAmount(grandTotal, currency.code),
    validationErrors,
  };
}

/**
 * Sanitizes text for StandardFonts (WinAnsiEncoding) in pdf-lib so that
 * bullets, smart quotes, or non-Latin characters do not crash PDF generation.
 */
function sanitizePdfText(input: string): string {
  return input
    .replace(/\u2022/g, "-")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

function wrapTextLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const rawPara of paragraphs) {
    const para = sanitizePdfText(rawPara).trim();
    if (!para) {
      lines.push("");
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      // Handle single extremely long unbroken word
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        let chunk = "";
        for (const char of word) {
          const candidateChunk = chunk + char;
          if (font.widthOfTextAtSize(candidateChunk, fontSize) > maxWidth && chunk) {
            lines.push(chunk);
            chunk = char;
          } else {
            chunk = candidateChunk;
          }
        }
        currentLine = chunk;
        continue;
      }

      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [""];
}

/**
 * Generates a readable, selectable-text multi-page PDF document for the invoice.
 */
export async function generateInvoicePdfBytes(
  data: InvoiceFormData
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const calculation = calculateInvoiceTotals(data);
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Invoice ${sanitizePdfText(data.invoiceNumber || "Draft")}`);
  pdfDoc.setCreator("OneToolHub Invoice Generator");

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = 68;

  const isIndigo = data.templateId === "modern-indigo";
  const primaryColor = isIndigo ? rgb(0.24, 0.25, 0.85) : rgb(0.12, 0.16, 0.23);
  const lightBgColor = isIndigo ? rgb(0.95, 0.96, 1.0) : rgb(0.95, 0.96, 0.97);
  const darkText = rgb(0.08, 0.1, 0.15);
  const mutedText = rgb(0.38, 0.43, 0.5);
  const borderGray = rgb(0.85, 0.87, 0.91);

  const pages: PDFPage[] = [];
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  pages.push(currentPage);
  let y = pageHeight - margin;

  const addNewPage = () => {
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pages.push(currentPage);
    y = pageHeight - margin;
  };

  // Top Header Banner
  if (isIndigo) {
    currentPage.drawRectangle({
      x: 0,
      y: pageHeight - 10,
      width: pageWidth,
      height: 10,
      color: primaryColor,
    });
  }

  currentPage.drawText("INVOICE", {
    x: margin,
    y: y - 22,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });

  const invNumText = `# ${sanitizePdfText(data.invoiceNumber.trim() || "DRAFT")}`;
  const invNumWidth = fontBold.widthOfTextAtSize(invNumText, 12);
  currentPage.drawText(invNumText, {
    x: pageWidth - margin - invNumWidth,
    y: y - 16,
    size: 12,
    font: fontBold,
    color: darkText,
  });

  const datesText = `Issued: ${sanitizePdfText(data.issueDate)}   |   Due: ${sanitizePdfText(data.dueDate)}`;
  const datesWidth = fontRegular.widthOfTextAtSize(datesText, 9.5);
  currentPage.drawText(datesText, {
    x: pageWidth - margin - datesWidth,
    y: y - 32,
    size: 9.5,
    font: fontRegular,
    color: mutedText,
  });

  y -= 54;

  // Divider
  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: borderGray,
  });

  y -= 22;

  // From & Bill To Columns
  const colWidth = (contentWidth - 24) / 2;
  const rightColX = margin + colWidth + 24;

  currentPage.drawText("FROM (SENDER)", {
    x: margin,
    y,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  currentPage.drawText("BILL TO (CLIENT)", {
    x: rightColX,
    y,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  y -= 15;

  const senderLines = [
    ...wrapTextLines(data.businessName || "Sender Name", fontBold, 10.5, colWidth),
    ...wrapTextLines(data.businessAddress || "", fontRegular, 9.5, colWidth),
  ];
  const clientLines = [
    ...wrapTextLines(data.customerName || "Client Name", fontBold, 10.5, colWidth),
    ...wrapTextLines(data.customerAddress || "", fontRegular, 9.5, colWidth),
  ];

  const businessNameLineCount = wrapTextLines(
    data.businessName || "Sender Name",
    fontBold,
    10.5,
    colWidth
  ).length;
  const customerNameLineCount = wrapTextLines(
    data.customerName || "Client Name",
    fontBold,
    10.5,
    colWidth
  ).length;

  const maxPartyLines = Math.max(senderLines.length, clientLines.length);

  for (let i = 0; i < maxPartyLines; i++) {
    if (y < bottomLimit) {
      addNewPage();
    }
    const senderLine = senderLines[i];
    if (senderLine) {
      const isName = i < businessNameLineCount;
      currentPage.drawText(senderLine, {
        x: margin,
        y,
        size: isName ? 10.5 : 9.5,
        font: isName ? fontBold : fontRegular,
        color: isName ? darkText : mutedText,
      });
    }
    const clientLine = clientLines[i];
    if (clientLine) {
      const isName = i < customerNameLineCount;
      currentPage.drawText(clientLine, {
        x: rightColX,
        y,
        size: isName ? 10.5 : 9.5,
        font: isName ? fontBold : fontRegular,
        color: isName ? darkText : mutedText,
      });
    }
    y -= 14;
  }

  y -= 16;

  // Line Items Table Header
  const descColWidth = contentWidth * 0.52;
  const qtyColX = margin + descColWidth + 8;
  const unitColX = margin + contentWidth * 0.68;
  const drawTableHeader = () => {
    currentPage.drawRectangle({
      x: margin,
      y: y - 6,
      width: contentWidth,
      height: 22,
      color: lightBgColor,
    });

    currentPage.drawText("DESCRIPTION", {
      x: margin + 8,
      y: y + 1,
      size: 8.5,
      font: fontBold,
      color: primaryColor,
    });
    currentPage.drawText("QTY", {
      x: qtyColX,
      y: y + 1,
      size: 8.5,
      font: fontBold,
      color: primaryColor,
    });
    currentPage.drawText("UNIT PRICE", {
      x: unitColX,
      y: y + 1,
      size: 8.5,
      font: fontBold,
      color: primaryColor,
    });
    const amountHeader = "AMOUNT";
    const amountHeaderW = fontBold.widthOfTextAtSize(amountHeader, 8.5);
    currentPage.drawText(amountHeader, {
      x: pageWidth - margin - 8 - amountHeaderW,
      y: y + 1,
      size: 8.5,
      font: fontBold,
      color: primaryColor,
    });

    y -= 22;
  };

  drawTableHeader();

  // Table Rows (supports multi-page overflow automatically)
  for (const item of calculation.items) {
    const wrappedDesc = wrapTextLines(
      item.description,
      fontRegular,
      9.5,
      descColWidth - 12
    );
    const rowHeight = Math.max(1, wrappedDesc.length) * 13 + 10;

    if (y - rowHeight < bottomLimit) {
      addNewPage();
      drawTableHeader();
    }

    wrappedDesc.forEach((line, lineIdx) => {
      currentPage.drawText(line, {
        x: margin + 8,
        y: y - 4 - lineIdx * 13,
        size: 9.5,
        font: fontRegular,
        color: darkText,
      });
    });

    const qtyStr = sanitizePdfText(String(item.quantity));
    currentPage.drawText(qtyStr, {
      x: qtyColX,
      y: y - 4,
      size: 9.5,
      font: fontRegular,
      color: darkText,
    });

    const unitStr = formatPdfCurrencyAmount(item.unitPrice, calculation.currency.code);
    currentPage.drawText(unitStr, {
      x: unitColX,
      y: y - 4,
      size: 9.5,
      font: fontRegular,
      color: darkText,
    });

    const totalStr = formatPdfCurrencyAmount(item.lineTotal, calculation.currency.code);
    const totalW = fontBold.widthOfTextAtSize(totalStr, 9.5);
    currentPage.drawText(totalStr, {
      x: pageWidth - margin - 8 - totalW,
      y: y - 4,
      size: 9.5,
      font: fontBold,
      color: darkText,
    });

    y -= rowHeight;

    currentPage.drawLine({
      start: { x: margin, y: y + 4 },
      end: { x: pageWidth - margin, y: y + 4 },
      thickness: 0.5,
      color: borderGray,
    });
  }

  y -= 14;

  // Totals Summary Block
  if (y - 110 < bottomLimit) {
    addNewPage();
  }

  const summaryLabelX = margin + contentWidth * 0.55;
  const drawSummaryRow = (label: string, valueText: string, isGrand = false) => {
    const fontToUse = isGrand ? fontBold : fontRegular;
    const sizeToUse = isGrand ? 11.5 : 9.5;
    const colorToUse = isGrand ? primaryColor : darkText;

    if (isGrand) {
      currentPage.drawRectangle({
        x: summaryLabelX - 8,
        y: y - 6,
        width: pageWidth - margin - (summaryLabelX - 8),
        height: 24,
        color: lightBgColor,
      });
    }

    currentPage.drawText(label, {
      x: summaryLabelX,
      y,
      size: sizeToUse,
      font: fontToUse,
      color: colorToUse,
    });

    const valW = fontToUse.widthOfTextAtSize(valueText, sizeToUse);
    currentPage.drawText(valueText, {
      x: pageWidth - margin - 8 - valW,
      y,
      size: sizeToUse,
      font: fontToUse,
      color: colorToUse,
    });

    y -= isGrand ? 28 : 16;
  };

  drawSummaryRow(
    "Subtotal",
    formatPdfCurrencyAmount(calculation.subtotal, calculation.currency.code)
  );

  if (calculation.discountAmount > 0) {
    const discLabel =
      data.discountType === "percentage"
        ? `Discount (${sanitizePdfText(data.discountValue)}%)`
        : "Discount";
    drawSummaryRow(
      discLabel,
      `-${formatPdfCurrencyAmount(calculation.discountAmount, calculation.currency.code)}`
    );
  }

  const taxNum = Number(data.taxRatePercent) || 0;
  if (taxNum > 0 || calculation.taxAmount > 0) {
    drawSummaryRow(
      `Tax (${sanitizePdfText(String(taxNum))}%)`,
      formatPdfCurrencyAmount(calculation.taxAmount, calculation.currency.code)
    );
  }

  y -= 4;
  drawSummaryRow(
    `Total (${calculation.currency.code})`,
    formatPdfCurrencyAmount(calculation.grandTotal, calculation.currency.code),
    true
  );

  // Notes & Payment Instructions
  const drawSectionBlock = (heading: string, body: string) => {
    const cleanBody = body.trim();
    if (!cleanBody) return;

    const lines = wrapTextLines(cleanBody, fontRegular, 9, contentWidth);
    const neededHeight = 20 + lines.length * 12;

    if (y - neededHeight < bottomLimit) {
      addNewPage();
    }

    currentPage.drawText(heading, {
      x: margin,
      y,
      size: 8.5,
      font: fontBold,
      color: primaryColor,
    });
    y -= 13;

    for (const line of lines) {
      if (y < bottomLimit) {
        addNewPage();
      }
      currentPage.drawText(line, {
        x: margin,
        y,
        size: 9,
        font: fontRegular,
        color: mutedText,
      });
      y -= 12;
    }

    y -= 10;
  };

  drawSectionBlock("PAYMENT INSTRUCTIONS", data.paymentInstructions);
  drawSectionBlock("NOTES & TERMS", data.notes);

  // Add footer and page numbers across all pages
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    const footerDisclaimer =
      "Generated locally with OneToolHub Invoice Generator. Users are responsible for local tax & invoicing compliance.";
    p.drawText(footerDisclaimer, {
      x: margin,
      y: 28,
      size: 7.5,
      font: fontRegular,
      color: mutedText,
    });

    const pageLabel = `Page ${idx + 1} of ${totalPages}`;
    const pageLabelW = fontRegular.widthOfTextAtSize(pageLabel, 8);
    p.drawText(pageLabel, {
      x: pageWidth - margin - pageLabelW,
      y: 28,
      size: 8,
      font: fontRegular,
      color: mutedText,
    });
  });

  return pdfDoc.save();
}
