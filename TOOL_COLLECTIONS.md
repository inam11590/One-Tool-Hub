# OneToolHub — Curated Tool Collections & Role-Based Bundles

## 1. Overview

Tool Collections (`/collections` and `/ur/collections`) group individual browser utilities into cohesive, role-based workflows. Instead of discovering tools one-by-one, visitors can access entire suites engineered for their profession.

Each collection includes:
1. Role-specific positioning and badge.
2. Estimated time saved benchmark.
3. 1-Click "Pin All to Workspace" action (populating local favorites).
4. Direct shareable link with clipboard copy action.
5. Cross-links to relevant multi-tool productivity workflows.

---

## 2. Curated Collection Matrix

### 1. Student Toolkit (`student-toolkit`)
- **Role / Audience**: High School, College & University Students, Educators
- **Badge**: Academic
- **Tagline**: Academic calculators, writing helpers & document prep
- **Estimated Time Saved**: ~45 minutes per study session
- **Included Tools**:
  1. `gpa-calculator`: Weighted college and semester GPA calculation with customizable scales.
  2. `word-counter`: Real-time word, character, sentence, and reading-time counter.
  3. `percentage-calculator`: Percentage change, discount, and grade weight calculations.
  4. `pdf-merge-split`: Combine lecture slides, syllabus, and assignment PDFs.
- **Linked Workflow**: `prepare-pdf-document`

---

### 2. Developer Toolkit (`developer-toolkit`)
- **Role / Audience**: Software Engineers, Backend Developers, DevOps, QA Engineers
- **Badge**: Engineering
- **Tagline**: Format data, test regular expressions & generate identifiers
- **Estimated Time Saved**: ~1.5 hours per week
- **Included Tools**:
  1. `json-formatter`: Format, validate, and minify nested JSON structures.
  2. `regex-tester`: Interactive ECMAScript regex validation with match capturing.
  3. `uuid-generator`: Cryptographic v4 UUID generator with uppercase and hyphens options.
  4. `base64-encoder-decoder`: RFC 4648 Base64 text and data converter.
  5. `code-diff-checker`: Side-by-side and unified code difference comparison.
- **Linked Workflow**: `developer-data-prep`

---

### 3. Content Creator Toolkit (`content-creator-toolkit`)
- **Role / Audience**: YouTubers, Podcasters, Video Editors, Social Media Managers
- **Badge**: Media & Video
- **Tagline**: Optimize thumbnails, format chapters & share links
- **Estimated Time Saved**: ~30 minutes per upload
- **Included Tools**:
  1. `image-compressor`: Lossless & high-compression optimization for YouTube thumbnails.
  2. `image-resizer`: Precise pixel resizing for YouTube banners, avatars, and community posts.
  3. `qr-code-generator`: High-contrast promotional QR codes for video end screens.
  4. `youtube-timestamp-formatter`: Validates and sorts video chapters ready for video descriptions.
- **Linked Workflow**: `prepare-youtube-description`

---

### 4. PDF Productivity Toolkit (`pdf-productivity-toolkit`)
- **Role / Audience**: Freelancers, Administrative Assistants, Legal Clerks, Business Analysts
- **Badge**: Documents
- **Tagline**: Merge, split, rasterize, reorder & watermark documents
- **Estimated Time Saved**: ~2 hours per month
- **Included Tools**:
  1. `pdf-merge-split`: Merge multiple documents or extract specific page ranges.
  2. `pdf-to-image`: Convert PDF pages into high-resolution PNG images.
  3. `image-to-pdf`: Convert scanned receipts and photographs into multi-page PDF documents.
  4. `pdf-organizer`: Reorder, delete, and rotate PDF pages.
  5. `pdf-watermark`: Stamp confidential, draft, or branded text watermarks onto PDF pages.
- **Linked Workflow**: `prepare-pdf-document`

---

### 5. Writing & Editorial Toolkit (`writing-toolkit`)
- **Role / Audience**: Copywriters, Novelists, Technical Writers, Proofreaders, Bloggers
- **Badge**: Publishing
- **Tagline**: Audit word limits, convert casings & compare revisions
- **Estimated Time Saved**: ~40 minutes per draft
- **Included Tools**:
  1. `word-counter`: Comprehensive word count, paragraph count, and reading speed estimate.
  2. `text-case-converter`: Convert to Title Case, sentence case, UPPERCASE, camelCase.
  3. `text-compare`: Side-by-side text difference inspector.
  4. `text-cleaner`: Strip duplicate whitespace, remove linebreaks, strip HTML tags.
  5. `lorem-ipsum-generator`: Generate standard placeholder paragraphs, sentences, and words.
- **Linked Workflow**: `prepare-images-website`

---

## 3. Client-Side Integration

When a user clicks "Pin All to Workspace":
1. The client executes `getFavoriteTools()`.
2. Any missing tool from `col.toolSlugs` is appended via `toggleFavoriteTool()`.
3. An internal `onetoolhub:preferences_changed` event is dispatched.
4. The user's personalized dashboard immediately displays the pinned suite without page reloads.
