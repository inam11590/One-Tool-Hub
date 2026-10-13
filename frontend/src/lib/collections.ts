import { getToolBySlug } from './tools.ts';
import type { ToolItem } from '@/types/tools';

export interface ToolCollection {
  id: string;
  slug: string;
  title: string;
  titleUr: string;
  tagline: string;
  taglineUr: string;
  description: string;
  descriptionUr: string;
  icon: string;
  badge: string;
  badgeUr: string;
  toolSlugs: readonly string[];
  suggestedWorkflowSlug?: string;
}

export const TOOL_COLLECTIONS: readonly ToolCollection[] = [
  {
    id: 'student-toolkit',
    slug: 'student-toolkit',
    title: 'Student Toolkit',
    titleUr: 'اسٹوڈنٹ ٹول کٹ',
    tagline: 'Academic calculators, writing helpers & document prep',
    taglineUr: 'تعلیمی کیلکولیٹرز، رائٹنگ ہیلپرز اور دستاویزات کی تیاری',
    description:
      'Essential academic utilities designed for high school and university students. Calculate course GPA, audit essay word counts, compute percentage changes, and merge lecture notes locally.',
    descriptionUr:
      'طلباء کے لیے ضروری تعلیمی ٹولز۔ جی پی اے معلوم کریں، مضمون کے الفاظ گنیں، فیصد کا حساب لگائیں اور نوٹس کو آپس میں جوڑیں۔',
    icon: 'GraduationCap',
    badge: 'Academic',
    badgeUr: 'تعلیمی',
    toolSlugs: [
      'gpa-calculator',
      'word-counter',
      'percentage-calculator',
      'pdf-merge-split',
    ],
    suggestedWorkflowSlug: 'prepare-pdf-document',
  },
  {
    id: 'developer-toolkit',
    slug: 'developer-toolkit',
    title: 'Developer Toolkit',
    titleUr: 'ڈویلپر ٹول کٹ',
    tagline: 'Format data, test regular expressions & generate identifiers',
    taglineUr: 'ڈیٹا فارمیٹنگ، ریجیکس ٹیسٹنگ اور آئی ڈی جنریٹر',
    description:
      'High-performance utilities built for software engineers, backend developers, and systems administrators. Prettify JSON payloads, test ECMAScript regex patterns, bulk generate UUIDs, and inspect code diffs.',
    descriptionUr:
      'سافٹ ویئر انجینئرز اور پروگرامرز کے لیے بہترین یوٹیلیٹیز۔ جے سن فارمیٹ کریں، ریجیکس ٹیسٹ کریں اور یو یو آئی ڈی بنائیں۔',
    icon: 'Code2',
    badge: 'Engineering',
    badgeUr: 'انجینئرنگ',
    toolSlugs: [
      'json-formatter',
      'regex-tester',
      'uuid-generator',
      'base64-encoder-decoder',
      'code-diff-checker',
    ],
    suggestedWorkflowSlug: 'developer-data-prep',
  },
  {
    id: 'content-creator-toolkit',
    slug: 'content-creator-toolkit',
    title: 'Content Creator Toolkit',
    titleUr: 'کنٹینٹ کریئیٹر ٹول کٹ',
    tagline: 'Optimize thumbnails, format chapters & share links',
    taglineUr: 'تھمب نیل آپٹیمائزیشن، ویڈیو چیپٹرز اور شیئرنگ ٹولز',
    description:
      'Publishing workflow utilities for YouTubers, podcasters, bloggers, and social media managers. Compress visual assets, lock banner aspect ratios, format video chapter timestamps, and generate scannable QR codes.',
    descriptionUr:
      'یوٹیوبرز اور سوشل میڈیا کے لیے ویڈیو، امیج اور کیو آر ٹولز۔ ویڈیو چیپٹرز بنائیں اور تھمب نیل سائز کم کریں۔',
    icon: 'Video',
    badge: 'Media & Video',
    badgeUr: 'میڈیا و ویڈیو',
    toolSlugs: [
      'image-compressor',
      'image-resizer',
      'qr-code-generator',
      'youtube-timestamp-formatter',
    ],
    suggestedWorkflowSlug: 'prepare-youtube-description',
  },
  {
    id: 'pdf-productivity-toolkit',
    slug: 'pdf-productivity-toolkit',
    title: 'PDF Productivity Toolkit',
    titleUr: 'پی ڈی ایف پروڈکٹیویٹی ٹول کٹ',
    tagline: 'Merge, split, extract text, rotate, reorder & edit metadata',
    taglineUr: 'پی ڈی ایف جوڑیں، الگ کریں، متن نکالیں، پیجز گھمائیں اور میٹا ڈیٹا ایڈٹ کریں',
    description:
      'Comprehensive in-browser PDF suite for administrative assistants, legal clerks, students, and professionals. Merge agreements, extract selectable text, fix upside-down scans, stamp confidential watermarks, and wipe metadata with 100% privacy.',
    descriptionUr:
      'دستاویزات، پی ڈی ایف مرج، متن ایکسٹریکٹ، روٹیشن اور واٹر مارک کا مکمل حل۔ 100% محفوظ اور نجی براؤزر پروسیسنگ۔',
    icon: 'Files',
    badge: 'Documents',
    badgeUr: 'دستاویزات',
    toolSlugs: [
      'pdf-merge-split',
      'pdf-to-image',
      'image-to-pdf',
      'pdf-organizer',
      'pdf-watermark',
      'pdf-text-extractor',
      'pdf-page-rotator',
      'pdf-metadata-editor',
    ],
    suggestedWorkflowSlug: 'prepare-pdf-document',
  },
  {
    id: 'writing-toolkit',
    slug: 'writing-toolkit',
    title: 'Writing & Editorial Toolkit',
    titleUr: 'رائٹنگ اینڈ ایڈیٹوریل ٹول کٹ',
    tagline: 'Audit word limits, convert casings & compare revisions',
    taglineUr: 'الفاظ گنیں، ٹیکسٹ کیس تبدیل کریں اور مسودات کا موازنہ کریں',
    description:
      'Clean text editing suite for essayists, journalists, copywriters, and proofreaders. Check reading times, convert between AP Title Case and sentence case, inspect word-by-word draft diffs, and sanitize messy PDF formatting.',
    descriptionUr:
      'مضامین، ٹیکسٹ کیس، موازنہ اور فارمیٹنگ کے لیے بہترین ٹولز۔ مسودات صاف کریں اور الفاظ کی گنتی کریں۔',
    icon: 'PenTool',
    badge: 'Publishing',
    badgeUr: 'پبلشنگ',
    toolSlugs: [
      'word-counter',
      'text-case-converter',
      'text-compare',
      'text-cleaner',
      'lorem-ipsum-generator',
    ],
    suggestedWorkflowSlug: 'prepare-images-website',
  },
  {
    id: 'image-design-toolkit',
    slug: 'image-design-toolkit',
    title: 'Image & Design Toolkit',
    titleUr: 'امیج اینڈ ڈیزائن ٹول کٹ',
    tagline: 'Compress, crop, convert formats, extract palettes & inline Base64',
    taglineUr: 'تصاویر کمپریس کریں، تراشیں، فارمیٹ بدلیں اور رنگ نکالیں',
    description:
      'Professional client-side visual asset and graphic design suite. Convert between WebP, PNG, and JPG, crop to social media ratios, extract harmonic color swatches, encode Base64 strings, and resize dimensions with 100% in-browser privacy.',
    descriptionUr:
      'گرافک ڈیزائنرز اور سوشل میڈیا کے لیے تصاویر اور رنگوں کا مکمل مجموعہ۔ فارمیٹ بدلیں، تصاویر تراشیں، رنگین پیلیٹ نکالیں اور بغیر اپ لوڈ محفوظ کام کریں۔',
    icon: 'Image',
    badge: 'Design & Media',
    badgeUr: 'ڈیزائن و میڈیا',
    toolSlugs: [
      'image-compressor',
      'image-resizer',
      'image-format-converter',
      'image-cropper',
      'image-to-base64',
      'image-color-palette',
    ],
    suggestedWorkflowSlug: 'prepare-social-media-image',
  },
];

export function getCollections(): readonly ToolCollection[] {
  return TOOL_COLLECTIONS;
}

export function getCollectionBySlug(slug: string): ToolCollection | undefined {
  return TOOL_COLLECTIONS.find((c) => c.slug === slug);
}

export function getToolsForCollection(collection: ToolCollection): ToolItem[] {
  return collection.toolSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolItem => Boolean(t && t.status === 'available'));
}

export function getRelatedCollections(currentSlug: string, limit = 2): ToolCollection[] {
  return TOOL_COLLECTIONS.filter((c) => c.slug !== currentSlug).slice(0, limit);
}
