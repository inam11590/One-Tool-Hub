import type {
  BenefitItem,
  NavItem,
  ToolCategory,
  ToolCategoryId,
  ToolItem,
} from "@/types/tools";
import { getSiteOrigin } from "./seo.ts";
import { searchTools } from "./search.ts";

export const SITE_CONFIG = {
  name: "OneToolHub",
  tagline: "Every Tool You Need. One Powerful Platform.",
  description:
    "Free, fast, and easy online tools for students, freelancers, creators, and developers. Process JSON, images, QR codes, text, timestamps, GPA, invoices, and PDFs directly in your browser.",
  url: getSiteOrigin(),
} as const;

export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "All Tools", href: "/tools" },
  { label: "Categories", href: "/#categories" },
  { label: "Learning Center", href: "/learn" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_NAV_ITEMS: readonly NavItem[] = [
  { label: "All Tools", href: "/tools" },
  { label: "Learning Center", href: "/learn" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  {
    id: "student",
    name: "Student Tools",
    shortName: "Students",
    description:
      "Academic calculators, writing helpers, and document utilities designed for coursework and study sessions.",
    icon: "GraduationCap",
    audience: "Students & Educators",
    exampleUseCases: ["GPA calculation", "Word & character counting", "PDF preparation"],
  },
  {
    id: "freelancer",
    name: "Freelancer Tools",
    shortName: "Freelancers",
    description:
      "Client-ready billing, document management, and quick business utilities for independent professionals.",
    icon: "Briefcase",
    audience: "Freelancers & Consultants",
    exampleUseCases: ["Invoice preparation", "PDF merge & split", "Shareable QR codes"],
  },
  {
    id: "youtube",
    name: "YouTube Tools",
    shortName: "Creators",
    description:
      "Publishing workflows, chapter timestamp formatting, and media optimization tools for video creators.",
    icon: "Video",
    audience: "YouTubers & Video Creators",
    exampleUseCases: ["Video chapter timestamps", "Thumbnail compression", "Description formatting"],
  },
  {
    id: "developer",
    name: "Developer Tools",
    shortName: "Developers",
    description:
      "Clean, reliable data formatting, encoding, and asset utilities built for everyday software engineering.",
    icon: "Code2",
    audience: "Developers & Engineers",
    exampleUseCases: ["JSON validation & formatting", "QR code testing", "Web asset compression"],
  },
] as const;

export const TOOLS_REGISTRY: readonly ToolItem[] = [
  {
    id: "youtube-timestamp-formatter",
    slug: "youtube-timestamp-formatter",
    name: "YouTube Timestamp Formatter",
    shortDescription:
      "Format, sort, and validate video chapter timestamps ready to paste directly into YouTube descriptions.",
    categoryId: "youtube",
    categoryLabel: "YouTube Tools",
    icon: "Clock",
    status: "available",
    featured: true,
    href: "/tools/youtube-timestamp-formatter",
    keywords: [
      "youtube",
      "timestamp",
      "chapters",
      "video",
      "creator",
      "timecode",
      "description",
    ],
  },
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    shortDescription:
      "Prettify, minify, and validate JSON payloads with clear syntax error reporting and indentation controls.",
    categoryId: "developer",
    categoryLabel: "Developer Tools",
    icon: "Braces",
    status: "available",
    featured: true,
    href: "/tools/json-formatter",
    keywords: [
      "json",
      "formatter",
      "validator",
      "minify",
      "prettify",
      "developer",
      "api",
    ],
  },
  {
    id: "image-compressor",
    slug: "image-compressor",
    name: "Image Compressor",
    shortDescription:
      "Reduce PNG, JPEG, and WebP file sizes while preserving visual clarity for faster web and social uploads.",
    categoryId: "youtube",
    categoryLabel: "YouTube Tools",
    icon: "Image",
    status: "available",
    featured: true,
    href: "/tools/image-compressor",
    keywords: [
      "image",
      "compress",
      "compressor",
      "optimize",
      "thumbnail",
      "png",
      "jpg",
      "webp",
      "size",
    ],
  },
  {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    name: "QR Code Generator",
    shortDescription:
      "Generate clean, customizable QR codes for URLs, text, and contact links with high-resolution export.",
    categoryId: "developer",
    categoryLabel: "Developer Tools",
    icon: "QrCode",
    status: "available",
    featured: true,
    href: "/tools/qr-code-generator",
    keywords: [
      "qr",
      "qrcode",
      "barcode",
      "link",
      "url",
      "generator",
      "share",
    ],
  },
  {
    id: "word-counter",
    slug: "word-counter",
    name: "Word Counter",
    shortDescription:
      "Count words, characters, sentences, paragraphs, and estimated reading time for essays, scripts, and articles.",
    categoryId: "student",
    categoryLabel: "Student Tools",
    icon: "FileText",
    status: "available",
    featured: true,
    href: "/tools/word-counter",
    keywords: [
      "word",
      "counter",
      "character",
      "essay",
      "writing",
      "student",
      "reading time",
    ],
  },
  {
    id: "gpa-calculator",
    slug: "gpa-calculator",
    name: "GPA Calculator",
    shortDescription:
      "Calculate semester and cumulative GPA using course credit hours and standard letter grade scales.",
    categoryId: "student",
    categoryLabel: "Student Tools",
    icon: "GraduationCap",
    status: "available",
    featured: true,
    href: "/tools/gpa-calculator",
    keywords: [
      "gpa",
      "grade",
      "calculator",
      "student",
      "university",
      "college",
      "semester",
      "credits",
    ],
  },
  {
    id: "invoice-generator",
    slug: "invoice-generator",
    name: "Invoice Generator",
    shortDescription:
      "Create structured, print-ready client invoices with line items, tax rates, discounts, and currency options.",
    categoryId: "freelancer",
    categoryLabel: "Freelancer Tools",
    icon: "Receipt",
    status: "available",
    featured: true,
    href: "/tools/invoice-generator",
    keywords: [
      "invoice",
      "billing",
      "freelancer",
      "receipt",
      "client",
      "business",
      "pdf",
    ],
  },
  {
    id: "pdf-merge-split",
    slug: "pdf-merge-split",
    name: "PDF Merge & Split",
    shortDescription:
      "Combine multiple PDF documents into a single file or extract specific page ranges quickly and cleanly.",
    categoryId: "freelancer",
    categoryLabel: "Freelancer Tools",
    icon: "Files",
    status: "available",
    featured: true,
    href: "/tools/pdf-merge-split",
    keywords: [
      "pdf",
      "merge",
      "split",
      "combine",
      "extract",
      "document",
      "freelancer",
      "student",
    ],
  },
  {
    id: "password-generator",
    slug: "password-generator",
    name: "Secure Password Generator",
    shortDescription:
      "Generate strong, cryptographically secure passwords locally in your browser with customizable length and character sets.",
    categoryId: "developer",
    categoryLabel: "Developer Tools",
    icon: "KeyRound",
    status: "available",
    featured: true,
    href: "/tools/password-generator",
    keywords: [
      "password",
      "generator",
      "random",
      "security",
      "crypto",
      "secure",
      "passphrase",
      "credentials",
      "developer",
    ],
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    name: "Image Resizer",
    shortDescription:
      "Resize JPEG, PNG, and WebP images to exact pixel dimensions with aspect ratio lock and client-side processing.",
    categoryId: "youtube",
    categoryLabel: "YouTube Tools",
    icon: "Scaling",
    status: "available",
    featured: true,
    href: "/tools/image-resizer",
    keywords: [
      "image",
      "resizer",
      "resize",
      "dimensions",
      "width",
      "height",
      "scale",
      "aspect ratio",
      "photo",
      "thumbnail",
    ],
  },
  {
    id: "base64-encoder-decoder",
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder & Decoder",
    shortDescription:
      "Encode text to Base64 and decode Base64 strings to UTF-8 text with Unicode support and instant swap.",
    categoryId: "developer",
    categoryLabel: "Developer Tools",
    icon: "Binary",
    status: "available",
    featured: true,
    href: "/tools/base64-encoder-decoder",
    keywords: [
      "base64",
      "encode",
      "decode",
      "decoder",
      "encoder",
      "utf8",
      "unicode",
      "binary",
      "data uri",
      "developer",
    ],
  },
  {
    id: "percentage-calculator",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    shortDescription:
      "Calculate percentages, percentage increases, decreases, markups, and differences with step-by-step explanations.",
    categoryId: "student",
    categoryLabel: "Student Tools",
    icon: "Percent",
    status: "available",
    featured: true,
    href: "/tools/percentage-calculator",
    keywords: [
      "percentage",
      "percent",
      "calculator",
      "discount",
      "increase",
      "decrease",
      "difference",
      "fraction",
      "student",
      "math",
    ],
  },
  {
    id: "pdf-to-image",
    slug: "pdf-to-image",
    name: "PDF to JPG / PNG Converter",
    shortDescription:
      "Convert PDF document pages into high-resolution JPG or PNG images with custom scaling, page ranges, and ZIP export.",
    categoryId: "freelancer",
    categoryLabel: "Freelancer Tools",
    icon: "FileImage",
    status: "available",
    featured: true,
    href: "/tools/pdf-to-image",
    keywords: [
      "pdf to image",
      "pdf to jpg",
      "pdf to png",
      "convert pdf pages",
      "pdf export images",
      "pdf rasterizer",
      "extract pdf images",
      "freelancer",
      "document",
    ],
  },
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    name: "JPG / PNG to PDF Converter",
    shortDescription:
      "Convert multiple JPG, PNG, and WebP images into a single clean PDF document with custom page sizes, orientations, and margins.",
    categoryId: "student",
    categoryLabel: "Student Tools",
    icon: "Images",
    status: "available",
    featured: true,
    href: "/tools/image-to-pdf",
    keywords: [
      "image to pdf",
      "jpg to pdf",
      "png to pdf",
      "photos to pdf",
      "combine images to pdf",
      "document scanner to pdf",
      "homework to pdf",
      "student",
    ],
  },
  {
    id: "pdf-organizer",
    slug: "pdf-organizer",
    name: "PDF Page Organizer",
    shortDescription:
      "Reorder, rotate, and delete pages within PDF documents interactively with visual thumbnails, undo, and instant export.",
    categoryId: "freelancer",
    categoryLabel: "Freelancer Tools",
    icon: "Layers",
    status: "available",
    featured: true,
    href: "/tools/pdf-organizer",
    keywords: [
      "pdf organizer",
      "reorder pdf pages",
      "rotate pdf",
      "delete pdf pages",
      "rearrange pdf",
      "pdf page editor",
      "freelancer",
      "document",
    ],
  },
  {
    id: "pdf-watermark",
    slug: "pdf-watermark",
    name: "PDF Watermark Tool",
    shortDescription:
      "Add custom text watermarks to PDF pages with live rotation, opacity, corner/center positioning, and tiled patterns.",
    categoryId: "freelancer",
    categoryLabel: "Freelancer Tools",
    icon: "Stamp",
    status: "available",
    featured: true,
    href: "/tools/pdf-watermark",
    keywords: [
      "pdf watermark",
      "add watermark to pdf",
      "stamp pdf",
      "confidential watermark",
      "draft watermark",
      "protect pdf document",
      "freelancer",
      "branding",
    ],
  },
] as const;

