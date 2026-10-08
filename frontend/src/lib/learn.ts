import type {
  LearnArticle,
  LearnArticleSummary,
  LearnCategory,
  LearnCategoryId,
} from "@/types/learn";

export const LEARN_CATEGORIES: readonly LearnCategory[] = [
  {
    id: "developer-tutorials",
    name: "Developer Tutorials",
    shortName: "Developers",
    description:
      "Practical engineering guides on JSON validation, API payload formatting, QR encoding standards, and browser-based workflows.",
  },
  {
    id: "image-pdf-guides",
    name: "Image & PDF Guides",
    shortName: "Image & PDF",
    description:
      "Step-by-step instructions for compressing web images, comparing WebP vs. JPEG vs. PNG, and merging or splitting PDF files locally.",
  },
  {
    id: "youtube-creator-guides",
    name: "YouTube Creator Guides",
    shortName: "YouTube Creators",
    description:
      "Publishing guides for video chapter timestamps, description formatting, and YouTube's official chapter eligibility requirements.",
  },
  {
    id: "student-resources",
    name: "Student Resources",
    shortName: "Students",
    description:
      "Academic walkthroughs covering weighted semester and cumulative GPA calculations, essay word count targets, and reading time formulas.",
  },
  {
    id: "freelancer-resources",
    name: "Freelancer Resources",
    shortName: "Freelancers",
    description:
      "Client billing best practices, multi-currency invoice preparation, and accurate tax and discount calculation guides.",
  },
] as const;

