import { TOOLS_REGISTRY, getToolBySlug } from './tools.ts';
import { UR_TOOLS_MAP } from './i18n/tools-ur.ts';
import type { ToolItem } from '@/types/tools';

export interface TaskSuggestion {
  id: string;
  query: string;
  queryUr: string;
  category: string;
  icon: string;
  targetToolSlug: string;
}

export interface ToolFinderMatch {
  tool: ToolItem;
  score: number;
  reason: string;
  reasonUr: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ToolFinderResult {
  query: string;
  matches: ToolFinderMatch[];
  suggestedRelatedTools: ToolItem[];
  emptyQuery: boolean;
}

// Popular sample task queries for instant click suggestions
export const TASK_SUGGESTIONS: readonly TaskSuggestion[] = [
  {
    id: 'compress-photo',
    query: 'I want to compress my photo without losing quality',
    queryUr: 'میں اپنی تصویر کا سائز کم کرنا چاہتا ہوں بغیر کوالٹی کم کیے',
    category: 'Images & PDF',
    icon: 'FileImage',
    targetToolSlug: 'image-compressor',
  },
  {
    id: 'merge-pdf',
    query: 'I need to merge multiple PDF files into one document',
    queryUr: 'مجھے متعدد پی ڈی ایف فائلیں ایک ساتھ جوڑنی ہیں',
    category: 'Images & PDF',
    icon: 'Files',
    targetToolSlug: 'pdf-merge-split',
  },
  {
    id: 'calculate-gpa',
    query: 'Calculate my semester GPA with weighted credit hours',
    queryUr: 'کریڈٹ آورز کے ساتھ اپنا سمسٹر جی پی اے معلوم کریں',
    category: 'Students',
    icon: 'GraduationCap',
    targetToolSlug: 'gpa-calculator',
  },
  {
    id: 'format-json',
    query: 'Format and validate minified JSON API response',
    queryUr: 'جے سن ڈیٹا کو فارمیٹ اور درست کریں',
    category: 'Developers',
    icon: 'Braces',
    targetToolSlug: 'json-formatter',
  },
  {
    id: 'create-qr',
    query: 'Create a high-resolution QR code for my website link',
    queryUr: 'اپنی ویب سائٹ کے لیے کیو آر کوڈ بنائیں',
    category: 'Creators',
    icon: 'QrCode',
    targetToolSlug: 'qr-code-generator',
  },
  {
    id: 'generate-password',
    query: 'Generate a strong uncrackable random password',
    queryUr: 'ایک مضبوط اور محفوظ بے ترتیب پاس ورڈ بنائیں',
    category: 'Security',
    icon: 'KeyRound',
    targetToolSlug: 'password-generator',
  },
  {
    id: 'compare-text',
    query: 'Compare two text drafts and find differences',
    queryUr: 'دو تحریروں کا موازنہ کریں اور فرق معلوم کریں',
    category: 'Writing',
    icon: 'FileSearch',
    targetToolSlug: 'text-compare',
  },
  {
    id: 'clean-text',
    query: 'Remove extra spaces, blank lines, and strip HTML from text',
    queryUr: 'اضافی خالی جگہیں اور لائنیں ختم کر کے ٹیکسٹ صاف کریں',
    category: 'Writing',
    icon: 'Eraser',
    targetToolSlug: 'text-cleaner',
  },
  {
    id: 'convert-case',
    query: 'Convert text to Title Case, camelCase, or uppercase',
    queryUr: 'ٹیکسٹ کو ٹائٹل کیس یا کیمل کیس میں تبدیل کریں',
    category: 'Writing',
    icon: 'Type',
    targetToolSlug: 'text-case-converter',
  },
  {
    id: 'youtube-chapters',
    query: 'Format and validate video chapter timestamps for YouTube description',
    queryUr: 'یوٹیوب ڈسکرپشن کے لیے ویڈیو ٹائم اسٹیمپ بنائیں',
    category: 'Creators',
    icon: 'Clock',
    targetToolSlug: 'youtube-timestamp-formatter',
  },
  {
    id: 'freelance-invoice',
    query: 'Create a professional PDF invoice with tax and discounts',
    queryUr: 'ٹیکس اور ڈسکاؤنٹ کے ساتھ کلائنٹ کے لیے پی ڈی ایف انوائس بنائیں',
    category: 'Freelancers',
    icon: 'Receipt',
    targetToolSlug: 'invoice-generator',
  },
  {
    id: 'watermark-pdf',
    query: 'Add a confidential or draft watermark to a PDF',
    queryUr: 'پی ڈی ایف پر واٹر مارک یا مہر لگائیں',
    category: 'Images & PDF',
    icon: 'Stamp',
    targetToolSlug: 'pdf-watermark',
  },
  {
    id: 'extract-pdf-text',
    query: 'Extract all selectable text and words from a PDF',
    queryUr: 'پی ڈی ایف سے تمام تحریر اور متن نکالیں',
    category: 'Images & PDF',
    icon: 'FileSearch',
    targetToolSlug: 'pdf-text-extractor',
  },
  {
    id: 'rotate-pdf-pages',
    query: 'Rotate sideways or upside-down PDF pages 90 degrees',
    queryUr: 'پی ڈی ایف صفحات کو 90 ڈگری پر گھمائیں',
    category: 'Images & PDF',
    icon: 'RotateCw',
    targetToolSlug: 'pdf-page-rotator',
  },
  {
    id: 'edit-pdf-metadata',
    query: 'Inspect, edit, or wipe PDF author and metadata properties',
    queryUr: 'پی ڈی ایف دستاویز کی معلومات اور مصنف کا نام تبدیل کریں',
    category: 'Images & PDF',
    icon: 'Tag',
    targetToolSlug: 'pdf-metadata-editor',
  },
  {
    id: 'convert-image-format',
    query: 'Convert images between JPG, PNG, and WebP format',
    queryUr: 'تصویر کو جے پی جی، پی این جی اور ویب پی میں تبدیل کریں',
    category: 'Images & PDF',
    icon: 'RefreshCw',
    targetToolSlug: 'image-format-converter',
  },
  {
    id: 'crop-image',
    query: 'Crop photo to 1:1 square or 16:9 widescreen ratio',
    queryUr: 'تصویر کو اسکوائر یا 16:9 سائز میں تراشیں',
    category: 'Images & PDF',
    icon: 'Crop',
    targetToolSlug: 'image-cropper',
  },
  {
    id: 'image-to-base64',
    query: 'Convert image into Base64 string and HTML Data URL',
    queryUr: 'تصویر کو base64 کوڈ اور ڈیٹا یو آر ایل میں تبدیل کریں',
    category: 'Developers',
    icon: 'FileCode',
    targetToolSlug: 'image-to-base64',
  },
  {
    id: 'extract-color-palette',
    query: 'Extract dominant color palette and HEX codes from photo',
    queryUr: 'تصویر سے نمایاں رنگ اور ہیکس کوڈز نکالیں',
    category: 'Creators',
    icon: 'Pipette',
    targetToolSlug: 'image-color-palette',
  },
];

// Conversational stopwords stripped before intent analysis
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'i', 'im', "i'm", 'me', 'my',
  'we', 'our', 'you', 'your', 'want', 'need', 'wish', 'like', 'how',
  'can', 'please', 'help', 'find', 'get', 'make', 'do', 'tool', 'online',
  'website', 'app', 'best', 'free', 'quick', 'easy', 'just', 'some',
  // Urdu conversational stopwords
  'میں', 'کو', 'سے', 'کا', 'کی', 'کے', 'پر', 'ہے', 'ہیں', 'تھا',
  'تھے', 'کرنا', 'چاہتا', 'ہوں', 'چاہتی', 'مجھے', 'چاہیے', 'کیسے',
  'ایک', 'اور', 'والا', 'والی', 'والے',
]);

