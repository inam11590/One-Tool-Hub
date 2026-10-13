# OneToolHub — Productivity Workflows & Guided Multi-Tool Recipes

## 1. Concept & User Experience Goal

Real-world work rarely requires a single isolated utility. A web designer preparing an image needs to resize it *and* compress it. A YouTuber publishing a video needs to validate chapter timestamps, compress thumbnail images, and generate end-screen QR codes.

**Productivity Workflows** (`/workflows` and `/ur/workflows`) provide sequential, interactive recipes connecting multiple OneToolHub browser tools into complete task pipelines.

---

## 2. Interactive Feature Architecture

1. **Step-by-Step Guidance**: Each recipe defines an ordered sequence of actions with practical instructions and pro tips.
2. **Local Checklist Persistence**: Users can check off completed steps. Step state is persisted in browser `localStorage` (`onetoolhub_wf_{slug}`) with zero server requests.
3. **Progress Bar & Completion Status**: Real-time progress bar with completion badge upon 100% completion.
4. **Direct Tool Deep Links**: Each step features a direct action button launching the exact required tool in a new context.
5. **Reset Capability**: 1-click button to reset progress for recurring tasks.

---

## 3. Registered Workflow Recipes

### Recipe 1: Prepare Images for a Fast Website (`prepare-images-website`)
- **Category**: Media Optimization
- **Estimated Total Time**: 3 minutes
- **Target Audience**: Web Designers, Bloggers, SEO Specialists
- **Steps**:
  1. **Resize Image Dimensions** (`image-resizer`): Resize raw photos to exact display dimensions (e.g. 1200x630 or 800x600). *Pro tip: Never serve 4000px camera originals on web layouts.*
  2. **Compress File Weight** (`image-compressor`): Compress the resized image to under 150 KB. *Pro tip: Compressing images under 150 KB eliminates Largest Contentful Paint (LCP) delays.*

---

### Recipe 2: Clean, Reorder & Brand an Official PDF (`prepare-pdf-document`)
- **Category**: Document Management
- **Estimated Total Time**: 5 minutes
- **Target Audience**: Freelancers, Administrative Assistants, Legal Clerks
- **Steps**:
  1. **Merge Multi-Part Scans & Reports** (`pdf-merge-split`): Combine separate PDF chapters or attachments into a single master document. *Pro tip: Arrange files in chronological sequence before merging.*
  2. **Organize, Rotate & Delete Pages** (`pdf-organizer`): Rotate upside-down scanned pages and delete blank sheets. *Pro tip: Use the visual thumbnail grid to confirm page numbering.*
  3. **Apply Security Watermark** (`pdf-watermark`): Stamp a subtle semi-transparent watermark ("CONFIDENTIAL" or company name). *Pro tip: A 45-degree rotation with 20% opacity ensures readability.*

---

### Recipe 3: Clean, Format & Encode API Mock Data (`developer-data-prep`)
- **Category**: Developer Utilities
- **Estimated Total Time**: 4 minutes
- **Target Audience**: Frontend Engineers, QA Testers, API Developers
- **Steps**:
  1. **Generate Unique Identifiers** (`uuid-generator`): Generate batch RFC 4122 v4 UUIDs for primary keys. *Pro tip: Use lowercase format for PostgreSQL/JSON compatibility.*
  2. **Validate & Pretty-Print JSON** (`json-formatter`): Validate syntax and format the mock payload with 2-space indentation. *Pro tip: Use 2-space indentation for clean git diffs.*
  3. **Encode Sensitive Headers into Base64** (`base64-encoder-decoder`): Encode Basic Auth tokens or credentials. *Pro tip: In-browser encoding prevents transmitting credentials over network pipes.*

---

### Recipe 4: Complete YouTube Video Upload Preparation (`prepare-youtube-description`)
- **Category**: Content Creation
- **Estimated Total Time**: 6 minutes
- **Target Audience**: YouTubers, Video Editors, Content Creators
- **Steps**:
  1. **Format & Validate Video Chapters** (`youtube-timestamp-formatter`): Verify timestamps start at 00:00, are at least 10 seconds apart, and sorted chronologically. *Pro tip: YouTube requires at least 3 chapters starting at 00:00.*
  2. **Compress High-Resolution Thumbnail** (`image-compressor`): Compress custom 1280x720 thumbnail under YouTube's strict 2 MB limit. *Pro tip: Keep thumbnail file weight between 400 KB and 1.5 MB.*
  3. **Generate Channel Promotional QR Code** (`qr-code-generator`): Create high-contrast QR code for channel subscription or Patreon to show on end screens. *Pro tip: Static QR codes never expire and function permanently.*