export const LEARN_ARTICLES: readonly LearnArticle[] = [
  {
    slug: "how-to-format-and-validate-json",
    title: "How to Format and Validate JSON Correctly",
    seoTitle:
      "How to Format and Validate JSON Correctly — Syntax & Debugging Guide",
    metaDescription:
      "Learn how to format, prettify, minify, and validate JSON data safely in your browser. Includes RFC 8259 syntax rules, worked examples, and fixes for common JSON parse errors.",
    excerpt:
      "Understand strict RFC 8259 JSON syntax rules, compare 2-space, 4-space, and minified payloads, and learn how to fix common Unexpected Token parse errors safely in your browser.",
    categoryId: "developer-tutorials",
    categoryLabel: "Developer Tutorials",
    icon: "Braces",
    readingTimeMinutes: 6,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: true,
    primaryToolSlug: "json-formatter",
    relatedToolSlugs: ["qr-code-generator", "word-counter", "image-compressor"],
    relatedArticleSlugs: [
      "how-to-create-qr-code-for-website",
      "how-to-compress-images-for-web",
    ],
    keywords: [
      "how to format json",
      "validate json online",
      "fix unexpected token json",
      "json 2 space vs 4 space",
      "minify json payload",
      "rfc 8259 json syntax",
    ],
    introduction: [
      "JavaScript Object Notation (JSON) is the standard data interchange format used across REST APIs, GraphQL responses, cloud configuration files, and package manifests. Because production APIs strip whitespace to save bandwidth, raw responses often arrive as a single dense line of text that is difficult for humans to inspect.",
      "This guide explains how to format (prettify), compact (minify), and validate JSON payloads locally in your browser—and how to diagnose the most frequent syntax mistakes that cause strict parsers like ECMAScript JSON.parse() to fail.",
    ],
    problemSolved: {
      heading: "Why Raw JSON Payloads Are Difficult to Read and Debug",
      paragraphs: [
        "When an API endpoint returns a nested 50-kilobyte response or a webhook fails with a 400 Bad Request error, scanning a single-line string by eye is slow and error-prone. A single misplaced comma, unescaped quotation mark, or trailing bracket can invalidate an entire configuration file.",
        "At the same time, pasting production API responses or internal configuration files into random server-based formatting websites can expose private tokens, customer identifiers, or internal schema details. Formatting and validating JSON inside browser memory solves both readability and data privacy.",
      ],
      keyTakeaways: [
        "Strict JSON (RFC 8259) requires double quotes around all object keys and string values.",
        "2-space and 4-space indentation make nested objects easy to audit during code reviews.",
        "Minification removes non-essential whitespace to reduce UTF-8 byte size over the network.",
        "Client-side validation using JSON.parse() checks syntax without uploading your data to any server.",
      ],
    },
    steps: [
      {
        stepTitle: "Copy or Upload Your Raw JSON Payload",
        stepDescription:
          "Open the OneToolHub JSON Formatter & Validator and paste your raw JSON string into the Input JSON editor, or click 'Upload .json' to load a local file up to 2 MB.",
        proTip:
          "You can click 'Load Sample' in the toolbar first if you want to test how indentation and byte counters respond before pasting your own payload.",
      },
      {
        stepTitle: "Select Your Indentation Mode (2 Spaces, 4 Spaces, or Minify)",
        stepDescription:
          "Click 'Format (2 Spaces)' for standard JavaScript/TypeScript project readability, 'Format (4 Spaces)' for wider visual separation on deep hierarchies, or 'Minify' to collapse all whitespace into a single compact line.",
      },
      {
        stepTitle: "Inspect Validation Status and UTF-8 Byte Counts",
        stepDescription:
          "Check the status bar above the output panel. When your input is valid, the tool displays the exact UTF-8 byte size of both the raw input and the formatted output.",
      },
      {
        stepTitle: "Fix Any Highlighted Syntax Errors and Export",
        stepDescription:
          "If the parser encounters invalid syntax, read the diagnostic alert showing the parser message and approximate line/column. Once corrected, click 'Copy Output' or 'Download .json'.",
      },
    ],
    practicalExample: {
      title: "Prettifying a Minified Webhook Payload and Fixing a Trailing Comma",
      scenario:
        "Suppose you copy a webhook configuration snippet from documentation that contains minified nested fields and an accidental trailing comma after the last array item.",
      inputLabel: "Raw Input (Minified with Syntax Error)",
      inputSample:
        '{"event":"invoice.paid","Version":2,"retryPolicy":{"maxAttempts":3,"backoffSeconds":[5,15,60,]}}',
      outputLabel: "Corrected & Formatted Output (2 Spaces)",
      outputSample: `{\n  "event": "invoice.paid",\n  "Version": 2,\n  "retryPolicy": {\n    "maxAttempts": 3,\n    "backoffSeconds": [\n      5,\n      15,\n      60\n    ]\n  }\n}`,
      explanation:
        "Removing the trailing comma after '60' allows JSON.parse() to succeed, and formatting with 2 spaces reveals the exact nesting structure of the retryPolicy object.",
    },
    commonMistakes: [
      {
        mistake: "Leaving a trailing comma after the last property or array item",
        whyItHappens:
          "Modern JavaScript and TypeScript allow trailing commas in object literals, so developers frequently include them by habit when editing .json files.",
        howToFix:
          "Remove the comma immediately preceding any closing brace '}' or closing bracket ']'.",
      },
      {
        mistake: "Using single quotes instead of double quotes",
        whyItHappens:
          "Python dictionaries and JavaScript strings often use single quotes ('key': 'value'), which is invalid in strict JSON.",
        howToFix:
          "Replace all outer string and key single quotes with standard double quotes (\"key\": \"value\").",
      },
      {
        mistake: "Including comments (// or /* */) or unquoted keys",
        whyItHappens:
          "Formats like JSONC or YAML allow inline comments, whereas standard RFC 8259 JSON forbids them.",
        howToFix:
          "Strip all // and /* */ comments before passing the payload to strict JSON parsers or HTTP APIs.",
      },
    ],
    troubleshooting: [
      {
        symptom:
          "SyntaxError: Unexpected token } or ] in JSON at position ...",
        solution:
          "Check the character immediately before the closing brace or bracket indicated by the line/column diagnostic. In almost all cases, there is a trailing comma or a missing property value.",
      },
      {
        symptom: "SyntaxError: Unexpected end of JSON input",
        solution:
          "Your JSON string was truncated or is missing one or more closing braces '}' or brackets ']'. Count the opening and closing delimiters at the end of the file.",
      },
      {
        symptom: "File upload is rejected as exceeding the 2 MB limit",
        solution:
          "Browser-based text editors enforce a 2 MB UTF-8 cap to keep your browser tab responsive. Split multi-megabyte log dumps into smaller chunks or inspect a single record before formatting.",
      },
    ],
    faqs: [
      {
        question: "Does formatting JSON change the meaning or order of my data?",
        answer:
          "Formatting only adds or removes whitespace (spaces and line breaks) outside of string literals. Key-value pairs and array element order remain intact.",
      },
      {
        question: "Should I use 2-space or 4-space indentation?",
        answer:
          "Both are 100% valid JSON. Most web frontend and Node.js repositories standardize on 2 spaces to keep deeply nested objects compact, while many Python and backend teams prefer 4 spaces.",
      },
      {
        question: "Is it safe to paste API responses into the OneToolHub JSON Formatter?",
        answer:
          "Yes. The formatter runs entirely inside your browser using native JavaScript JSON.parse() and JSON.stringify(). Your JSON payload is never transmitted to an external server.",
      },
    ],
    conclusion: {
      heading: "Validate Your JSON Before Every Commit or API Call",
      paragraphs: [
        "Catching a missing quote or trailing comma in your browser takes seconds and prevents broken deployments or failed webhook requests. Whenever you need to inspect a dense API payload or minify a configuration block, use a local browser validator so your data stays private.",
      ],
      ctaLabel: "Open JSON Formatter & Validator",
    },
  },
  {
    slug: "how-to-compress-images-for-web",
    title: "How to Compress Images Without Unnecessary Quality Loss",
    seoTitle:
      "How to Compress Images Without Unnecessary Quality Loss (WebP, JPEG & PNG)",
    metaDescription:
      "Learn how to reduce JPEG, PNG, and WebP file sizes in your browser while keeping crisp visual quality. Includes recommended quality settings for websites and YouTube thumbnails.",
    excerpt:
      "Compare lossy vs. lossless browser compression across WebP, JPEG, and PNG, choose the right quality percentage, and avoid common pitfalls like transparent PNG background issues.",
    categoryId: "image-pdf-guides",
    categoryLabel: "Image & PDF Guides",
    icon: "Image",
    readingTimeMinutes: 6,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: true,
    primaryToolSlug: "image-compressor",
    relatedToolSlugs: [
      "youtube-timestamp-formatter",
      "pdf-merge-split",
      "qr-code-generator",
    ],
    relatedArticleSlugs: [
      "how-to-format-youtube-timestamps-and-chapters",
      "how-to-merge-and-split-pdf-files-online",
    ],
    keywords: [
      "how to compress images without losing quality",
      "compress youtube thumbnail under 2mb",
      "webp vs jpeg vs png compression",
      "reduce image file size in browser",
      "best image quality setting for web",
    ],
    introduction: [
      "Unoptimized images are the single largest contributor to slow webpage loading times, poor Largest Contentful Paint (LCP) scores, and rejected uploads on platforms like YouTube (which enforces a strict 2 MB limit on custom video thumbnails).",
      "This tutorial explains how browser-based image compression works, when to choose WebP, JPEG, or PNG, and how to reduce image byte size by 50% to 80% while preserving sharp visual detail.",
    ],
    problemSolved: {
      heading: "Balancing Visual Sharpness Against File Size Limits",
      paragraphs: [
        "Exporting a 1920×1080 graphic or photograph directly from a camera or design tool often produces a 3 MB to 8 MB file. Uploading files that large slows down mobile visitors on cellular connections and triggers file-size errors on CMS portals, university submission forms, and social platforms.",
        "However, blindly dragging a quality slider too low introduces blocky compression artifacts around text and edges. Understanding how each image format handles color and transparency lets you pick the sweet spot immediately.",
      ],
      keyTakeaways: [
        "WebP at 75%–85% quality typically delivers smaller files than JPEG with comparable visual sharpness.",
        "JPEG at 80%–85% quality is ideal for photographs and YouTube thumbnails when maximum legacy compatibility is needed.",
        "Standard HTML5 Canvas PNG export is lossless—to shrink a large PNG photograph, convert its output format to WebP or JPEG.",
        "Converting a transparent PNG to JPEG composites transparent pixels onto a clean white background.",
      ],
    },
    steps: [
      {
        stepTitle: "Upload Your Source JPEG, PNG, or WebP Image",
        stepDescription:
          "Open the OneToolHub Image Compressor and drag and drop your image file (up to 25 MB and 40 megapixels) into the upload dropzone.",
      },
      {
        stepTitle: "Select the Best Target Output Format",
        stepDescription:
          "Choose WebP for modern websites and blogs, JPEG for universal photo compatibility and YouTube thumbnails, or PNG if you need lossless pixel preservation.",
        proTip:
          "If your source file is a heavy PNG screenshot or thumbnail that does not require alpha transparency, switching the output format to WebP or JPEG produces dramatic file size savings.",
      },
      {
        stepTitle: "Adjust the Quality Slider Between 75% and 85%",
        stepDescription:
          "Set the quality slider to 80% as a starting baseline. Use the side-by-side preview to inspect fine text, edges, and gradients.",
      },
      {
        stepTitle: "Verify the Byte Reduction and Download",
        stepDescription:
          "Confirm that the output byte size meets your target (for example, under 2 MB for YouTube or under 200 KB for a web hero image) and click 'Download Image'.",
      },
    ],
    practicalExample: {
      title: "Shrinking a 3.4 MB PNG YouTube Thumbnail Below the 2 MB Upload Cap",
      scenario:
        "A creator exports a 1280×720 PNG thumbnail with photographic layers that weighs 3.4 MB—exceeding YouTube Studio's 2 MB limit.",
      inputLabel: "Source File",
      inputSample: "thumbnail-final.png — 1280 × 720 px — 3,420 KB (PNG)",
      outputLabel: "Optimized Output (JPEG or WebP at 82% Quality)",
      outputSample:
        "thumbnail-final-compressed.jpg — 1280 × 720 px — 215 KB (−93.7% size reduction)",
      explanation:
        "Because photographic gradients do not compress efficiently in lossless PNG, re-encoding the 1280×720 canvas as an 82% quality JPEG or WebP reduces the file from 3.4 MB to roughly 215 KB with virtually indistinguishable visual clarity at normal viewing distances.",
    },
    commonMistakes: [
      {
        mistake: "Expecting the quality slider to reduce PNG output size",
        whyItHappens:
          "The browser HTML5 Canvas specification always encodes image/png losslessly and ignores lossy quality parameters.",
        howToFix:
          "Select WebP or JPEG as the output format when you want the quality slider to reduce file size.",
      },
      {
        mistake: "Exporting an already-compressed JPEG at 100% quality",
        whyItHappens:
          "Users sometimes slide quality to 100% thinking it preserves the original byte count, which actually forces the encoder to write minimally quantized tables that inflate file size.",
        howToFix:
          "Use 75%–85% quality for lossy exports. If the output is still larger than an already-optimized input, keep your original file.",
      },
      {
        mistake: "Converting a transparent logo to JPEG when transparency is needed",
        whyItHappens:
          "The JPEG specification does not support an alpha channel.",
        howToFix:
          "Choose WebP (which supports both lossy compression and alpha transparency) or PNG when you need a transparent background.",
      },
    ],
    troubleshooting: [
      {
        symptom: "The compressed file is slightly larger than my original image",
        solution:
          "Your original image was likely already compressed at a lower quality setting or optimized with specialized palette quantization. Lower the quality slider to 70%–75% or switch the output format to WebP.",
      },
      {
        symptom: "Upload error: File signature does not match JPEG, PNG, or WebP",
        solution:
          "Sometimes a file downloaded from the web has a .jpg extension but is actually an AVIF, HEIC, or HTML file. The tool checks binary magic bytes (FF D8 FF for JPEG, 89 50 4E 47 for PNG, RIFF/WEBP for WebP) for security.",
      },
    ],
    faqs: [
      {
        question: "What quality percentage is best for web images?",
        answer:
          "For most photographs and blog graphics, 75% to 85% quality in WebP or JPEG reduces file size substantially while keeping compression artifacts unnoticeable to the human eye.",
      },
      {
        question: "Does compressing an image change its pixel dimensions?",
        answer:
          "No. The OneToolHub Image Compressor preserves the exact width and height (in pixels) of your source image while optimizing how the color data is encoded.",
      },
      {
        question: "Are my photos uploaded to any cloud server during compression?",
        answer:
          "No. All image decoding and compression happen locally on your device using your browser's built-in HTML5 Canvas engine.",
      },
    ],
    conclusion: {
      heading: "Optimize Every Image Before You Publish",
      paragraphs: [
        "Taking ten seconds to compress screenshots, blog photos, and thumbnails in your browser keeps your pages fast and ensures you never hit upload size rejections.",
      ],
      ctaLabel: "Open Image Compressor",
    },
  },
  {
    slug: "how-to-create-qr-code-for-website",
    title: "How to Create a QR Code for a Website",
    seoTitle:
      "How to Create a QR Code for a Website — Static PNG & SVG Guide",
    metaDescription:
      "Learn how to generate a permanent, non-expiring QR code for any website URL in your browser. Covers PNG vs. SVG formats, custom colors, quiet zones, and contrast rules.",
    excerpt:
      "Generate static, non-expiring QR codes for URLs and text, choose between raster PNG and vector SVG exports, and verify WCAG color contrast so every smartphone camera scans reliably.",
    categoryId: "developer-tutorials",
    categoryLabel: "Developer Tutorials",
    icon: "QrCode",
    readingTimeMinutes: 5,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: false,
    primaryToolSlug: "qr-code-generator",
    relatedToolSlugs: [
      "invoice-generator",
      "image-compressor",
      "json-formatter",
    ],
    relatedArticleSlugs: [
      "how-to-create-professional-freelance-invoice",
      "how-to-format-and-validate-json",
    ],
    keywords: [
      "how to create a qr code for a website",
      "static qr code generator no expiration",
      "png vs svg qr code for print",
      "qr code contrast rules",
      "custom color qr code scannability",
    ],
    introduction: [
      "QR (Quick Response) codes bridge physical print materials—such as business cards, restaurant menus, conference slides, and product packaging—with online destinations. However, many people print thousands of flyers only to discover two weeks later that their QR code stopped working because a 'free' generator used a paid redirect link.",
      "This guide walks you through creating a true static QR code that encodes your URL directly into the pattern, never expires, and scans reliably across iOS and Android cameras.",
    ],
    problemSolved: {
      heading: "Avoiding Expiring Redirects and Unscannable Color Combinations",
      paragraphs: [
        "There are two kinds of QR codes: dynamic codes (which encode a third-party tracking URL that redirects to your site and can be deactivated if you don't pay a subscription) and static codes (which encode your actual website URL directly into the black-and-white modules).",
        "Beyond expiration traps, custom-colored QR codes often fail in the real world when designers choose low-contrast pastels, invert the foreground and background colors, or crop off the outer white quiet zone.",
      ],
      keyTakeaways: [
        "Static QR codes encode your URL directly into the graphic and never expire.",
        "Always keep the foreground modules darker than the background with strong luminance contrast.",
        "Preserve the 4-module white border ('quiet zone') around the code so cameras can detect its edges.",
        "Export SVG for print layouts (business cards, posters, signage) and PNG for screens and slides.",
      ],
    },
    steps: [
      {
        stepTitle: "Paste Your Full HTTPS Website URL",
        stepDescription:
          "Open the OneToolHub QR Code Generator and paste your complete destination URL (including https://) into the content field.",
        proTip:
          "Keep your URL concise. Shorter URLs produce a less dense QR matrix with larger modules that are easier to scan from a distance.",
      },
      {
        stepTitle: "Select Output Dimensions and Brand Colors",
        stepDescription:
          "Choose a pixel size between 128 px and 1024 px and customize the foreground and background hex colors if desired.",
      },
      {
        stepTitle: "Check the Built-In Contrast & Inversion Indicator",
        stepDescription:
          "Verify that no contrast warning appears. Always use a dark foreground (such as black, charcoal, or deep navy) on a light background (such as white).",
      },
      {
        stepTitle: "Test with Your Phone Camera and Download PNG or SVG",
        stepDescription:
          "Point your smartphone camera at the live on-screen preview to confirm it opens the right URL, then download PNG for digital use or SVG for print.",
      },
    ],
    practicalExample: {
      title: "Creating a Vector QR Code for a Freelancer Business Card",
      scenario:
        "A freelance designer wants to place a scannable portfolio link on a 3.5 × 2 inch printed business card using their brand's dark indigo palette.",
      inputLabel: "QR Configuration",
      inputSample:
        "Content: https://example.com/portfolio | Foreground: #1e1b4b | Background: #ffffff | Format: SVG",
      outputLabel: "Resulting Asset",
      outputSample:
        "Scalable vector SVG with 4-module quiet zone and high contrast (passes WCAG luminance check)",
      explanation:
        "Using deep indigo (#1e1b4b) on pure white (#ffffff) maintains high luminance separation for optical sensors, and exporting as SVG ensures the printer renders razor-sharp module edges at 300+ DPI.",
    },
    commonMistakes: [
      {
        mistake: "Inverting colors (light foreground on a dark background)",
        whyItHappens:
          "Dark-mode designs tempt creators to place a white QR code on a black card.",
        howToFix:
          "Many barcode scanners and older camera apps cannot decode inverted QR codes. Always keep the foreground modules darker than the background.",
      },
      {
        mistake: "Cropping off the outer white margin (quiet zone)",
        whyItHappens:
          "Designers sometimes trim the border so the QR matrix touches adjacent text or frames.",
        howToFix:
          "Leave the built-in 4-module quiet zone intact so the camera's finder-pattern detector can isolate the three corner squares.",
      },
      {
        mistake: "Encoding a relative URL without https://",
        whyItHappens:
          "Typing 'example.com' instead of 'https://example.com' may cause some scanners to treat the code as plain text rather than a clickable web link.",
        howToFix:
          "Always include the full 'https://' protocol prefix for website links.",
      },
    ],
    troubleshooting: [
      {
        symptom: "My phone camera does not recognize the QR code on screen",
        solution:
          "Check if the contrast warning banner is active. Reset colors to classic black (#0f172a or #000000) on white (#ffffff) and shorten the input text if it contains hundreds of characters.",
      },
      {
        symptom: "The printed QR code looks blurry on a poster",
        solution:
          "Low-resolution PNGs blur when stretched across large print layouts. Re-download the QR code as an SVG vector file or increase the PNG size to 1024 px.",
      },
    ],
    faqs: [
      {
        question: "Will a QR code created on OneToolHub ever expire?",
        answer:
          "Never. OneToolHub generates 100% static QR codes locally in your browser. As long as your destination website URL remains live, the QR code will work forever.",
      },
      {
        question: "How much text can a QR code hold?",
        answer:
          "While the QR specification supports up to several thousand characters, practical smartphone scannability is best under 300 characters. The tool supports up to 2,000 characters.",
      },
      {
        question: "Does OneToolHub track who scans my QR code?",
        answer:
          "No. Because your URL is encoded directly into the QR image without any middleman redirect server, OneToolHub has zero visibility into when or where your code is scanned.",
      },
    ],
    conclusion: {
      heading: "Generate Permanent, High-Contrast QR Codes in Seconds",
      paragraphs: [
        "By sticking to static encoding, high-contrast colors, and vector SVG exports for print, you can publish QR codes with confidence that they will never break or expire.",
      ],
      ctaLabel: "Open QR Code Generator",
    },
  },
  {
    slug: "how-to-count-words-and-estimate-reading-time",
    title: "How to Count Words and Estimate Reading Time",
    seoTitle:
      "How to Count Words, Characters & Estimate Reading Time Accurately",
    metaDescription:
      "Learn how word counters segment text, the difference between character counts with and without spaces, and how to calculate reading time for essays, articles, and video scripts.",
    excerpt:
      "Master word and character limits for academic essays, SEO meta descriptions, and social posts, and learn the exact formula used to estimate reading time.",
    categoryId: "student-resources",
    categoryLabel: "Student Resources",
    icon: "FileText",
    readingTimeMinutes: 5,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: false,
    primaryToolSlug: "word-counter",
    relatedToolSlugs: [
      "gpa-calculator",
      "youtube-timestamp-formatter",
      "pdf-merge-split",
    ],
    relatedArticleSlugs: [
      "how-to-calculate-college-gpa-credit-hours",
      "how-to-format-youtube-timestamps-and-chapters",
    ],
    keywords: [
      "how to count words and estimate reading time",
      "words per minute reading time formula",
      "character count with vs without spaces",
      "essay word count checker",
      "script reading time calculator",
    ],
    introduction: [
      "Whether you are trimming a university admissions essay to fit a strict 650-word limit, writing an SEO meta description under 160 characters, or pacing a 5-minute YouTube video script, accurate text metrics keep your writing focused.",
      "This guide explains how browser word counters segment words, sentences, and paragraphs across languages, and shows you how to calculate silent reading time versus spoken presentation time.",
    ],
    problemSolved: {
      heading: "Why Different Editors Report Slightly Different Counts",
      paragraphs: [
        "Writers often notice that pasting the same draft into different tools can yield word counts that differ by a few words, or they get confused when an online portal rejects a submission based on 'characters (with spaces)' versus 'characters (no spaces)'.",
        "Understanding how modern Unicode text segmentation works—and how reading speed formulas translate word count into minutes and seconds—helps you hit every submission limit cleanly.",
      ],
      keyTakeaways: [
        "Silent reading time is standardized around 200 words per minute (WPM) for general web and academic text.",
        "Spoken presentation or video narration is slower, typically averaging 130 to 150 words per minute.",
        "Characters (with spaces) counts every keystroke including spaces and line breaks; Characters (no spaces) strips all whitespace.",
        "Modern browsers use ECMAScript Intl.Segmenter to detect word and sentence boundaries across Unicode scripts.",
      ],
    },
    steps: [
      {
        stepTitle: "Paste or Type Your Draft into the Word Counter",
        stepDescription:
          "Open the OneToolHub Word Counter and type or paste your essay, article, abstract, or script directly into the text area.",
      },
      {
        stepTitle: "Check Words and Both Character Metrics",
        stepDescription:
          "Review the top stat cards for Total Words, Characters (with spaces), and Characters (no spaces) to verify compliance with your assignment or platform limit.",
      },
      {
        stepTitle: "Review Sentence Count, Paragraphs, and Reading Time",
        stepDescription:
          "Use the Sentences and Paragraphs counts to spot overly long blocks of text, and check the Estimated Reading Time card (calculated at 200 WPM).",
        proTip:
          "If you are timing a spoken voiceover script, add roughly 30%–40% more time to the 200 WPM silent reading estimate to account for natural pauses.",
      },
      {
        stepTitle: "Copy Your Edited Text or Export as .txt",
        stepDescription:
          "Once your draft hits the target length, click 'Copy Text' to paste it back into your submission form or click 'Download .txt' to save a local backup.",
      },
    ],
    practicalExample: {
      title: "Calculating Reading Time and Character Caps for a 500-Word Abstract",
      scenario:
        "A graduate student drafts a 480-word conference abstract and needs to know the silent reading time and whether it fits inside a 3,200-character submission portal field.",
      inputLabel: "Draft Metrics",
      inputSample:
        "Words: 480 | Characters (with spaces): 3,110 | Characters (no spaces): 2,631 | Paragraphs: 3",
      outputLabel: "Calculated Reading Time (at 200 WPM)",
      outputSample:
        "480 words ÷ 200 WPM = 2.4 minutes → Displayed as ~3 min read (ceiling minutes for articles >= 1 min)",
      explanation:
        "Because almost all web submission forms validate maximum field length using total characters including spaces (3,110 <= 3,200), checking 'Characters (with spaces)' confirms the abstract will not be truncated.",
    },
    commonMistakes: [
      {
        mistake: "Checking 'Characters (no spaces)' for web form or social limits",
        whyItHappens:
          "Writers look at the smaller character number, forgetting that HTML maxlength attributes and database columns count every space and newline character.",
        howToFix:
          "Always use 'Characters (with spaces)' when checking limits for web forms, meta descriptions, and social posts unless the guidelines explicitly state 'excluding spaces'.",
      },
      {
        mistake: "Using silent reading speed (200 WPM) to time a live speech",
        whyItHappens:
          "People read silently much faster than they speak aloud.",
        howToFix:
          "For a 5-minute spoken speech or YouTube narration, aim for 650 to 750 words (130–150 WPM) rather than 1,000 words.",
      },
    ],
    troubleshooting: [
      {
        symptom: "Paragraph count is 1 even though my text has line breaks",
        solution:
          "Standard paragraph counters group lines into a single paragraph unless they are separated by at least one blank line (or distinct paragraph breaks). Check your line spacing.",
      },
      {
        symptom: "Word counts in CJK (Chinese, Japanese, Korean) scripts differ across apps",
        solution:
          "Because scripts without spaces between words rely on algorithmic dictionary segmentation (Intl.Segmenter), treat word counts in non-space-delimited languages as estimates and verify character counts instead.",
      },
    ],
    faqs: [
      {
        question: "How many words is a 5-minute read?",
        answer:
          "At an average silent reading speed of 200 words per minute, a 5-minute article is approximately 1,000 words.",
      },
      {
        question: "How are hyphenated words or contractions counted?",
        answer:
          "Using standard Unicode word segmentation (Intl.Segmenter), contractions like \"don't\" are counted as a single word, while punctuation marks and whitespace are excluded from the word count.",
      },
      {
        question: "Does OneToolHub store or train AI on the text I paste?",
        answer:
          "No. Your text is counted strictly inside your browser's local memory and is never sent over the network.",
      },
    ],
    conclusion: {
      heading: "Measure Your Writing Instantly and Privately",
      paragraphs: [
        "Whether you are editing an academic paper, a blog tutorial, or a video script, checking live word, character, and reading-time metrics helps you deliver clear, concise writing on time.",
      ],
      ctaLabel: "Open Word Counter",
    },
  },
  {
    slug: "how-to-format-youtube-timestamps-and-chapters",
    title: "How to Format YouTube Timestamps and Chapters",
    seoTitle:
      "How to Format YouTube Timestamps & Video Chapters (4 Official Rules)",
    metaDescription:
      "Step-by-step guide to formatting YouTube video chapters and fixing broken timestamps. Learn the 00:00 start rule, minimum 3 chapters, 10-second duration, and chronological sorting.",
    excerpt:
      "Learn YouTube's four mandatory chapter requirements, convert messy editing notes into clean MM:SS or HH:MM:SS chapter blocks, and fix chapters that fail to appear on your video.",
    categoryId: "youtube-creator-guides",
    categoryLabel: "YouTube Creator Guides",
    icon: "Clock",
    readingTimeMinutes: 6,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: true,
    primaryToolSlug: "youtube-timestamp-formatter",
    relatedToolSlugs: ["image-compressor", "word-counter", "qr-code-generator"],
    relatedArticleSlugs: [
      "how-to-compress-images-for-web",
      "how-to-count-words-and-estimate-reading-time",
    ],
    keywords: [
      "how to format youtube timestamps",
      "youtube chapters not working fix",
      "youtube chapter requirements 00:00 10 seconds",
      "format youtube video description chapters",
      "youtube timestamp formatter online",
    ],
    introduction: [
      "Video chapters divide a YouTube progress bar into labeled segments so viewers can jump directly to the section they need—and they allow search engines to surface key moments from your video in search results.",
      "Yet one of the most common frustrations for creators is pasting a list of timestamps into a video description only to find that YouTube ignores them completely. This guide covers YouTube's four strict chapter validation rules and shows how to clean and verify your timestamp list in seconds.",
    ],
    problemSolved: {
      heading: "Why YouTube Rejects Video Chapter Lists Silently",
      paragraphs: [
        "YouTube Studio does not show an error popup when your description timestamps violate chapter formatting rules; instead, the video player simply falls back to a plain scrub bar. A single missing 00:00 intro line, two chapters that are only 8 seconds apart, or an out-of-order timestamp will disable manual chapters across the entire video.",
        "In addition, video editors often export rough marker notes with inconsistent separators (such as 'Intro - 0:00' or '[01:25] — Setup') that take tedious manual editing to clean up.",
      ],
      keyTakeaways: [
        "Rule 1: The very first chapter timestamp must start at 00:00.",
        "Rule 2: Your description must include at least 3 timestamps.",
        "Rule 3: Timestamps must be listed in strictly ascending chronological order.",
        "Rule 4: Every chapter must be at least 10 seconds long.",
      ],
    },
    steps: [
      {
        stepTitle: "Paste Your Raw Editing Notes or Timestamps",
        stepDescription:
          "Open the OneToolHub YouTube Timestamp Formatter and paste your raw chapter lines. The parser accepts timestamps at the start ('01:15 Setup') or end ('Setup - 01:15') of each line.",
      },
      {
        stepTitle: "Inspect the Four-Point YouTube Eligibility Checklist",
        stepDescription:
          "Check the four badge indicators at the top of the workspace: Starts at 00:00, Minimum 3 Chapters, Chronological Order, and 10s+ Chapter Length.",
      },
      {
        stepTitle: "Enable Auto-Sort or Fix Flagged Warnings",
        stepDescription:
          "If your editing notes are out of order, toggle 'Auto-Sort Chronologically'. If any chapter is shorter than 10 seconds or missing a title, update that line in the input editor.",
        proTip:
          "When any timestamp in your list reaches 1 hour or longer (e.g., 01:02:15), the formatter automatically normalizes every line in the list to HH:MM:SS for uniform alignment.",
      },
      {
        stepTitle: "Copy and Paste into Your YouTube Video Description",
        stepDescription:
          "Click 'Copy All Chapters' and paste the clean block into your YouTube video description inside YouTube Studio.",
      },
    ],
    practicalExample: {
      title: "Fixing a Broken Chapter List from Rough Editing Notes",
      scenario:
        "A creator pastes four raw notes where the intro is labeled 0:05 instead of 00:00, separators are inconsistent, and two chapters are out of chronological order.",
      inputLabel: "Raw Editing Notes (Fails YouTube Validation)",
      inputSample: `0:05 - Welcome & Overview\n03:40 — Live Coding Demo\n1:20 — Environment Setup\n08:15 - Final Summary`,
      outputLabel: "Normalized & Validated Output (Starts at 00:00 + Sorted)",
      outputSample: `00:00 Welcome & Overview\n01:20 Environment Setup\n03:40 Live Coding Demo\n08:15 Final Summary`,
      explanation:
        "Changing the first timestamp to 00:00, sorting the 01:20 chapter before 03:40, and stripping the inconsistent dashes produces a clean block that satisfies all four YouTube chapter rules.",
    },
    commonMistakes: [
      {
        mistake: "Starting the first chapter at 00:01 or 00:05 instead of 00:00",
        whyItHappens:
          "Creators often timestamp the moment they start speaking after a 3-second intro bumper.",
        howToFix:
          "Always place your first chapter at exactly 00:00 (for example, '00:00 Intro').",
      },
      {
        mistake: "Creating micro-chapters shorter than 10 seconds",
        whyItHappens:
          "Fast-paced tutorials sometimes list rapid cuts (e.g., 02:10 Step A and 02:16 Step B).",
        howToFix:
          "Combine segments that are less than 10 seconds apart so every consecutive gap is at least 10 seconds.",
      },
      {
        mistake: "Using periods instead of colons (01.30 instead of 01:30)",
        whyItHappens:
          "Typing a decimal point by accident on a numeric keypad.",
        howToFix:
          "Always separate minutes and seconds with a standard colon (:).",
      },
    ],
    troubleshooting: [
      {
        symptom:
          "All 4 checklist badges are green, but chapters still don't show on YouTube",
        solution:
          "Allow a few minutes after saving in YouTube Studio for player metadata to refresh. Also check Video Details > Show More > Automatic Chapters in YouTube Studio, and note that channels with active community guidelines strikes or restricted content may not display chapters.",
      },
      {
        symptom: "Warning: Duplicate timestamp detected",
        solution:
          "Two chapters cannot share the exact same second. Adjust one of the duplicate timestamps so they are at least 10 seconds apart.",
      },
    ],
    faqs: [
      {
        question: "Do I need to write 00:00 or 0:00?",
        answer:
          "YouTube accepts both 0:00 and 00:00, as well as 00:00:00 for long videos. Our formatter normalizes timestamps to clean two-digit MM:SS (or HH:MM:SS) so your description looks tidy and consistent.",
      },
      {
        question: "Can I put the timestamp at the end of the line instead of the start?",
        answer:
          "YouTube recommends placing the timestamp at the beginning of each line (e.g., '00:00 Intro'). Even if your raw notes have timestamps at the end, the OneToolHub formatter automatically moves them to the front.",
      },
      {
        question: "How many chapters should a YouTube video have?",
        answer:
          "YouTube requires a minimum of 3 chapters. For most 10-to-20-minute tutorials, 5 to 10 descriptive chapters provide a great viewer experience without cluttering the progress bar.",
      },
    ],
    conclusion: {
      heading: "Publish Error-Free YouTube Chapters Every Time",
      paragraphs: [
        "Validating your timestamps before hitting Publish in YouTube Studio saves you from broken video descriptions and helps viewers navigate your content effortlessly.",
      ],
      ctaLabel: "Open YouTube Timestamp Formatter",
    },
  },
  {
    slug: "how-to-calculate-college-gpa-credit-hours",
    title: "How to Calculate College GPA Using Credit Hours",
    seoTitle:
      "How to Calculate College GPA Using Credit Hours (Formula & Examples)",
    metaDescription:
      "Learn the exact weighted college GPA formula using credit hours and quality points. Includes step-by-step 4.0 and 5.0 scale examples, semester vs. cumulative GPA, and plus/minus grade variations.",
    excerpt:
      "Understand how credit hours weight your courses, walk through a complete semester and cumulative GPA calculation, and customize plus/minus grade values for your university.",
    categoryId: "student-resources",
    categoryLabel: "Student Resources",
    icon: "GraduationCap",
    readingTimeMinutes: 6,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: true,
    primaryToolSlug: "gpa-calculator",
    relatedToolSlugs: ["word-counter", "pdf-merge-split", "image-compressor"],
    relatedArticleSlugs: [
      "how-to-count-words-and-estimate-reading-time",
      "how-to-merge-and-split-pdf-files-online",
    ],
    keywords: [
      "how to calculate college gpa using credit hours",
      "weighted gpa formula quality points",
      "semester vs cumulative gpa calculation",
      "4.0 and 5.0 gpa scale table",
      "3.67 vs 3.70 a minus gpa scale",
    ],
    introduction: [
      "In university and college, not all classes affect your Grade Point Average (GPA) equally. A 4-credit laboratory science or engineering course carries four times the weight of a 1-credit seminar. Simply averaging the point values of your letter grades without multiplying by credit hours produces an inaccurate unweighted number.",
      "This tutorial breaks down the official weighted GPA formula used by university registrars, shows a complete worked example, and explains how to handle custom institutional grading scales.",
    ],
    problemSolved: {
      heading: "Why Simple Grade Averaging Gives the Wrong College GPA",
      paragraphs: [
        "If you earn an A (4.0) in a 1-credit physical education elective and a C (2.0) in a 4-credit Calculus course, a simple average would suggest a 3.00 GPA. In reality, because Calculus represents four out of your five total credit hours, your true weighted GPA is 2.40.",
        "Additionally, colleges worldwide differ on plus/minus grade values—some registrars define A- as 3.70 and B+ as 3.30, while others define A- as 3.67 and B+ as 3.33, or use a 5.0 scale for honors programs.",
      ],
      keyTakeaways: [
        "Quality Points for a course = Grade Point Value × Course Credit Hours.",
        "Weighted GPA = Total Quality Points ÷ Total Credit Hours.",
        "Cumulative GPA divides total quality points across all semesters by total credit hours across all semesters (do not simply average two semester GPAs if credit loads differ).",
        "Always match the plus/minus grade point table to your university's official academic catalog.",
      ],
    },
    steps: [
      {
        stepTitle: "Select Your Grading Scale and Check Plus/Minus Values",
        stepDescription:
          "Open the OneToolHub GPA Calculator, choose the 4.0 or 5.0 scale preset, and expand the Grade-to-Point Mapping table if your college uses custom values (such as 3.67 for A-).",
      },
      {
        stepTitle: "Enter Each Course Name, Credit Hours, and Letter Grade",
        stepDescription:
          "For every graded course in your term, enter the credit hour weight (for example, 3, 4, or 1.5 credits) and select the earned letter grade.",
      },
      {
        stepTitle: "Add Additional Semesters for Cumulative GPA",
        stepDescription:
          "If you want to compute your overall multi-term GPA, click 'Add Another Semester for Cumulative GPA' and enter your courses for each term.",
        proTip:
          "Because the calculator weights every course across all semesters by its exact credit hours, your cumulative GPA stays accurate even if you took 12 credits in Fall and 18 credits in Spring.",
      },
      {
        stepTitle: "Inspect the Worked Quality-Point Breakdown",
        stepDescription:
          "Review your Semester GPA, Cumulative GPA, Total Credit Hours, and the worked formula breakdown showing quality points per course.",
      },
    ],
    practicalExample: {
      title: "Worked 4-Course Semester Weighted GPA Calculation (4.0 Scale)",
      scenario:
        "A sophomore takes four courses totaling 14 credit hours on a standard 4.0 scale (A = 4.0, A- = 3.7, B+ = 3.3, B = 3.0):",
      inputLabel: "Course List & Quality Points",
      inputSample: `1. Computer Systems (4 credits, Grade A = 4.0)   → 4 × 4.0 = 16.00 quality points\n2. Discrete Math (4 credits, Grade B+ = 3.3)      → 4 × 3.3 = 13.20 quality points\n3. Macroeconomics (3 credits, Grade A- = 3.7)     → 3 × 3.7 = 11.10 quality points\n4. Academic Writing (3 credits, Grade B = 3.0)    → 3 × 3.0 =  9.00 quality points`,
      outputLabel: "Weighted GPA Calculation",
      outputSample: `Total Quality Points = 16.00 + 13.20 + 11.10 + 9.00 = 49.30\nTotal Credit Hours   = 4 + 4 + 3 + 3 = 14 credits\nSemester GPA         = 49.30 ÷ 14 = 3.5214... → 3.52 GPA`,
      explanation:
        "Dividing 49.30 total quality points by 14 total credit hours gives a weighted semester GPA of 3.52.",
    },
    commonMistakes: [
      {
        mistake: "Averaging two semester GPAs instead of weighting by credits",
        whyItHappens:
          "Students take Semester 1 GPA (e.g., 3.20 on 12 credits) and Semester 2 GPA (e.g., 3.80 on 18 credits) and divide (3.20 + 3.80) / 2 = 3.50.",
        howToFix:
          "Weight by total credits: ((3.20 × 12) + (3.80 × 18)) ÷ (12 + 18) = (38.40 + 68.40) ÷ 30 = 3.56 Cumulative GPA.",
      },
      {
        mistake: "Including Pass/Fail (P/NP) or Audit courses with 0 grade points",
        whyItHappens:
          "Entering a 'Pass' course as 0.0 grade points treats it like an F (failing grade) and drags down your GPA.",
        howToFix:
          "Most registrars exclude Pass/No-Pass and Withdrawal (W) courses from the GPA denominator. Only enter courses that receive letter grades impacting your GPA.",
      },
    ],
    troubleshooting: [
      {
        symptom:
          "My calculated GPA differs from my transcript by 0.01 or 0.02",
        solution:
          "Check your university syllabus or registrar website to see whether your institution assigns 3.67/3.33/2.67 or 3.70/3.30/2.70 for plus/minus grades, and update the Grade-to-Point Mapping table accordingly.",
      },
      {
        symptom: "Validation message: Credit hours must be greater than zero",
        solution:
          "Every graded course row requires a positive credit hour number (such as 0.5, 1, 3, or 4). Remove unused blank rows or non-credit labs.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between a 4.0 scale and a 5.0 scale?",
        answer:
          "A standard collegiate scale caps an A at 4.0 points. Some high schools and international universities use a 5.0 scale (either for honors/AP courses or as their baseline scale where A = 5.0, B = 4.0, C = 3.0).",
      },
      {
        question: "Does an A+ give 4.3 or 4.0 points in college?",
        answer:
          "At most universities on a 4.0 scale, both A and A+ are worth 4.00 points, though a few schools award 4.30 or 4.33. You can edit the A+ value in the Grade-to-Point Mapping panel to match your school.",
      },
      {
        question: "Are my grades saved on any server?",
        answer:
          "No. Your course list and GPA calculations run 100% locally in your browser.",
      },
    ],
    conclusion: {
      heading: "Plan Your Target Semester and Cumulative GPA with Precision",
      paragraphs: [
        "Knowing the exact weighted formula lets you test 'what-if' grade scenarios before final exams and verify your academic standing with confidence.",
      ],
      ctaLabel: "Open GPA Calculator",
    },
  },
  {
    slug: "how-to-create-professional-freelance-invoice",
    title: "How to Create a Professional Freelance Invoice",
    seoTitle:
      "How to Create a Professional Freelance Invoice (Checklist & PDF Guide)",
    metaDescription:
      "Learn what every freelance invoice must include to get paid on time, how to calculate discounts and taxes without rounding errors, and how to export clean PDF invoices in your browser.",
    excerpt:
      "Follow a practical checklist of essential freelance invoice fields, avoid floating-point tax and discount rounding discrepancies, and export selectable-text PDF invoices locally.",
    categoryId: "freelancer-resources",
    categoryLabel: "Freelancer Resources",
    icon: "Receipt",
    readingTimeMinutes: 6,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: true,
    primaryToolSlug: "invoice-generator",
    relatedToolSlugs: [
      "pdf-merge-split",
      "qr-code-generator",
      "word-counter",
    ],
    relatedArticleSlugs: [
      "how-to-merge-and-split-pdf-files-online",
      "how-to-create-qr-code-for-website",
    ],
    keywords: [
      "how to create a professional freelance invoice",
      "what to include on a freelance invoice",
      "calculate invoice discount and tax",
      "free freelance pdf invoice generator",
      "multi currency client invoice guide",
    ],
    introduction: [
      "For independent freelancers, consultants, and agencies, an invoice is more than a payment request—it is a formal accounting document that client finance teams need in order to approve and release your payout.",
      "Missing an invoice number, omitting a clear payment due date, or sending an unformatted email with rounding errors often delays payment by weeks. This guide covers every field a professional freelance invoice requires and shows how to generate a clean, print-ready PDF directly in your browser.",
    ],
    problemSolved: {
      heading: "Eliminating Payment Delays and Spreadsheet Math Errors",
      paragraphs: [
        "Corporate accounts-payable departments routinely hold invoices that lack a unique reference ID, itemized deliverables, or clear currency codes. Meanwhile, building invoices manually in word processors often leads to broken table layouts and miscalculated tax or discount totals.",
        "Many online invoice makers also require account registration, watermark your exported PDF, or store your private client rates on remote servers. Generating invoices locally in your browser gives you instant PDF exports with complete billing privacy.",
      ],
      keyTakeaways: [
        "Every invoice needs a unique sequential Invoice Number (e.g., INV-2026-014), Issue Date, and explicit Due Date.",
        "Itemize deliverables with clear descriptions, quantities/hours, unit rates, and line-item totals.",
        "Apply discounts to the subtotal first before calculating percentage tax on the discounted taxable amount.",
        "Specify the three-letter ISO 4217 currency code (such as USD, EUR, GBP, CAD, AUD, INR, PKR, AED, or JPY) to avoid cross-border confusion.",
      ],
    },
    steps: [
      {
        stepTitle: "Select Your Template, Invoice Number, and Currency",
        stepDescription:
          "Open the OneToolHub Professional Invoice Generator, pick between 'Modern Indigo' and 'Classic Executive', set a unique invoice number, and choose your billing currency.",
      },
      {
        stepTitle: "Complete Sender and Client Billing Information",
        stepDescription:
          "Enter your name or studio name, email, and address in the 'From' section, and enter your client's legal company name, billing contact, and address in the 'Bill To' section.",
        proTip:
          "If you bill repeat clients from your own computer, you can toggle 'Save draft in browser localStorage' so your sender details are ready next time without uploading data anywhere.",
      },
      {
        stepTitle: "Add Itemized Deliverables, Discounts, and Taxes",
        stepDescription:
          "List each milestone or hourly service with quantity and unit price. Configure an optional percentage or fixed discount and any applicable tax percentage.",
      },
      {
        stepTitle: "Add Payment Terms and Download Your PDF",
        stepDescription:
          "Include clear payment instructions (such as bank wire/ACH details or Net 14 / Net 30 terms) in the Notes box, then click 'Download PDF' or 'Print Invoice'.",
      },
    ],
    practicalExample: {
      title: "Calculating a Milestone Invoice with a 10% Discount and 8% Tax",
      scenario:
        "A freelance developer bills a client in USD for two deliverables, applies a 10% retainer discount, and charges 8% local sales tax:",
      inputLabel: "Itemized Deliverables",
      inputSample: `1. Frontend Architecture & UI Components: 20 hrs × $85.00 = $1,700.00\n2. Performance Audit & SEO Setup:          1 flat × $800.00 =   $800.00`,
      outputLabel: "Minor-Unit Integer Calculation Breakdown",
      outputSample: `Subtotal:             $2,500.00\nDiscount (10%):       − $250.00\nTaxable Amount:       $2,250.00\nTax (8% of $2,250):   + $180.00\nTotal Due:            $2,430.00`,
      explanation:
        "By converting all prices into integer cents before computing line totals, discounts, and tax, the calculator avoids JavaScript floating-point artifacts (like 0.1 + 0.2 = 0.30000000000000004) and produces exact cent-level totals.",
    },
    commonMistakes: [
      {
        mistake: "Writing vague line items like 'Web work — $2,500'",
        whyItHappens:
          "Freelancers rush through billing after finishing a project.",
        howToFix:
          "Break work into specific milestones or hours (e.g., 'Homepage Responsive Build — 15 hrs @ $80/hr') so client accounting teams can verify the scope immediately.",
      },
      {
        mistake: "Using '$' without specifying USD, CAD, or AUD for international clients",
        whyItHappens:
          "Multiple countries use the dollar symbol ($).",
        howToFix:
          "Select the explicit ISO currency code (USD, CAD, AUD, etc.) so both the symbol and currency code context are unambiguous.",
      },
      {
        mistake: "Setting the Due Date earlier than the Issue Date",
        whyItHappens:
          "Typo when selecting calendar dates at the change of a month.",
        howToFix:
          "Ensure the Due Date is equal to or later than the Issue Date (the tool validates this automatically).",
      },
    ],
    troubleshooting: [
      {
        symptom: "Download PDF button is disabled or shows a validation error",
        solution:
          "Check the validation summary banner: verify that Sender Name, Client Name, and Invoice Number are filled in, all quantities and unit prices are non-negative, and the Due Date is not before the Issue Date.",
      },
      {
        symptom: "My invoice has 15+ line items and spans multiple pages",
        solution:
          "Both the built-in PDF generator and the print stylesheet automatically paginate long item tables and add 'Page X of Y' footers so nothing is clipped.",
      },
    ],
    faqs: [
      {
        question: "Does the downloaded PDF contain selectable text?",
        answer:
          "Yes. The tool generates a true vector PDF with selectable text and clean typography rather than a blurry screenshot image.",
      },
      {
        question: "Can I attach a signed contract to my invoice PDF?",
        answer:
          "Yes! After downloading your invoice PDF, open the OneToolHub PDF Merge & Split tool to combine your invoice and contract appendix into a single PDF packet.",
      },
      {
        question: "Are my client names or invoice amounts uploaded to a server?",
        answer:
          "Never. All calculations and PDF file generation happen locally inside your web browser.",
      },
    ],
    conclusion: {
      heading: "Send Clear, Accurate Client Invoices Without Subscriptions",
      paragraphs: [
        "A well-structured PDF invoice with itemized deliverables, accurate tax math, and clear payment terms sets a professional standard and helps you get paid faster.",
      ],
      ctaLabel: "Open Professional Invoice Generator",
    },
  },
  {
    slug: "how-to-merge-and-split-pdf-files-online",
    title: "How to Merge and Split PDF Files Online",
    seoTitle:
      "How to Merge and Split PDF Files Online Locally in Your Browser",
    metaDescription:
      "Learn how to combine multiple PDF documents into one file or extract custom page ranges (e.g., 1-3, 5, 7-10) directly in your browser without uploading sensitive files to a cloud server.",
    excerpt:
      "Combine contracts, invoices, and lecture slides in any order or extract custom page ranges locally in your browser without uploading confidential PDFs to remote servers.",
    categoryId: "image-pdf-guides",
    categoryLabel: "Image & PDF Guides",
    icon: "Files",
    readingTimeMinutes: 6,
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-08",
    featured: false,
    primaryToolSlug: "pdf-merge-split",
    relatedToolSlugs: [
      "invoice-generator",
      "image-compressor",
      "gpa-calculator",
    ],
    relatedArticleSlugs: [
      "how-to-create-professional-freelance-invoice",
      "how-to-compress-images-for-web",
    ],
    keywords: [
      "how to merge and split pdf files online",
      "merge pdf in browser without uploading",
      "extract specific pages from pdf 1-3 5",
      "combine pdf documents locally",
      "safe client side pdf merger",
    ],
    introduction: [
      "PDF (Portable Document Format) is the universal standard for sharing contracts, tax forms, academic papers, and client invoices because it preserves layout across every operating system. However, combining separate PDF attachments into a single packet—or extracting three specific pages from a 100-page report—often requires either expensive desktop software or uploading confidential files to third-party cloud portals.",
      "This guide shows how to merge multiple PDFs and extract custom page ranges directly inside your browser using local memory buffers so your documents never leave your device.",
    ],
    problemSolved: {
      heading: "Why Local Browser PDF Processing Matters for Document Privacy",
      paragraphs: [
        "Most traditional 'free online PDF' websites upload your files to remote servers, process them in the cloud, and store temporary copies on external disks. While convenient for public brochures, uploading signed NDAs, bank statements, medical forms, or graded transcripts to unknown servers introduces unnecessary privacy risk.",
        "By running PDF page assembly inside your browser tab via JavaScript array buffers, you get instant merging and splitting with zero network upload time and complete local control.",
      ],
      keyTakeaways: [
        "Merge Mode combines 2 to 25 unencrypted PDF files (up to 100 MB total and 500 pages) in any custom sequence.",
        "Split Mode extracts flexible 1-based page ranges such as '1-3, 5, 7-10' or interactive page selections.",
        "You can export extracted pages as one combined PDF document or as separate individual PDF files per range.",
        "Files remain strictly in local browser memory and are cleared when you reset or close the tab.",
      ],
    },
    steps: [
      {
        stepTitle: "Choose Between Merge PDFs and Split / Extract Pages",
        stepDescription:
          "Open the OneToolHub PDF Merge & Split tool and select 'Merge PDFs' at the top to combine multiple files, or 'Split / Extract Pages' to pull specific pages from one PDF.",
        proTip:
          "Click 'Load Sample PDFs' if you want to test reordering and page-range extraction with sample multi-page documents right away.",
      },
      {
        stepTitle: "Add Your Unencrypted PDF Documents",
        stepDescription:
          "Drag and drop your .pdf files into the upload zone. The tool automatically verifies the %PDF- header and displays the exact page count and byte size for each file.",
      },
      {
        stepTitle: "Reorder Files (Merge) or Enter Page Ranges (Split)",
        stepDescription:
          "In Merge Mode, use the Up and Down arrow buttons to arrange the exact document order. In Split Mode, type ranges like '1-3, 5, 8-10' or click individual page pills.",
      },
      {
        stepTitle: "Generate and Download Your Output PDFs",
        stepDescription:
          "Click 'Merge PDFs Now' or 'Extract PDF Pages' to assemble the new document in browser memory, then click 'Download' to save it to your computer.",
      },
    ],
    practicalExample: {
      title: "Extracting Selected Chapters and an Appendix Using Page Range Syntax",
      scenario:
        "A student has a 24-page course syllabus PDF and needs to extract the cover sheet (page 1), the reading schedule (pages 4 through 7), and the grading rubric (page 22) into a single study file.",
      inputLabel: "Split Mode Configuration",
      inputSample:
        "Source File: course-packet.pdf (24 pages) | Page Range Input: 1, 4-7, 22 | Output Mode: Combine into one PDF",
      outputLabel: "Extracted Output Document",
      outputSample:
        "course-packet-extracted-6p.pdf — 6 pages total (original pages 1, 4, 5, 6, 7, and 22 in order)",
      explanation:
        "The range parser validates that every number is between 1 and 24, deduplicates overlapping selections, and copies those exact 6 pages into a clean new PDF file.",
    },
    commonMistakes: [
      {
        mistake: "Attempting to merge password-protected (encrypted) PDFs",
        whyItHappens:
          "Bank statements and official transcripts are often locked with an open or owner password.",
        howToFix:
          "Open the encrypted PDF in your system viewer (such as macOS Preview or Chrome PDF Viewer), print/save an unencrypted copy first, and then merge or split it.",
      },
      {
        mistake: "Entering page numbers that exceed the document's page count",
        whyItHappens:
          "Typing '1-15' on a 12-page PDF or using printed book page numbers instead of PDF page indices.",
        howToFix:
          "Check the 'Total Pages' badge shown next to your uploaded file and keep all range numbers between 1 and the total page count.",
      },
      {
        mistake: "Writing descending ranges like '5-2'",
        whyItHappens:
          "Accidental typo when specifying a multi-page span.",
        howToFix:
          "Always write ranges in ascending order from start page to end page (e.g., '2-5').",
      },
    ],
    troubleshooting: [
      {
        symptom:
          "Error: This PDF is encrypted or password-protected",
        solution:
          "Client-side page copying requires unencrypted PDF structures. Remove the password in your local PDF reader before uploading.",
      },
      {
        symptom: "Error: Invalid PDF file header (%PDF- signature missing)",
        solution:
          "The uploaded file has a .pdf extension but is actually a Word document (.docx), HTML page, or corrupted download. Re-export the file as a genuine PDF.",
      },
    ],
    faqs: [
      {
        question: "Can I extract ranges as separate PDF files instead of one combined PDF?",
        answer:
          "Yes. In Split Mode, switch the Output Mode toggle to 'Separate PDF per range'. Entering '1-3, 4-6' will generate two separate downloadable PDF files (pages 1–3 and pages 4–6).",
      },
      {
        question: "Does merging PDFs reduce the resolution of text or images?",
        answer:
          "No. The tool copies the underlying PDF page objects directly into the new document without re-rasterizing or re-compressing your text or embedded graphics.",
      },
      {
        question: "What happens to cryptographic digital signatures when merging?",
        answer:
          "Because cryptographic PDF signatures validate the exact byte range of the original standalone file, combining or splitting pages produces a new unsigned PDF document while preserving visible page graphics.",
      },
    ],
    conclusion: {
      heading: "Combine and Extract PDF Pages Safely on Your Own Device",
      paragraphs: [
        "Whether you are assembling a freelance contract packet or pulling key pages from a lecture deck, browser-based PDF merging and splitting keeps your workflow fast and your files private.",
      ],
      ctaLabel: "Open PDF Merge & Split Tool",
    },
  },
] as const;