export const PLATFORM_BENEFITS: readonly BenefitItem[] = [
  {
    id: "fast",
    title: "Fast",
    description:
      "Engineered with a lightweight modern interface so tools load quickly and respond without clutter or unnecessary steps.",
    icon: "Zap",
  },
  {
    id: "privacy-focused",
    title: "Privacy-focused",
    description:
      "Designed to process everyday inputs with minimal data exposure and clear transparency about how each utility works.",
    icon: "ShieldCheck",
  },
  {
    id: "no-signup",
    title: "No signup required for basic tools",
    description:
      "Open a utility and start working right away—no mandatory account creation or paywalls blocking core tools.",
    icon: "UserCheck",
  },
  {
    id: "mobile-friendly",
    title: "Mobile-friendly",
    description:
      "Responsive layouts built for phones, tablets, laptops, and wide desktop monitors with full keyboard accessibility.",
    icon: "Smartphone",
  },
] as const;

export function getToolBySlug(slug: string): ToolItem | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.slug === slug);
}

const CURATED_RELATED_TOOL_SLUGS: Record<string, readonly string[]> = {
  "json-formatter": [
    "qr-code-generator",
    "word-counter",
    "base64-encoder-decoder",
    "password-generator",
  ],
  "image-compressor": [
    "image-resizer",
    "image-to-pdf",
    "pdf-merge-split",
    "qr-code-generator",
  ],
  "qr-code-generator": [
    "json-formatter",
    "invoice-generator",
    "image-compressor",
    "pdf-merge-split",
  ],
  "word-counter": [
    "gpa-calculator",
    "percentage-calculator",
    "pdf-merge-split",
    "invoice-generator",
  ],
  "youtube-timestamp-formatter": [
    "image-compressor",
    "image-resizer",
    "word-counter",
    "qr-code-generator",
  ],
  "gpa-calculator": [
    "percentage-calculator",
    "word-counter",
    "image-to-pdf",
    "pdf-merge-split",
  ],
  "invoice-generator": [
    "pdf-watermark",
    "pdf-merge-split",
    "percentage-calculator",
    "image-to-pdf",
  ],
  "pdf-merge-split": [
    "pdf-organizer",
    "pdf-to-image",
    "image-to-pdf",
    "pdf-watermark",
  ],
  "password-generator": [
    "base64-encoder-decoder",
    "json-formatter",
    "pdf-watermark",
    "qr-code-generator",
  ],
  "image-resizer": [
    "image-compressor",
    "image-to-pdf",
    "pdf-to-image",
    "youtube-timestamp-formatter",
  ],
  "base64-encoder-decoder": [
    "password-generator",
    "json-formatter",
    "qr-code-generator",
    "pdf-to-image",
  ],
  "percentage-calculator": [
    "gpa-calculator",
    "invoice-generator",
    "word-counter",
    "image-to-pdf",
  ],
  "pdf-to-image": [
    "image-to-pdf",
    "pdf-organizer",
    "pdf-merge-split",
    "image-resizer",
  ],
  "image-to-pdf": [
    "pdf-to-image",
    "pdf-merge-split",
    "image-compressor",
    "pdf-organizer",
  ],
  "pdf-organizer": [
    "pdf-merge-split",
    "pdf-watermark",
    "pdf-to-image",
    "image-to-pdf",
  ],
  "pdf-watermark": [
    "pdf-organizer",
    "pdf-merge-split",
    "invoice-generator",
    "pdf-to-image",
  ],
};