// Intent keywords and domain synonym mapping for semantic task matching
const TASK_INTENT_MAP: Record<string, { slugs: string[]; weight: number }> = {
  // Image operations
  compress: { slugs: ['image-compressor'], weight: 50 },
  shrink: { slugs: ['image-compressor'], weight: 45 },
  reduce: { slugs: ['image-compressor', 'image-resizer'], weight: 40 },
  photo: { slugs: ['image-compressor', 'image-resizer', 'image-to-pdf'], weight: 35 },
  picture: { slugs: ['image-compressor', 'image-resizer', 'image-to-pdf'], weight: 35 },
  pic: { slugs: ['image-compressor', 'image-resizer'], weight: 30 },
  image: { slugs: ['image-compressor', 'image-resizer', 'image-to-pdf'], weight: 35 },
  resize: { slugs: ['image-resizer'], weight: 50 },
  dimension: { slugs: ['image-resizer'], weight: 40 },
  aspect: { slugs: ['image-resizer', 'image-cropper'], weight: 40 },
  width: { slugs: ['image-resizer'], weight: 30 },
  height: { slugs: ['image-resizer'], weight: 30 },
  crop: { slugs: ['image-cropper'], weight: 55 },
  cropper: { slugs: ['image-cropper'], weight: 55 },
  trim: { slugs: ['image-cropper'], weight: 45 },
  square: { slugs: ['image-cropper'], weight: 40 },
  convert: { slugs: ['image-format-converter'], weight: 50 },
  converter: { slugs: ['image-format-converter'], weight: 50 },
  webp: { slugs: ['image-format-converter', 'image-compressor'], weight: 50 },
  base64: { slugs: ['image-to-base64', 'base64-encoder-decoder'], weight: 55 },
  palette: { slugs: ['image-color-palette', 'color-picker'], weight: 55 },
  swatch: { slugs: ['image-color-palette', 'color-picker'], weight: 45 },
  swatches: { slugs: ['image-color-palette'], weight: 45 },
  dominant: { slugs: ['image-color-palette'], weight: 50 },
  // PDF operations
  pdf: { slugs: ['pdf-merge-split', 'pdf-to-image', 'image-to-pdf', 'pdf-organizer', 'pdf-watermark', 'pdf-text-extractor', 'pdf-page-rotator', 'pdf-metadata-editor'], weight: 25 },
  merge: { slugs: ['pdf-merge-split'], weight: 50 },
  combine: { slugs: ['pdf-merge-split', 'image-to-pdf'], weight: 45 },
  split: { slugs: ['pdf-merge-split'], weight: 50 },
  separate: { slugs: ['pdf-merge-split'], weight: 40 },
  extract: { slugs: ['pdf-text-extractor', 'pdf-merge-split', 'pdf-to-image'], weight: 45 },
  extractor: { slugs: ['pdf-text-extractor'], weight: 55 },
  watermark: { slugs: ['pdf-watermark'], weight: 55 },
  stamp: { slugs: ['pdf-watermark'], weight: 45 },
  draft: { slugs: ['pdf-watermark'], weight: 35 },
  confidential: { slugs: ['pdf-watermark'], weight: 35 },
  rotate: { slugs: ['pdf-page-rotator', 'pdf-organizer'], weight: 50 },
  rotator: { slugs: ['pdf-page-rotator'], weight: 55 },
  orientation: { slugs: ['pdf-page-rotator'], weight: 45 },
  metadata: { slugs: ['pdf-metadata-editor'], weight: 60 },
  author: { slugs: ['pdf-metadata-editor'], weight: 45 },
  reorder: { slugs: ['pdf-organizer'], weight: 45 },
  organize: { slugs: ['pdf-organizer'], weight: 40 },
  jpg: { slugs: ['pdf-to-image', 'image-to-pdf'], weight: 30 },
  png: { slugs: ['pdf-to-image', 'image-to-pdf'], weight: 30 },
  rasterize: { slugs: ['pdf-to-image'], weight: 45 },
  // Academic & Finance operations
  gpa: { slugs: ['gpa-calculator'], weight: 60 },
  cgpa: { slugs: ['gpa-calculator'], weight: 60 },
  grade: { slugs: ['gpa-calculator'], weight: 45 },
  grades: { slugs: ['gpa-calculator'], weight: 45 },
  semester: { slugs: ['gpa-calculator'], weight: 40 },
  credit: { slugs: ['gpa-calculator'], weight: 35 },
  college: { slugs: ['gpa-calculator'], weight: 25 },
  university: { slugs: ['gpa-calculator'], weight: 25 },
  percent: { slugs: ['percentage-calculator'], weight: 55 },
  percentage: { slugs: ['percentage-calculator'], weight: 55 },
  discount: { slugs: ['percentage-calculator', 'invoice-generator'], weight: 40 },
  markup: { slugs: ['percentage-calculator'], weight: 40 },
  invoice: { slugs: ['invoice-generator'], weight: 60 },
  bill: { slugs: ['invoice-generator'], weight: 50 },
  billing: { slugs: ['invoice-generator'], weight: 45 },
  receipt: { slugs: ['invoice-generator'], weight: 40 },
  client: { slugs: ['invoice-generator'], weight: 30 },
  freelance: { slugs: ['invoice-generator'], weight: 30 },
  // Developer & Security operations
  json: { slugs: ['json-formatter'], weight: 60 },
  format: { slugs: ['json-formatter', 'youtube-timestamp-formatter', 'text-cleaner'], weight: 30 },
  validate: { slugs: ['json-formatter', 'uuid-generator', 'regex-tester'], weight: 35 },
  prettify: { slugs: ['json-formatter'], weight: 50 },
  minify: { slugs: ['json-formatter'], weight: 50 },
  password: { slugs: ['password-generator'], weight: 60 },
  pass: { slugs: ['password-generator'], weight: 30 },
  pin: { slugs: ['password-generator'], weight: 30 },
  secure: { slugs: ['password-generator'], weight: 30 },
  strong: { slugs: ['password-generator'], weight: 30 },
  uuid: { slugs: ['uuid-generator'], weight: 60 },
  guid: { slugs: ['uuid-generator'], weight: 60 },
  identifier: { slugs: ['uuid-generator'], weight: 40 },
  v4: { slugs: ['uuid-generator'], weight: 35 },
  encode: { slugs: ['base64-encoder-decoder', 'qr-code-generator'], weight: 35 },
  decode: { slugs: ['base64-encoder-decoder'], weight: 40 },
  regex: { slugs: ['regex-tester'], weight: 60 },
  regexp: { slugs: ['regex-tester'], weight: 60 },
  pattern: { slugs: ['regex-tester'], weight: 40 },
  match: { slugs: ['regex-tester', 'text-compare'], weight: 35 },
  diff: { slugs: ['code-diff-checker', 'text-compare'], weight: 55 },
  compare: { slugs: ['code-diff-checker', 'text-compare'], weight: 50 },
  patch: { slugs: ['code-diff-checker'], weight: 45 },
  code: { slugs: ['code-diff-checker', 'regex-tester', 'json-formatter'], weight: 30 },
  qr: { slugs: ['qr-code-generator'], weight: 60 },
  barcode: { slugs: ['qr-code-generator'], weight: 45 },
  scan: { slugs: ['qr-code-generator'], weight: 35 },
  color: { slugs: ['color-picker'], weight: 55 },
  hex: { slugs: ['color-picker'], weight: 50 },
  rgb: { slugs: ['color-picker'], weight: 50 },
  hsl: { slugs: ['color-picker'], weight: 50 },
  contrast: { slugs: ['color-picker'], weight: 45 },
  wcag: { slugs: ['color-picker'], weight: 45 },
  // Writing & Text operations
  word: { slugs: ['word-counter'], weight: 45 },
  words: { slugs: ['word-counter'], weight: 45 },
  count: { slugs: ['word-counter'], weight: 40 },
  character: { slugs: ['word-counter'], weight: 40 },
  characters: { slugs: ['word-counter'], weight: 40 },
  reading: { slugs: ['word-counter'], weight: 35 },
  essay: { slugs: ['word-counter', 'text-compare'], weight: 30 },
  case: { slugs: ['text-case-converter'], weight: 50 },
  uppercase: { slugs: ['text-case-converter'], weight: 55 },
  lowercase: { slugs: ['text-case-converter'], weight: 55 },
  capitalize: { slugs: ['text-case-converter'], weight: 50 },
  camelcase: { slugs: ['text-case-converter'], weight: 55 },
  titlecase: { slugs: ['text-case-converter'], weight: 55 },
  clean: { slugs: ['text-cleaner'], weight: 50 },
  sanitize: { slugs: ['text-cleaner'], weight: 45 },
  spaces: { slugs: ['text-cleaner'], weight: 40 },
  whitespace: { slugs: ['text-cleaner', 'code-diff-checker'], weight: 35 },
  lorem: { slugs: ['lorem-ipsum-generator'], weight: 60 },
  ipsum: { slugs: ['lorem-ipsum-generator'], weight: 60 },
  dummy: { slugs: ['lorem-ipsum-generator'], weight: 50 },
  placeholder: { slugs: ['lorem-ipsum-generator'], weight: 45 },
  youtube: { slugs: ['youtube-timestamp-formatter'], weight: 55 },
  timestamp: { slugs: ['youtube-timestamp-formatter'], weight: 55 },
  chapter: { slugs: ['youtube-timestamp-formatter'], weight: 50 },
  timecode: { slugs: ['youtube-timestamp-formatter'], weight: 50 },

  // Urdu task keywords
  تصویر: { slugs: ['image-compressor', 'image-resizer', 'image-to-pdf'], weight: 50 },
  سائز: { slugs: ['image-compressor', 'image-resizer'], weight: 45 },
  کم: { slugs: ['image-compressor'], weight: 35 },
  جوڑیں: { slugs: ['pdf-merge-split', 'image-to-pdf'], weight: 50 },
  پاسورڈ: { slugs: ['password-generator'], weight: 60 },
  موازنہ: { slugs: ['text-compare', 'code-diff-checker'], weight: 50 },
  صاف: { slugs: ['text-cleaner'], weight: 50 },
  انوائس: { slugs: ['invoice-generator'], weight: 60 },
  واٹرمارک: { slugs: ['pdf-watermark'], weight: 60 },
  رنگ: { slugs: ['color-picker'], weight: 55 },
  گھمائیں: { slugs: ['pdf-page-rotator'], weight: 55 },
  روٹیٹ: { slugs: ['pdf-page-rotator'], weight: 55 },
  متن: { slugs: ['pdf-text-extractor', 'word-counter', 'text-cleaner'], weight: 45 },
  میٹا: { slugs: ['pdf-metadata-editor'], weight: 55 },
  کروپ: { slugs: ['image-cropper'], weight: 55 },
  تراشیں: { slugs: ['image-cropper'], weight: 55 },
  پیلیٹ: { slugs: ['image-color-palette', 'color-picker'], weight: 55 },
  فارمیٹ: { slugs: ['image-format-converter'], weight: 50 },
};

