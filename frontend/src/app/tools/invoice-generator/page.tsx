import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { InvoiceGeneratorTool } from "@/components/tools/InvoiceGeneratorTool";

const TOOL_SLUG = "invoice-generator";

export const metadata: Metadata = buildPageMetadata({
  title: "Professional Invoice Generator — Free PDF & Print Invoices",
  description:
    "Create clean, print-ready client invoices online for free. Includes 10 ISO currencies, safe decimal tax and discount math, two templates, and instant readable PDF download.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "free freelance invoice generator pdf",
    "online invoice maker no signup",
    "multi currency invoice generator",
    "client invoice with discount and tax",
    "browser pdf invoice generator",
  ],
});

const OVERVIEW =
  "The OneToolHub Professional Invoice Generator helps independent freelancers, consultants, and contractors create polished, print-ready client invoices directly in their browser. It uses integer minor-unit arithmetic for accurate subtotal, discount, and tax math across 10 major ISO currencies and exports selectable-text PDF documents without uploading your billing details to any server.";

const FEATURES = [
  "Two visual invoice templates ('Modern Indigo' and 'Classic Executive') with live side-by-side preview.",
  "10 ISO 4217 currencies (USD, EUR, GBP, CAD, AUD, JPY, INR, PKR, AED, CHF) with proper decimal formatting.",
  "Safe integer minor-unit math that prevents floating-point rounding discrepancies on line totals, discounts, and taxes.",
  "Support for both percentage-based and fixed-amount discounts plus configurable tax rates.",
  "Selectable-text vector PDF generation with automatic multi-page pagination and long-text line wrapping.",
  "Opt-in local browser draft persistence so you can save and reload recurring invoice details on your own device.",
] as const;

const EXAMPLES = [
  {
    title: "Freelance Web Development Milestone Invoice",
    description:
      "Bill a client for design and development deliverables in USD or EUR with a 10% loyalty discount and applicable regional tax.",
    sample: "Subtotal $2,500.00 − 10% Discount ($250.00) + 8% Tax ($180.00) = $2,430.00 Total Due",
  },
  {
    title: "Zero-Decimal Currency Billing (JPY)",
    description:
      "Switch currency to JPY (Japanese Yen) to automatically format line items and totals with zero decimal places.",
    sample: "3 × ¥45,000 = ¥135,000",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Choose a Template & Currency",
    stepDescription:
      "Switch between the 'Modern Indigo' and 'Classic Executive' templates, enter an editable invoice number, and choose your ISO currency code (USD, EUR, GBP, CAD, AUD, INR, PKR, AED, JPY, etc.).",
  },
  {
    stepTitle: "Enter Sender & Client Details",
    stepDescription:
      "Fill in your business name and contact address alongside your customer's billing details, issue date, and payment due date.",
  },
  {
    stepTitle: "Add Line Items, Discounts & Tax",
    stepDescription:
      "Add deliverables with quantities and unit prices. Apply a percentage or fixed discount and specify any applicable tax rate.",
  },
  {
    stepTitle: "Download PDF or Print",
    stepDescription:
      "Review the live preview and click 'Download PDF' to generate a clean, selectable-text PDF document locally in your browser, or click 'Print Invoice'.",
  },
] as const;

const FAQS = [
  {
    question: "How does this invoice generator avoid floating-point rounding errors?",
    answer:
      "All currency calculations convert decimal values into integer minor units (such as cents) before computing line totals, discounts, and taxes, eliminating standard JavaScript floating-point precision artifacts.",
  },
  {
    question: "Does OneToolHub store, email, or transmit my invoice data?",
    answer:
      "No. Invoices are generated locally in your browser using client-side PDF rendering. Optional draft saving in your browser's localStorage is strictly opt-in and only stored on your own device.",
  },
  {
    question: "Can this tool handle multi-page invoices and long descriptions?",
    answer:
      "Yes. Both the browser print stylesheet and the PDF generator automatically wrap long descriptions and add numbered continuation pages whenever line items or payment instructions exceed a single page.",
  },
  {
    question: "Is this invoice legally compliant in my jurisdiction?",
    answer:
      "This tool formats invoice documents based on the figures and notes you provide. Freelancers and businesses are responsible for verifying local tax, VAT/GST registration, and record-keeping rules.",
  },
] as const;

export default function InvoiceGeneratorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Professional Invoice Generator"
      description="Create, preview, print, and download multi-page PDF client invoices with ISO currencies, safe decimal tax and discount calculations, and two professional templates."
      privacyNote="Generated locally in your browser. Invoice data is not uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <InvoiceGeneratorTool />
    </ToolPageShell>
  );
}
