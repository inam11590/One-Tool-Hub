"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Info,
  LayoutTemplate,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  calculateInvoiceTotals,
  createBlankInvoiceData,
  createSampleInvoiceData,
  generateInvoicePdfBytes,
  INVOICE_STORAGE_CONSENT_KEY,
  INVOICE_STORAGE_DRAFT_KEY,
  SUPPORTED_CURRENCIES,
  type InvoiceDiscountType,
  type InvoiceFormData,
  type InvoiceTemplateId,
} from "@/lib/tools/invoice-generator";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "invoice-generator";
const TOOL_CATEGORY = "freelancer";

export function InvoiceGeneratorTool() {
  const baseId = useId();
  const [formData, setFormData] = useState<InvoiceFormData>(() =>
    createSampleInvoiceData()
  );
  const [itemCounter, setItemCounter] = useState(10);
  const [localDraftConsent, setLocalDraftConsent] = useState(false);
  const [draftStatusMsg, setDraftStatusMsg] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Restore draft only if the user previously opted in
  useEffect(() => {
    try {
      const savedConsent = window.localStorage.getItem(
        INVOICE_STORAGE_CONSENT_KEY
      );
      if (savedConsent === "true") {
        setLocalDraftConsent(true);
        const savedDraft = window.localStorage.getItem(
          INVOICE_STORAGE_DRAFT_KEY
        );
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft) as Partial<InvoiceFormData>;
          if (parsed && typeof parsed.invoiceNumber === "string" && Array.isArray(parsed.items)) {
            setFormData((prev) => ({
              ...prev,
              ...parsed,
            }));
            setDraftStatusMsg("Restored your locally saved draft from this browser.");
          }
        }
      }
    } catch {
      // Ignore storage access errors in restricted browsing modes
    }
  }, []);

  // Automatically persist when consent is active
  useEffect(() => {
    if (!localDraftConsent) return;
    try {
      window.localStorage.setItem(
        INVOICE_STORAGE_DRAFT_KEY,
        JSON.stringify(formData)
      );
    } catch {
      // Ignore quota errors
    }
  }, [formData, localDraftConsent]);

  const calculation = useMemo(
    () => calculateInvoiceTotals(formData),
    [formData]
  );

  const handleConsentToggle = (checked: boolean) => {
    setLocalDraftConsent(checked);
    try {
      if (checked) {
        window.localStorage.setItem(INVOICE_STORAGE_CONSENT_KEY, "true");
        window.localStorage.setItem(
          INVOICE_STORAGE_DRAFT_KEY,
          JSON.stringify(formData)
        );
        setDraftStatusMsg(
          "Local draft saving enabled. Your invoice is stored only in this browser."
        );
      } else {
        window.localStorage.removeItem(INVOICE_STORAGE_CONSENT_KEY);
        window.localStorage.removeItem(INVOICE_STORAGE_DRAFT_KEY);
        setDraftStatusMsg(
          "Local draft saving disabled and any saved browser draft was cleared."
        );
      }
    } catch {
      setDraftStatusMsg("Browser localStorage is unavailable in this session.");
    }
  };

  const updateField = <K extends keyof InvoiceFormData>(
    key: K,
    value: InvoiceFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddItem = () => {
    const newId = `item-${itemCounter}`;
    setItemCounter((c) => c + 1);
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newId,
          description: "",
          quantity: "1",
          unitPrice: "0.00",
        },
      ],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items:
        prev.items.length > 1
          ? prev.items.filter((item) => item.id !== id)
          : prev.items,
    }));
  };

  const handleItemChange = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const hasCustomData = Boolean(
    formData.businessName.trim() ||
      formData.customerName.trim() ||
      formData.invoiceNumber.trim() ||
      formData.items.some((item) => item.description.trim() !== "")
  );

  const handleLoadSample = () => {
    if (
      hasCustomData &&
      typeof window !== "undefined" &&
      !window.confirm("Replace your current invoice data with sample data?")
    ) {
      return;
    }
    setFormData(createSampleInvoiceData());
    setPdfError(null);
  };

  const handleResetBlank = () => {
    if (
      hasCustomData &&
      typeof window !== "undefined" &&
      !window.confirm("Clear all invoice fields? This action cannot be undone.")
    ) {
      return;
    }
    setFormData(createBlankInvoiceData());
    setPdfError(null);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset_blank",
    });
  };

  const handleDownloadPdf = async () => {
    setPdfError(null);
    if (!calculation.valid) {
      const errMsg =
        "Please fix the validation errors listed above before downloading your PDF invoice.";
      setPdfError(errMsg);
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "generate_invoice_pdf",
        errMsg,
        "invalid_input"
      );
      return;
    }

    setIsGeneratingPdf(true);
    let objectUrl: string | null = null;
    try {
      const pdfBytes = await generateInvoicePdfBytes(formData);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeNum =
        formData.invoiceNumber
          .trim()
          .replace(/[^a-zA-Z0-9_-]+/g, "-") || "draft";
      link.href = objectUrl;
      link.download = `invoice-${safeNum}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "generate_invoice_pdf",
      });
      trackToolEvent("tool_download", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "download_invoice_pdf",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPdfError(`Could not generate PDF: ${msg}`);
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "generate_invoice_pdf",
        msg,
        "processing_error"
      );
    } finally {
      if (objectUrl) {
        const urlToRevoke = objectUrl;
        setTimeout(() => URL.revokeObjectURL(urlToRevoke), 1000);
      }
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintInvoice = () => {
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "print_invoice",
    });
    window.print();
  };

  const isModernTemplate = formData.templateId === "modern-indigo";

  return (
    <div className="space-y-8">
      {/* Top Toolbar: Templates, Actions & Consent Toggle */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs print:hidden sm:p-5 lg:flex-row lg:items-center">
        {/* Template Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <LayoutTemplate className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            <span>Template:</span>
          </div>
          <div
            role="group"
            aria-label="Select Invoice Design Template"
            className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1"
          >
            {(
              [
                { id: "modern-indigo", label: "Modern Indigo" },
                { id: "classic-slate", label: "Classic Executive" },
              ] as const
            ).map((tpl) => {
              const active = formData.templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    updateField("templateId", tpl.id as InvoiceTemplateId)
                  }
                  aria-pressed={active}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    active
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            onClick={handleResetBlank}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Form</span>
          </button>
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !calculation.valid}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* Explicit Consent Bar for Optional Local Draft Saving */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/50 px-4 py-3.5 text-xs text-slate-700 print:hidden sm:flex-row sm:items-center sm:px-5">
        <label
          htmlFor={`${baseId}-draft-consent`}
          className="flex cursor-pointer items-start gap-2.5 sm:items-center"
        >
          <input
            id={`${baseId}-draft-consent`}
            type="checkbox"
            checked={localDraftConsent}
            onChange={(e) => handleConsentToggle(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 sm:mt-0"
          />
          <span>
            <strong className="font-bold text-slate-900">
              Optional Local Draft Saving (User Consent):
            </strong>{" "}
            Save my invoice draft in this browser&apos;s{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-indigo-700">
              localStorage
            </code>
            . Unchecking immediately erases any saved draft.
          </span>
        </label>

        {draftStatusMsg ? (
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-800"
          >
            <Save className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden="true" />
            <span>{draftStatusMsg}</span>
          </span>
        ) : null}
      </div>

      {/* Validation Errors or PDF Generation Alert */}
      {(!calculation.valid || pdfError) ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-950 print:hidden"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">
              Please resolve the following before exporting your invoice:
            </p>
            {pdfError ? (
              <p className="text-xs font-medium text-rose-800 sm:text-sm">
                {pdfError}
              </p>
            ) : null}
            {calculation.validationErrors.length > 0 ? (
              <ul className="list-inside list-disc space-y-1 text-xs text-rose-800 sm:text-sm">
                {calculation.validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Main Two-Column Workspace: Left Form Editor, Right Live Printable Preview */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Form Editor Column (Hidden when printing) */}
        <div className="space-y-6 print:hidden xl:col-span-6">
          {/* 1. Invoice Metadata & Currency */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              1. Invoice Details &amp; Currency
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${baseId}-invoice-number`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Invoice Number <span className="text-rose-600">*</span>
                </label>
                <input
                  id={`${baseId}-invoice-number`}
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => updateField("invoiceNumber", e.target.value)}
                  placeholder="e.g., INV-2025-001"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-currency`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  ISO Currency
                </label>
                <select
                  id={`${baseId}-currency`}
                  value={formData.currencyCode}
                  onChange={(e) => updateField("currencyCode", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                >
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) — {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-issue-date`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Invoice Issue Date <span className="text-rose-600">*</span>
                </label>
                <input
                  id={`${baseId}-issue-date`}
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => updateField("issueDate", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-due-date`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Payment Due Date <span className="text-rose-600">*</span>
                </label>
                <input
                  id={`${baseId}-due-date`}
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Sender & Client Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              2. Business &amp; Customer Information
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Business / Sender */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor={`${baseId}-business-name`}
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Your Business / Freelancer Name{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={`${baseId}-business-name`}
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      updateField("businessName", e.target.value)
                    }
                    placeholder="Your Company or Full Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${baseId}-business-address`}
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Business Address &amp; Contact
                  </label>
                  <textarea
                    id={`${baseId}-business-address`}
                    rows={3}
                    value={formData.businessAddress}
                    onChange={(e) =>
                      updateField("businessAddress", e.target.value)
                    }
                    placeholder="Street address, City, Country, Email, Tax/VAT ID"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                  />
                </div>
              </div>

              {/* Customer / Client */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor={`${baseId}-customer-name`}
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Customer / Client Name{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={`${baseId}-customer-name`}
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      updateField("customerName", e.target.value)
                    }
                    placeholder="Client Company or Contact Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${baseId}-customer-address`}
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Customer Billing Address
                  </label>
                  <textarea
                    id={`${baseId}-customer-address`}
                    rows={3}
                    value={formData.customerAddress}
                    onChange={(e) =>
                      updateField("customerAddress", e.target.value)
                    }
                    placeholder="Client billing address, City, Country, Email"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Dynamic Invoice Line Items */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">
                3. Invoice Line Items ({formData.items.length})
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 transition-colors hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Line Item</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {formData.items.map((item, idx) => {
                const calcItem = calculation.items[idx];
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Line Item #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-700">
                          Line Total: {calcItem?.lineTotalFormatted ?? "$0.00"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={formData.items.length <= 1}
                          aria-label={`Remove line item ${idx + 1}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-12">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor={`${baseId}-item-desc-${item.id}`}
                          className="mb-1 block text-xs font-semibold text-slate-600"
                        >
                          Description <span className="text-rose-600">*</span>
                        </label>
                        <input
                          id={`${baseId}-item-desc-${item.id}`}
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Service or deliverable description..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor={`${baseId}-item-qty-${item.id}`}
                          className="mb-1 block text-xs font-semibold text-slate-600"
                        >
                          Quantity
                        </label>
                        <input
                          id={`${baseId}-item-qty-${item.id}`}
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor={`${baseId}-item-price-${item.id}`}
                          className="mb-1 block text-xs font-semibold text-slate-600"
                        >
                          Unit Price ({calculation.currency.code})
                        </label>
                        <input
                          id={`${baseId}-item-price-${item.id}`}
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Discounts, Tax & Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              4. Tax, Discounts &amp; Payment Terms
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor={`${baseId}-discount-type`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Discount Mode
                </label>
                <select
                  id={`${baseId}-discount-type`}
                  value={formData.discountType}
                  onChange={(e) =>
                    updateField(
                      "discountType",
                      e.target.value as InvoiceDiscountType
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">
                    Fixed Amount ({calculation.currency.code})
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-discount-value`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Discount Value
                </label>
                <input
                  id={`${baseId}-discount-value`}
                  type="number"
                  min="0"
                  step="any"
                  value={formData.discountValue}
                  onChange={(e) => updateField("discountValue", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-tax-rate`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Tax Rate (%)
                </label>
                <input
                  id={`${baseId}-tax-rate`}
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={formData.taxRatePercent}
                  onChange={(e) =>
                    updateField("taxRatePercent", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor={`${baseId}-payment-instructions`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Payment Instructions (Optional)
                </label>
                <textarea
                  id={`${baseId}-payment-instructions`}
                  rows={2}
                  value={formData.paymentInstructions}
                  onChange={(e) =>
                    updateField("paymentInstructions", e.target.value)
                  }
                  placeholder="Bank transfer details, IBAN/SWIFT, ACH routing, or payment terms..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-notes`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Notes &amp; Terms (Optional)
                </label>
                <textarea
                  id={`${baseId}-notes`}
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Thank you message, late fee policy, or project warranty notes..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Legal & Tax Compliance Disclaimer */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <div>
              <strong className="font-bold">
                Tax &amp; Invoicing Responsibility Disclaimer:
              </strong>{" "}
              OneToolHub does not automatically send invoices, collect payments,
              or verify tax compliance. Users are solely responsible for
              ensuring their invoices meet local tax, VAT/GST, and legal record-keeping
              requirements.
            </div>
          </div>
        </div>

        {/* Live Invoice Preview Column */}
        <div className="xl:col-span-6">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between px-1 print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FileText className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span>
                  Live Invoice Preview (
                  {isModernTemplate ? "Modern Indigo" : "Classic Executive"})
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Safe Decimal Math</span>
              </span>
            </div>

            {/* Printable Invoice Sheet */}
            <div
              id="invoice-printable-preview"
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none ${
                isModernTemplate
                  ? "border-indigo-200/90"
                  : "border-slate-300"
              }`}
            >
              {/* Top Accent Bar for Modern Indigo */}
              {isModernTemplate ? (
                <div className="h-2.5 w-full bg-gradient-to-r from-indigo-600 to-blue-600" />
              ) : (
                <div className="h-2 w-full bg-slate-900" />
              )}

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
                  <div>
                    <span
                      className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${
                        isModernTemplate ? "text-indigo-600" : "text-slate-900"
                      }`}
                    >
                      INVOICE
                    </span>
                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                      #{formData.invoiceNumber.trim() || "DRAFT"}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 sm:text-right">
                    <p>
                      <span className="font-semibold text-slate-800">
                        Issue Date:
                      </span>{" "}
                      {formData.issueDate || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">
                        Due Date:
                      </span>{" "}
                      {formData.dueDate || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">
                        Currency:
                      </span>{" "}
                      {calculation.currency.code} ({calculation.currency.symbol})
                    </p>
                  </div>
                </div>

                {/* Sender & Client Grid */}
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="min-w-0">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isModernTemplate ? "text-indigo-600" : "text-slate-500"
                      }`}
                    >
                      From (Sender)
                    </p>
                    <p className="mt-1.5 break-words text-sm font-bold text-slate-900">
                      {formData.businessName.trim() || "Your Business Name"}
                    </p>
                    {formData.businessAddress.trim() ? (
                      <p className="mt-1 whitespace-pre-line break-words text-xs leading-relaxed text-slate-600">
                        {formData.businessAddress}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isModernTemplate ? "text-indigo-600" : "text-slate-500"
                      }`}
                    >
                      Bill To (Customer)
                    </p>
                    <p className="mt-1.5 break-words text-sm font-bold text-slate-900">
                      {formData.customerName.trim() || "Customer Name"}
                    </p>
                    {formData.customerAddress.trim() ? (
                      <p className="mt-1 whitespace-pre-line break-words text-xs leading-relaxed text-slate-600">
                        {formData.customerAddress}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr
                        className={`border-y text-[11px] font-bold uppercase tracking-wider ${
                          isModernTemplate
                            ? "border-indigo-100 bg-indigo-50/70 text-indigo-900"
                            : "border-slate-300 bg-slate-100 text-slate-800"
                        }`}
                      >
                        <th className="px-3 py-2.5">Description</th>
                        <th className="px-3 py-2.5 text-right">Qty</th>
                        <th className="px-3 py-2.5 text-right">Unit Price</th>
                        <th className="px-3 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {calculation.items.map((item) => (
                        <tr key={item.id}>
                          <td className="max-w-[220px] break-words px-3 py-3 font-medium text-slate-900">
                            {item.description}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right text-slate-700">
                            {item.unitPriceFormatted}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-slate-900">
                            {item.lineTotalFormatted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="mt-6 flex justify-end">
                  <div className="w-full max-w-xs space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {calculation.subtotalFormatted}
                      </span>
                    </div>

                    {calculation.discountAmount > 0 ? (
                      <div className="flex justify-between text-emerald-700">
                        <span>
                          Discount{" "}
                          {formData.discountType === "percentage"
                            ? `(${formData.discountValue}%)`
                            : "(Fixed)"}
                        </span>
                        <span className="font-semibold">
                          -{calculation.discountFormatted}
                        </span>
                      </div>
                    ) : null}

                    {(Number(formData.taxRatePercent) > 0 ||
                      calculation.taxAmount > 0) ? (
                      <div className="flex justify-between text-slate-600">
                        <span>Tax ({formData.taxRatePercent || 0}%)</span>
                        <span className="font-semibold text-slate-900">
                          {calculation.taxFormatted}
                        </span>
                      </div>
                    ) : null}

                    <div
                      className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-extrabold ${
                        isModernTemplate
                          ? "bg-indigo-50 text-indigo-950"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      <span>Grand Total ({calculation.currency.code})</span>
                      <span>{calculation.grandTotalFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions & Notes */}
                {(formData.paymentInstructions.trim() ||
                  formData.notes.trim()) ? (
                  <div className="mt-8 space-y-4 border-t border-slate-200 pt-6 text-xs">
                    {formData.paymentInstructions.trim() ? (
                      <div>
                        <p
                          className={`font-bold uppercase tracking-wider ${
                            isModernTemplate
                              ? "text-indigo-600"
                              : "text-slate-700"
                          }`}
                        >
                          Payment Instructions
                        </p>
                        <p className="mt-1 whitespace-pre-line break-words leading-relaxed text-slate-600">
                          {formData.paymentInstructions}
                        </p>
                      </div>
                    ) : null}

                    {formData.notes.trim() ? (
                      <div>
                        <p
                          className={`font-bold uppercase tracking-wider ${
                            isModernTemplate
                              ? "text-indigo-600"
                              : "text-slate-700"
                          }`}
                        >
                          Notes &amp; Terms
                        </p>
                        <p className="mt-1 whitespace-pre-line break-words leading-relaxed text-slate-600">
                          {formData.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
