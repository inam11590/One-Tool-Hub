import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, SITE_CONFIG } from "@/lib/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { InvoiceGeneratorTool } from "@/components/tools/InvoiceGeneratorTool";

const TOOL_SLUG = "invoice-generator";

export const metadata: Metadata = {
  title: "Professional Invoice Generator — Free PDF & Print Invoices",
  description:
    "Create clean, print-ready client invoices online for free. Includes ISO currency support, safe decimal tax and discount math, two templates, and instant readable PDF download.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
  },
  openGraph: {
    title: `Professional Invoice Generator | ${SITE_CONFIG.name}`,
    description:
      "Build and download readable PDF client invoices with ISO currency codes, line items, discounts, tax calculation, and live preview.",
    url: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
    type: "website",
  },
};

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
      privacyNote="100% client-side PDF generation. Invoice data is never uploaded to any server."
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <InvoiceGeneratorTool />
    </ToolPageShell>
  );
}