export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((article) => article.slug === slug);
}

export function getArticleForTool(toolSlug: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((article) => article.primaryToolSlug === toolSlug);
}

export function getRelatedArticlesForTool(
  toolSlug: string,
  limit = 3
): LearnArticle[] {
  const primary = getArticleForTool(toolSlug);
  const secondary = LEARN_ARTICLES.filter(
    (article) =>
      article.primaryToolSlug !== toolSlug &&
      article.relatedToolSlugs.includes(
        toolSlug as LearnArticle["primaryToolSlug"]
      )
  );
  const others = LEARN_ARTICLES.filter(
    (article) =>
      article.primaryToolSlug !== toolSlug && !secondary.includes(article)
  );

  const combined = [
    ...(primary ? [primary] : []),
    ...secondary,
    ...others,
  ];
  return combined.slice(0, limit);
}

export function getRelatedArticles(
  currentSlug: string,
  limit = 3
): LearnArticle[] {
  const current = getArticleBySlug(currentSlug);
  const others = LEARN_ARTICLES.filter(
    (article) => article.slug !== currentSlug
  );

  if (!current) {
    return others.slice(0, limit);
  }

  const explicitRelated = current.relatedArticleSlugs
    .map((slug) => getArticleBySlug(slug))
    .filter((item): item is LearnArticle => Boolean(item));

  const remaining = others.filter(
    (article) => !explicitRelated.some((rel) => rel.slug === article.slug)
  );

  const sortedRemaining = [...remaining].sort((a, b) => {
    const aSameCat = a.categoryId === current.categoryId ? 0 : 1;
    const bSameCat = b.categoryId === current.categoryId ? 0 : 1;
    return aSameCat - bSameCat;
  });

  return [...explicitRelated, ...sortedRemaining].slice(0, limit);
}

export function getLearnArticleSummaries(): LearnArticleSummary[] {
  return LEARN_ARTICLES.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    categoryId: article.categoryId,
    categoryLabel: article.categoryLabel,
    icon: article.icon,
    readingTimeMinutes: article.readingTimeMinutes,
    featured: article.featured,
    primaryToolSlug: article.primaryToolSlug,
    keywords: article.keywords,
  }));
}

export function filterArticles<T extends LearnArticleSummary>(
  articles: readonly T[],
  query: string,
  categoryId: LearnCategoryId | "all" = "all"
): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  return articles.filter((article) => {
    const matchesCategory =
      categoryId === "all" || article.categoryId === categoryId;
    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const inTitle = article.title.toLowerCase().includes(normalizedQuery);
    const inExcerpt = article.excerpt.toLowerCase().includes(normalizedQuery);
    const inCategory = article.categoryLabel
      .toLowerCase()
      .includes(normalizedQuery);
    const inKeywords = article.keywords.some((kw) =>
      kw.toLowerCase().includes(normalizedQuery)
    );

    return inTitle || inExcerpt || inCategory || inKeywords;
  });
}