/**
 * Normalizes an input query into intent tokens.
 */
function tokenizeQuery(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Explains why a tool matched the given intent tokens in English and Urdu.
 */
function buildMatchReason(tool: ToolItem, matchedTokens: string[]): { en: string; ur: string } {
  const tokenList = matchedTokens.slice(0, 3).join(', ');
  const urMeta = UR_TOOLS_MAP[tool.slug];

  return {
    en: `Recommended for "${tokenList}": ${tool.shortDescription}`,
    ur: `"${tokenList}" کے لیے تجویز کردہ: ${urMeta?.shortDescription ?? tool.shortDescription}`,
  };
}

/**
 * Matches natural-language task intent to relevant OneToolHub utilities.
 * Completely deterministic, client-side, zero external API calls.
 */
export function findToolsForTask(
  query: string,
  options?: {
    maxResults?: number;
    locale?: 'en' | 'ur';
  }
): ToolFinderResult {
  const maxResults = options?.maxResults ?? 5;
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    const fallbackTools = ['json-formatter', 'image-compressor', 'pdf-merge-split', 'word-counter']
      .map((s) => getToolBySlug(s))
      .filter((t): t is ToolItem => Boolean(t));
    return {
      query: '',
      matches: [],
      suggestedRelatedTools: fallbackTools,
      emptyQuery: true,
    };
  }

  const tokens = tokenizeQuery(cleanQuery);
  const scores: Map<string, { score: number; matchedTokens: string[] }> = new Map();

  // 1. Semantic Task Intent Matching
  for (const token of tokens) {
    // Check direct intent map
    const intent = TASK_INTENT_MAP[token];
    if (intent) {
      for (const slug of intent.slugs) {
        const cur = scores.get(slug) ?? { score: 0, matchedTokens: [] };
        cur.score += intent.weight;
        if (!cur.matchedTokens.includes(token)) cur.matchedTokens.push(token);
        scores.set(slug, cur);
      }
    }

    // Check exact keyword overlap in registry
    for (const tool of TOOLS_REGISTRY) {
      if (tool.status !== 'available') continue;

      let toolScore = 0;

      // Exact name or slug match
      if (tool.name.toLowerCase().includes(token) || tool.slug.includes(token)) {
        toolScore += 35;
      }

      // Keyword match
      for (const kw of tool.keywords) {
        if (kw.toLowerCase().includes(token)) {
          toolScore += 20;
          break;
        }
      }

      // Urdu keyword matching
      const urData = UR_TOOLS_MAP[tool.slug];
      if (urData) {
        if (urData.name.includes(token) || urData.keywords.some((k) => k.includes(token))) {
          toolScore += 40;
        }
      }

      if (toolScore > 0) {
        const cur = scores.get(tool.slug) ?? { score: 0, matchedTokens: [] };
        cur.score += toolScore;
        if (!cur.matchedTokens.includes(token)) cur.matchedTokens.push(token);
        scores.set(tool.slug, cur);
      }
    }
  }

  // 2. Rank tools by composite score
  const sortedEntries = Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .filter(([, data]) => data.score >= 20);

  const matches: ToolFinderMatch[] = [];
  const primaryToolSlugs = new Set<string>();

  for (const [slug, data] of sortedEntries.slice(0, maxResults)) {
    const tool = getToolBySlug(slug);
    if (!tool) continue;

    primaryToolSlugs.add(slug);
    const confidence: 'high' | 'medium' | 'low' =
      data.score >= 50 ? 'high' : data.score >= 30 ? 'medium' : 'low';
    const reasons = buildMatchReason(tool, data.matchedTokens);

    matches.push({
      tool,
      score: data.score,
      reason: reasons.en,
      reasonUr: reasons.ur,
      confidence,
    });
  }

  // 3. Fallback: If no matches, surface top starter utilities
  const suggestedRelatedTools: ToolItem[] = [];
  if (matches.length > 0) {
    const primaryCategory = matches[0]?.tool.categoryId;
    const sameCatTools = TOOLS_REGISTRY.filter(
      (t) =>
        t.status === 'available' &&
        t.categoryId === primaryCategory &&
        !primaryToolSlugs.has(t.slug)
    ).slice(0, 3);
    suggestedRelatedTools.push(...sameCatTools);
  } else {
    // Recommend versatile starter utilities on zero results
    suggestedRelatedTools.push(
      ...( ['json-formatter', 'image-compressor', 'pdf-merge-split', 'word-counter']
        .map((s) => getToolBySlug(s))
        .filter((t): t is ToolItem => Boolean(t)) )
    );
  }

  return {
    query: cleanQuery,
    matches,
    suggestedRelatedTools,
    emptyQuery: false,
  };
}
