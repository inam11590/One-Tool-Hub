# OneToolHub

**Every Tool You Need. One Powerful Platform.**

OneToolHub is a modern online utility platform built for students, freelancers, YouTubers, and software developers.

---

## Step 2 Status (5 Live Browser Tools)

This repository includes **Step 1 + Step 2** of the OneToolHub architecture:
- Production-quality Next.js App Router + TypeScript (strict mode) + Tailwind CSS foundation
- Responsive sticky header, desktop navigation, and accessible mobile menu
- **All Tools Directory** (`/tools`) and **Homepage** (`/`) with client-side search, category filtering, and availability filtering
- **5 Live Client-Side Tools** (processed 100% locally in the browser without registration):
  1. **JSON Formatter & Validator** (`/tools/json-formatter`)
  2. **Image Compressor** (`/tools/image-compressor`)
  3. **QR Code Generator** (`/tools/qr-code-generator`)
  4. **Word Counter** (`/tools/word-counter`)
  5. **YouTube Timestamp Formatter** (`/tools/youtube-timestamp-formatter`)
- **3 Coming Soon Tools** clearly marked in the catalog (*GPA Calculator, Invoice Generator, PDF Merge & Split*)
- Automated unit test suite (`npm test`), strict TypeScript checks (`npm run typecheck`), ESLint (`npm run lint`), and static production build (`npm run build`)

---

## Project Structure

```text
One-Tool-Hub/
├── frontend/
│   ├── public/                  # Static assets (logo.svg)
│   ├── src/
│   │   ├── app/                 # App Router routes (/, /tools, /tools/*, /about, /contact, /privacy, /terms)
│   │   ├── components/
│   │   │   ├── home/            # Hero, CategoryGrid, FeaturedTools, Benefits, HomeClient
│   │   │   ├── layout/          # Header, Footer, Navigation
│   │   │   ├── tools/           # ToolPageShell, ToolsDirectoryClient, and 5 interactive tool components
│   │   │   └── ui/              # Badge, Container, SectionHeading, ToolCard, ToolIcon
│   │   ├── lib/
│   │   │   ├── tools/           # Pure processing, validation, and unit tests for all 5 tools
│   │   │   ├── tools.ts         # Centralized tool registry & filtering utilities
│   │   │   └── utils.ts         # Class name helper
│   │   └── types/               # Shared TypeScript interfaces & types (tools.ts)
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
├── backend/
│   └── README.md                # Planned Python FastAPI & PostgreSQL service documentation
├── .gitignore
└── README.md
```

---

## Running Locally on macOS

### Prerequisites
- **Node.js** `v20+` or `v22+` (macOS)
- **npm** `v9+` or `v10+`

### 1. Navigate to the frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run tests, typecheck, lint, and production build
```bash
# Run unit tests for all 5 tools
npm test

# Run TypeScript strict type checking
npm run typecheck

# Run ESLint
npm run lint

# Create an optimized production build
npm run build
```