export function getRelatedTools(
  currentSlug: string,
  limit = 4
): ToolItem[] {
  const curatedSlugs = CURATED_RELATED_TOOL_SLUGS[currentSlug];
  if (curatedSlugs) {
    const curatedTools = curatedSlugs
      .map((slug) => getToolBySlug(slug))
      .filter((item): item is ToolItem => Boolean(item));
    const remaining = TOOLS_REGISTRY.filter(
      (tool) =>
        tool.slug !== currentSlug &&
        !curatedTools.some((c) => c.slug === tool.slug)
    );
    return [...curatedTools, ...remaining].slice(0, limit);
  }

  const currentTool = getToolBySlug(currentSlug);
  const others = TOOLS_REGISTRY.filter((tool) => tool.slug !== currentSlug);

  const sorted = [...others].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "available" ? -1 : 1;
    }
    if (currentTool) {
      const aSame = a.categoryId === currentTool.categoryId ? 0 : 1;
      const bSame = b.categoryId === currentTool.categoryId ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
    }
    return 0;
  });

  return sorted.slice(0, limit);
}

export function filterTools(
  tools: readonly ToolItem[],
  query: string,
  categoryId: ToolCategoryId | "all" = "all",
  statusFilter: "all" | "available" | "coming-soon" = "all"
): ToolItem[] {
  const normalizedQuery = query.trim();

  // If no query string, perform simple category and status filtering
  if (!normalizedQuery) {
    return tools.filter((tool) => {
      const matchesCategory =
        categoryId === "all" || tool.categoryId === categoryId;
      const matchesStatus =
        statusFilter === "all" || tool.status === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }

  // Use deterministic, typo-tolerant search
  const ranked = searchTools(tools, normalizedQuery, {
    maxResults: 50,
    categoryId,
  });

  return ranked
    .map((r) => r.tool)
    .filter((tool) => statusFilter === "all" || tool.status === statusFilter);
}
