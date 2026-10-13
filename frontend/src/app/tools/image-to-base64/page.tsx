import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ImageToBase64Tool = dynamic(
  () =>
    import("@/components/tools/ImageToBase64Tool").then(
      (mod) => mod.ImageToBase64Tool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading Image to Base64 Converter...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "image-to-base64";

export const metadata: Metadata = buildPageMetadata({
  title: "Image to Base64 Converter — Convert Images to Data URLs Online",
  description:
    "Convert JPG, PNG, and WebP images into Base64 strings and HTML/CSS data URLs with instant copy and TXT download. 100% private in-browser conversion.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "image to base64",
    "image to data url converter",
    "base64 image encoder",
    "convert picture to base64",
    "png to base64 string",
    "inline image data url",
    "client-side base64 image",
    "free image to base64 online",
  ],
});

const OVERVIEW =
  "The OneToolHub Image to Base64 Converter transforms binary image files into ASCII-safe Base64 strings and RFC 2397 Data URLs for seamless embedding in HTML, CSS stylesheets, JSON payloads, and email templates. By executing entirely client-side through the browser's FileReader API, your files remain completely private on your machine. The utility breaks down exact encoding sizes and explains the ~33% byte expansion overhead inherent to Base64 representation.";

const FEATURES = [
  "100% private in-browser Base64 conversion with zero server uploads or external transmissions.",
  "Generates both complete RFC 2397 Data URLs (`data:image/...;base64,...`) and raw Base64 strings.",
  "One-click clipboard copying for quick pasting into code editors or design workflows.",
  "Export encoded string as a `.txt` text file for safe archiving without browser clipboard truncation.",
  "Calculates original binary file size vs Base64 character length and exact overhead percentage.",
  "Visual rendered thumbnail to verify that the generated Data URL is valid and undamaged.",
  "Supports JPG, PNG, and WebP images up to 15 MB.",
] as const;

const EXAMPLES = [
  {
    title: "Inlining Small SVG or PNG Icons in HTML",
    description: "Embed a company logo or favicon directly into an HTML <img> tag without needing an extra HTTP network request.",
    sample: "logo-icon.png (12 KB) → data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA... → inlined directly in index.html",
  },
  {
    title: "Embedding Background Images in CSS Stylesheets",
    description: "Embed a subtle pattern directly into a CSS `background-image: url(...)` property.",
    sample: "pattern.webp (8 KB) → url('data:image/webp;base64,...') in styles.css",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Image",
    stepDescription: "Drag and drop your image or click to select a JPEG, PNG, or WebP file from your computer.",
  },
  {
    stepTitle: "Instant Conversion",
    stepDescription: "The tool immediately converts your file using FileReader and displays dimensions, original size, and Base64 size.",
  },
  {
    stepTitle: "Select Output Format",
    stepDescription: "Switch between 'Complete Data URL' (for HTML/CSS) and 'Raw Base64 String' (for JSON API payloads).",
  },
  {
    stepTitle: "Copy or Download Text",
    stepDescription: "Click 'Copy to Clipboard' or 'Save as .txt' to export your Base64 payload without file truncation.",
  },
] as const;

const FAQS = [
  {
    question: "Why is the Base64 string larger than the original image file?",
    answer:
      "Base64 encoding translates every 3 bytes of binary data into 4 ASCII text characters (a 4/3 ratio). This naturally results in an approximate 33% increase in data size. It is best used for small icons and web assets rather than large multi-megabyte photos.",
  },
  {
    question: "What is the difference between a Data URL and Raw Base64?",
    answer:
      "A Data URL includes the standard browser prefix `data:[mime-type];base64,` followed by the encoded string. This prefix tells web browsers and CSS how to decode and render the image. Raw Base64 contains only the pure alphanumeric encoded characters.",
  },
  {
    question: "Are my images sent to a server?",
    answer:
      "Never. All encoding is performed locally in your browser memory using the standard JavaScript FileReader API. No data is transmitted to OneToolHub or any third party.",
  },
  {
    question: "Can I use Base64 images in emails?",
    answer:
      "Yes, many email clients support embedded Base64 data URLs for small icons, signatures, and badges, avoiding external image blocking by email firewalls.",
  },
] as const;

export default function ImageToBase64Page() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Image to Base64 Converter"
      description="Convert images to Base64 strings and HTML Data URLs online with size overhead stats and TXT export."
      privacyNote="Processed 100% locally in your browser. Encoded strings are never saved or sent to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageToBase64Tool />
    </ToolPageShell>
  );
}
