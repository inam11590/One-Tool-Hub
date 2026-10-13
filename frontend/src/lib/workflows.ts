import { getToolBySlug } from './tools.ts';
import type { ToolItem } from '@/types/tools';

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  titleUr: string;
  description: string;
  descriptionUr: string;
  toolSlug: string;
  actionLabel: string;
  actionLabelUr: string;
  tip: string;
  tipUr: string;
}

export interface ProductivityWorkflow {
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
  estimatedMinutes: number;
  targetAudience: string;
  targetAudienceUr: string;
  steps: readonly WorkflowStep[];
  relatedCollectionSlug?: string;
}

export const PRODUCTIVITY_WORKFLOWS: readonly ProductivityWorkflow[] = [
  {
    id: 'prepare-images-website',
    slug: 'prepare-images-website',
    title: 'Prepare Images for a Fast Website',
    titleUr: 'تیز رفتار ویب سائٹ کے لیے تصاویر کی تیاری',
    tagline: 'Resize dimensions, compress file weight & boost Core Web Vitals',
    taglineUr: 'پکسل سائز تبدیل کریں، فائل سائز کم کریں اور رفتار بڑھائیں',
    description:
      'A practical 2-step media optimization pipeline. Resize raw camera or smartphone photos to your layout dimensions, then compress the result to under 200 KB to eliminate Largest Contentful Paint (LCP) delays.',
    descriptionUr:
      'ویب سائٹ کے لیے تصاویر کا سائز اور وزن کم کرنے کا آسان طریقہ۔ پکسل سائز سیٹ کریں اور بغیر کوالٹی کھوئے فائل سائز کم کریں۔',
    icon: 'FileImage',
    badge: 'Media Optimization',
    badgeUr: 'میڈیا آپٹیمائزیشن',
    estimatedMinutes: 3,
    targetAudience: 'Web Designers, Bloggers, SEO Specialists',
    targetAudienceUr: 'ویب ڈیزائنرز، بلاگرز، اور ایس ای او ماہرین',
    relatedCollectionSlug: 'content-creator-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Resize Image Dimensions',
        titleUr: 'تصویر کے پکسل سائز کو ایڈجسٹ کریں',
        description:
          'Lock aspect ratio and downscale large 4K/raw camera images to standard web widths (e.g. 1200px or 800px).',
        descriptionUr:
          'بڑی تصاویر کو ویب کے معیاری سائز (مثلاً 1200 پکسل) کے مطابق ایڈجسٹ کریں۔',
        toolSlug: 'image-resizer',
        actionLabel: 'Open Image Resizer',
        actionLabelUr: 'امیج ری سائزنگ کھولیں',
        tip: 'Locking aspect ratio prevents distortion and accidental layout shifts (CLS).',
        tipUr: 'ایسپیکٹ ریشو لاک رکھنے سے تصویر کھنچتی نہیں ہے۔',
      },
      {
        stepNumber: 2,
        title: 'Compress File Weight (Lossless / Smart)',
        titleUr: 'فائل کا وزن کم کریں (کمپریشن)',
        description:
          'Process the resized photo through the compressor to reduce file byte size by 60%–85% while keeping visual fidelity sharp.',
        descriptionUr:
          'تصویر کا فائل سائز 70 فیصد تک کم کریں تاکہ ویب پیج فوری لوڈ ہو سکے۔',
        toolSlug: 'image-compressor',
        actionLabel: 'Open Image Compressor',
        actionLabelUr: 'امیج کمپریسر کھولیں',
        tip: 'Modern WebP format offers 25%–35% higher compression than standard JPEG.',
        tipUr: 'WebP فارمیٹ عام جے پی جی سے زیادہ ہلکا ہوتا ہے۔',
      },
    ],
  },
  {
    id: 'prepare-pdf-document',
    slug: 'prepare-pdf-document',
    title: 'Prepare and Secure a Professional PDF',
    titleUr: 'پیشہ ورانہ اور محفوظ پی ڈی ایف تیار کریں',
    tagline: 'Combine photos, organize pages & stamp confidential watermarks',
    taglineUr: 'تصاویر پی ڈی ایف میں بدلیں، صفحات ترتیب دیں اور واٹر مارک لگائیں',
    description:
      'A complete administrative pipeline for contracts, receipts, and proposals. Convert scattered images into a PDF, rotate sideways pages, remove blank sheets, and stamp a custom draft watermark.',
    descriptionUr:
      'معاہدوں اور رسیدوں کو یکجا کرنے کا مکمل طریقہ۔ تصاویر سے پی ڈی ایف بنائیں، پیجز سیدھے کریں اور مہر لگائیں۔',
    icon: 'Files',
    badge: 'Document Preparation',
    badgeUr: 'دستاویزات کی تیاری',
    estimatedMinutes: 5,
    targetAudience: 'Freelancers, Legal Clerks, Students',
    targetAudienceUr: 'فری لانسرز، قانونی اسسٹنٹس، اور طلباء',
    relatedCollectionSlug: 'pdf-productivity-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Convert Images to Single PDF',
        titleUr: 'تصاویر کو پی ڈی ایف میں تبدیل کریں',
        description:
          'Bundle your scanned receipts, identity documents, or homework pages into an initial compiled PDF.',
        descriptionUr:
          'اسکین شدہ رسیدوں یا کاغذات کو ایک پی ڈی ایف فائل میں جمع کریں۔',
        toolSlug: 'image-to-pdf',
        actionLabel: 'Open Image to PDF',
        actionLabelUr: 'تصویر سے پی ڈی ایف کنورٹر کھولیں',
        tip: 'Drag and drop thumbnail cards to order your pages before generating the PDF.',
        tipUr: 'پی ڈی ایف بنانے سے پہلے کارڈز کو اپنی مرضی سے ترتیب دیں۔',
      },
      {
        stepNumber: 2,
        title: 'Rotate, Reorder & Clean Up Pages',
        titleUr: 'صفحات کو گھمائیں اور ترتیب دیں',
        description:
          'Audit all pages visually. Rotate sideways scanner orientations by 90 degrees and delete blank scanner sheets.',
        descriptionUr:
          'الٹے یا ٹیڑھے اسکین شدہ صفحات کو 90 ڈگری گھما کر سیدھا کریں۔',
        toolSlug: 'pdf-organizer',
        actionLabel: 'Open PDF Page Organizer',
        actionLabelUr: 'پی ڈی ایف آرگنائزر کھولیں',
        tip: 'Vector text and fonts remain completely crisp and untouched during rotation.',
        tipUr: 'صفحات گھمانے سے ٹیکسٹ کی کوالٹی متاثر نہیں ہوتی۔',
      },
      {
        stepNumber: 3,
        title: 'Stamp Confidential or Draft Watermark',
        titleUr: 'محفوظ واٹر مارک لگائیں',
        description:
          'Apply custom diagonal text (e.g. "CONFIDENTIAL", "DRAFT", or your company name) with subtle opacity.',
        descriptionUr:
          'دستاویز کی حفاظت کے لیے ہلکی شفافیت کے ساتھ واٹر مارک لگائیں۔',
        toolSlug: 'pdf-watermark',
        actionLabel: 'Open PDF Watermark Tool',
        actionLabelUr: 'واٹر مارک ٹول کھولیں',
        tip: 'A 20% opacity ensures background contract text remains completely legible.',
        tipUr: '20 فیصد شفافیت رکھنے سے تحریر باآسانی پڑھی جا سکتی ہے۔',
      },
      {
        stepNumber: 4,
        title: 'Inspect & Wipe Document Metadata',
        titleUr: 'دستاویز کا پوشیدہ میٹا ڈیٹا صاف کریں',
        description:
          'Remove hidden author names, system file paths, and creation timestamps to protect client privacy before emailing.',
        descriptionUr:
          'ای میل کرنے سے پہلے مصنف کا نام اور دیگر پوشیدہ پرائیویٹ معلومات حذف کریں۔',
        toolSlug: 'pdf-metadata-editor',
        actionLabel: 'Open PDF Metadata Editor',
        actionLabelUr: 'پی ڈی ایف میٹا ڈیٹا ایڈیٹر کھولیں',
        tip: 'Click "Clear All Metadata" for a one-click sanitization before sending to third parties.',
        tipUr: 'ایک کلک میں تمام پوشیدہ معلومات کو محفوظ انداز میں صاف کریں۔',
      },
    ],
  },
  {
    id: 'developer-data-prep',
    slug: 'developer-data-prep',
    title: 'Developer Payload Inspection & Data Prep',
    titleUr: 'ڈویلپر ڈیٹا معائنہ اور تیاری کا طریقہ',
    tagline: 'Prettify JSON, validate regex patterns & encode authorization tokens',
    taglineUr: 'جے سن فارمیٹنگ، ریجیکس ٹیسٹنگ اور بیس 64 انکوڈنگ',
    description:
      'Standard data debugging workflow for engineers. Inspect minified server payloads, test regex extraction logic against live text, and prepare Base64 basic authentication headers securely in browser RAM.',
    descriptionUr:
      'سافٹ ویئر ڈویلپرز کے لیے مکمل ٹیسٹنگ پائپ لائن۔ ڈیٹا فارمیٹ کریں، ریجیکس چیک کریں اور بیس 64 تیار کریں۔',
    icon: 'Code2',
    badge: 'API & Debugging',
    badgeUr: 'اے پی آئی اور ڈیبگنگ',
    estimatedMinutes: 4,
    targetAudience: 'Software Engineers, QA Testers, API Integrators',
    targetAudienceUr: 'سافٹ ویئر انجینئرز اور اے پی آئی ڈیولپرز',
    relatedCollectionSlug: 'developer-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Prettify & Validate JSON Response',
        titleUr: 'جے سن ڈیٹا کو فارمیٹ اور چیک کریں',
        description:
          'Paste dense REST webhook data or configuration files to format with 2-space indentation and inspect syntax errors.',
        descriptionUr:
          'سرور سے موصول ہونے والے جے سن ڈیٹا کو خوبصورت بنائیں اور غلطیاں پکڑیں۔',
        toolSlug: 'json-formatter',
        actionLabel: 'Open JSON Formatter',
        actionLabelUr: 'جے سن فارمیٹر کھولیں',
        tip: 'Shows approximate line and column markers for unexpected token parse errors.',
        tipUr: 'غلط کومہ یا بریکٹ فوری نمایاں کر کے لائن نمبر بتاتا ہے۔',
      },
      {
        stepNumber: 2,
        title: 'Test Regex Extraction Patterns',
        titleUr: 'ریجیکس پیٹرن کی جانچ کریں',
        description:
          'Verify your regular expression patterns against sample API output with real-time match highlighting and capture groups.',
        descriptionUr:
          'ڈیٹا سے مخصوص معلومات نکالنے کے لیے ریجیکس پیٹرن ٹیسٹ کریں۔',
        toolSlug: 'regex-tester',
        actionLabel: 'Open Regex Tester',
        actionLabelUr: 'ریجیکس ٹیسٹر کھولیں',
        tip: 'Enforces safe iteration guards to protect your tab from catastrophic backtracking.',
        tipUr: 'براؤزر کو ہینگ ہونے سے بچانے کے لیے حفاظتی گارڈز موجود ہیں۔',
      },
      {
        stepNumber: 3,
        title: 'Generate Base64 Authorization Tokens',
        titleUr: 'بیس 64 ٹوکن تیار کریں',
        description:
          'Convert credentials or API parameters into RFC-4648 Base64 strings for HTTP Basic authorization headers.',
        descriptionUr:
          'ہیڈرز کے لیے ٹیکسٹ کو محفوظ طریقے سے بیس 64 میں تبدیل کریں۔',
        toolSlug: 'base64-encoder-decoder',
        actionLabel: 'Open Base64 Tool',
        actionLabelUr: 'بیس 64 ٹول کھولیں',
        tip: 'Safely encodes multi-byte Unicode and accented characters using UTF-8 TextEncoder.',
        tipUr: 'یونیکوڈ کریکٹرز کو بغیر کسی خرابی کے محفوظ انداز میں انکوڈ کرتا ہے۔',
      },
    ],
  },
  {
    id: 'prepare-youtube-description',
    slug: 'prepare-youtube-description',
    title: 'Prepare YouTube Description & Chapter Timecodes',
    titleUr: 'یوٹیوب ویڈیو ڈسکرپشن اور چیپٹرز تیار کریں',
    tagline: 'Audit copy length, format chronological chapters & generate share QR',
    taglineUr: 'الفاظ گنیں، ویڈیو چیپٹرز بنائیں اور پروموشنل کیو آر کوڈ حاصل کریں',
    description:
      'Publishing workflow for video creators and podcast editors. Verify description character limits, validate chapter timestamps according to YouTube rules, and generate a printable QR code for channel links.',
    descriptionUr:
      'یوٹیوبرز کے لیے مکمل پبلشنگ گائیڈ۔ الفاظ و حروف چیک کریں، ٹائم کوڈز درست کریں اور کیو آر کوڈ بنائیں۔',
    icon: 'Video',
    badge: 'Creator Publishing',
    badgeUr: 'ویڈیو پبلشنگ',
    estimatedMinutes: 4,
    targetAudience: 'YouTubers, Streamers, Podcast Producers',
    targetAudienceUr: 'یوٹیوبرز، اسٹریمرز اور پوڈکاسٹرز',
    relatedCollectionSlug: 'content-creator-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Audit Description Word & Character Count',
        titleUr: 'الفاظ اور حروف کی تعداد چیک کریں',
        description:
          'Draft your video description and verify it complies with YouTube limits (5,000 characters maximum) and social snippets.',
        descriptionUr:
          'ویڈیو ڈسکرپشن لکھیں اور 5000 حروف کی حد کے اندر رہتے ہوئے الفاظ گنیں۔',
        toolSlug: 'word-counter',
        actionLabel: 'Open Word Counter',
        actionLabelUr: 'ورڈ کاؤنٹر کھولیں',
        tip: 'Keep the most important links and callouts within the first 150 characters above the "Show more" fold.',
        tipUr: 'اہم لنکس کو پہلی دو لائنوں میں رکھیں تاکہ وہ بغیر کلک کیے نظر آئیں۔',
      },
      {
        stepNumber: 2,
        title: 'Format & Validate Chapter Timestamps',
        titleUr: 'ویڈیو ٹائم اسٹیمپس درست اور فارمیٹ کریں',
        description:
          'Format chapters starting strictly at 00:00, ensure chronological ordering, and verify minimum 10-second duration requirements.',
        descriptionUr:
          'ٹائم کوڈز کو 00:00 سے شروع کریں اور یوٹیوب کے قوانین کے مطابق ترتیب دیں۔',
        toolSlug: 'youtube-timestamp-formatter',
        actionLabel: 'Open Timestamp Formatter',
        actionLabelUr: 'ٹائم اسٹیمپ فارمیٹر کھولیں',
        tip: 'YouTube requires at least 3 chapters in ascending order to activate timeline scrubbers.',
        tipUr: 'ٹائم لائن فیچر آن ہونے کے لیے کم از کم 3 چیپٹرز کا ہونا لازمی ہے۔',
      },
      {
        stepNumber: 3,
        title: 'Generate Channel Promotional QR Code',
        titleUr: 'پروموشنل کیو آر کوڈ بنائیں',
        description:
          'Create a high-contrast QR code pointing to your video URL, Patreon, or newsletter to display on end screens or merch.',
        descriptionUr:
          'ویڈیو کے آخر میں یا پوسٹرز پر لگانے کے لیے چینل کا کیو آر کوڈ بنائیں۔',
        toolSlug: 'qr-code-generator',
        actionLabel: 'Open QR Code Generator',
        actionLabelUr: 'کیو آر جنریٹر کھولیں',
        tip: 'Static QR codes never expire and function permanently without third-party redirection.',
        tipUr: 'یہ کیو آر کوڈز کبھی ایکسپائر نہیں ہوتے اور ہمیشہ کام کرتے ہیں۔',
      },
    ],
  },
  {
    id: 'extract-pdf-report-data',
    slug: 'extract-pdf-report-data',
    title: 'Extract and Sanitize Information from PDF Documents',
    titleUr: 'پی ڈی ایف سے تحریر نکالنے اور صاف کرنے کا طریقہ',
    tagline: 'Extract selectable text, sanitize line breaks & audit word counts',
    taglineUr: 'پی ڈی ایف سے متن نکالیں، فارمیٹنگ درست کریں اور الفاظ گنیں',
    description:
      'A research and academic pipeline for literature reviews, legal discovery, and data entry. Extract raw text from multi-page PDFs, strip unwanted line breaks and artifacts, then analyze vocabulary and reading time.',
    descriptionUr:
      'تحقیقی مقالوں اور رپورٹس سے تحریر نکالنے اور صاف کرنے کا بہترین طریقہ۔ پی ڈی ایف سے متن نکالیں، اضافی جگہ صاف کریں اور الفاظ گنیں۔',
    icon: 'FileSearch',
    badge: 'Data Extraction',
    badgeUr: 'ڈیٹا ایکسٹریکشن',
    estimatedMinutes: 3,
    targetAudience: 'Students, Researchers, Paralegals, Data Clerks',
    targetAudienceUr: 'طلباء، محققین، اور ڈیٹا اینٹری آپریٹرز',
    relatedCollectionSlug: 'pdf-productivity-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Extract Selectable Text from PDF',
        titleUr: 'پی ڈی ایف سے تحریر اور متن نکالیں',
        description:
          'Load multi-page agreements or academic journals to extract text locally with word count statistics and TXT export.',
        descriptionUr:
          'پی ڈی ایف لوڈ کر کے فوری طور پر تمام متن نکالیں اور ورڈ کاؤنٹ دیکھیں۔',
        toolSlug: 'pdf-text-extractor',
        actionLabel: 'Open PDF Text Extractor',
        actionLabelUr: 'پی ڈی ایف ٹیکسٹ ایکسٹریکٹر کھولیں',
        tip: 'Scanned image-only PDFs with no font streams will prompt that OCR is needed.',
        tipUr: 'اسکین شدہ تصویری پی ڈی ایف میں ٹیکسٹ نہ ہونے پر او سی آر کی نشاندہی کی جاتی ہے۔',
      },
      {
        stepNumber: 2,
        title: 'Clean Up Spacing & Formatting Artifacts',
        titleUr: 'اضافی خالی جگہیں اور لائنیں صاف کریں',
        description:
          'Strip repeated whitespace, soft hyphens, and ragged PDF line breaks to create clean, continuous paragraphs.',
        descriptionUr:
          'پی ڈی ایف کے ٹوٹے ہوئے پیراگراف اور خالی جگہوں کو صاف ستھرا بنائیں۔',
        toolSlug: 'text-cleaner',
        actionLabel: 'Open Text Cleaner',
        actionLabelUr: 'ٹیکسٹ کلینر کھولیں',
        tip: 'Check "Normalize Line Breaks" to stitch together justified PDF column margins.',
        tipUr: 'نارملائز لائن بریکس کی مدد سے تحریر کو رواں پیراگراف میں تبدیل کریں۔',
      },
      {
        stepNumber: 3,
        title: 'Audit Word Counts & Reading Duration',
        titleUr: 'الفاظ کی تعداد اور پڑھنے کا وقت چیک کریں',
        description:
          'Analyze total vocabulary, syllable density, and estimated speaking/reading duration for presentation planning.',
        descriptionUr:
          'صاف شدہ تحریر کے کل الفاظ، حروف اور پڑھنے کا تخمینہ وقت معلوم کریں۔',
        toolSlug: 'word-counter',
        actionLabel: 'Open Word Counter',
        actionLabelUr: 'ورڈ کاؤنٹر کھولیں',
        tip: 'Calculates speaking time at 130 words per minute for rehearsing executive briefings.',
        tipUr: '130 الفاظ فی منٹ کے حساب سے بولنے اور پریزنٹیشن کا وقت بتاتا ہے۔',
      },
    ],
  },
  {
    id: 'prepare-social-media-image',
    slug: 'prepare-social-media-image',
    title: 'Prepare an Image for Social Media',
    titleUr: 'سوشل میڈیا کے لیے تصویر تیار کریں',
    tagline: 'Crop to standard aspect ratios, resize, compress & convert format',
    taglineUr: 'سوشل میڈیا سائز میں تراشیں، ری سائز کریں، کمپریس اور کنورٹ کریں',
    description:
      'A complete 4-step pipeline for creators and influencers. Crop raw graphics to Instagram or YouTube aspect ratios, scale to target pixel resolutions, compress the file, and convert to WebP or JPG.',
    descriptionUr:
      'سوشل میڈیا، انسٹاگرام اور یوٹیوب کے لیے تصاویر کی مکمل تیاری۔ درست ریشو میں تراشیں، سائز کم کریں اور فارمیٹ بدلیں۔',
    icon: 'Image',
    badge: 'Social Media',
    badgeUr: 'سوشل میڈیا',
    estimatedMinutes: 4,
    targetAudience: 'Content Creators, Social Media Managers, Designers',
    targetAudienceUr: 'کنٹینٹ کریئیٹرز، سوشل میڈیا مینیجرز، ڈیزائنرز',
    relatedCollectionSlug: 'image-design-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Crop Image to Target Aspect Ratio',
        titleUr: 'تصویر کو مطلوبہ ریشو میں تراشیں',
        description:
          'Choose a 1:1 square for Instagram feeds or 16:9 for YouTube thumbnails to eliminate awkward mobile cropping.',
        descriptionUr:
          'انسٹاگرام یا یوٹیوب کے لیے تصویر کو 1:1 یا 16:9 میں درست فریم کریں۔',
        toolSlug: 'image-cropper',
        actionLabel: 'Open Image Cropper',
        actionLabelUr: 'امیج کروپر کھولیں',
        tip: 'Locking standard ratios ensures your subject stays perfectly centered across different platforms.',
        tipUr: 'معیاری ریشو منتخب کرنے سے موبائل پر تصویر کٹتی نہیں ہے۔',
      },
      {
        stepNumber: 2,
        title: 'Resize Dimensions with Precision',
        titleUr: 'پکسل سائز کی درستگی',
        description:
          'Set exact display bounds (such as 1080×1080 for Instagram or 1280×720 for YouTube) without stretching.',
        descriptionUr:
          'سوشل میڈیا کے مطلوبہ پکسل سائز (جیسے 1080x1080) پر ری سائز کریں۔',
        toolSlug: 'image-resizer',
        actionLabel: 'Open Image Resizer',
        actionLabelUr: 'امیج ری سائزنگ کھولیں',
        tip: 'Never upscale low-resolution source images to avoid pixelation artifacts.',
        tipUr: 'دھندلاہٹ سے بچنے کے لیے چھوٹی تصویر کو ضرورت سے زیادہ بڑا نہ کریں۔',
      },
      {
        stepNumber: 3,
        title: 'Compress File Weight',
        titleUr: 'فائل کا سائز کم کریں',
        description:
          'Reduce byte weight while keeping visual sharpness intact to avoid platform compression re-encoding.',
        descriptionUr:
          'تصویر کا وزن کم کریں تاکہ سوشل میڈیا پر اپ لوڈ تیز ہو سکے اور کوالٹی خراب نہ ہو۔',
        toolSlug: 'image-compressor',
        actionLabel: 'Open Image Compressor',
        actionLabelUr: 'امیج کمپریسر کھولیں',
        tip: '80%–85% quality provides the optimal balance between clarity and file size.',
        tipUr: '85 فیصد کوالٹی تصویر کو بالکل صاف رکھتے ہوئے سائز کم کرتی ہے۔',
      },
      {
        stepNumber: 4,
        title: 'Convert to Optimal Platform Format',
        titleUr: 'بہترین فارمیٹ میں تبدیل کریں',
        description:
          'Convert to universal JPEG or modern WebP format with flattened transparency for guaranteed platform compatibility.',
        descriptionUr:
          'تصویر کو جے پی جی یا ویب پی میں تبدیل کریں تاکہ ہر پلیٹ فارم پر فوری کھلے۔',
        toolSlug: 'image-format-converter',
        actionLabel: 'Open Image Format Converter',
        actionLabelUr: 'امیج فارمیٹ کنورٹر کھولیں',
        tip: 'Use JPEG with a white background for maximum compatibility on email and social media feeds.',
        tipUr: 'سوشل میڈیا اور ای میل کے لیے سفید بیک گراؤنڈ والی جے پی جی بہترین رہتی ہے۔',
      },
    ],
  },
  {
    id: 'create-brand-color-palette',
    slug: 'create-brand-color-palette',
    title: 'Create a Brand Color Palette from an Image',
    titleUr: 'تصویر سے برانڈ کلر پیلیٹ تیار کریں',
    tagline: 'Extract dominant color swatches & audit WCAG contrast ratios',
    taglineUr: 'تصویر سے نمایاں رنگ نکالیں اور ڈیزائن کنٹراسٹ چیک کریں',
    description:
      'A creative 2-step palette authoring workflow. Extract dominant harmonious colors from reference artwork or logos, then inspect contrast ratios and convert HEX codes to RGB/HSL for CSS implementation.',
    descriptionUr:
      'کسی بھی تصویر یا لوگو سے برانڈ کے رنگ نکالیں اور ڈیزائن کے لیے درست کوڈز حاصل کریں۔',
    icon: 'Palette',
    badge: 'Brand Identity',
    badgeUr: 'برانڈ شناخت',
    estimatedMinutes: 3,
    targetAudience: 'UI Designers, Brand Consultants, Freelancers',
    targetAudienceUr: 'یو آئی ڈیزائنرز، برانڈ کنسلٹنٹس، فری لانسرز',
    relatedCollectionSlug: 'image-design-toolkit',
    steps: [
      {
        stepNumber: 1,
        title: 'Extract Dominant Color Swatches',
        titleUr: 'نمایاں رنگوں کا انتخاب',
        description:
          'Upload inspiration artwork, nature photography, or brand logos to automatically extract 6 to 12 distinct color swatches.',
        descriptionUr:
          'کسی تصویر سے نمایاں 6 سے 12 رنگ نکالیں اور ان کے ہیکس کوڈز حاصل کریں۔',
        toolSlug: 'image-color-palette',
        actionLabel: 'Open Palette Extractor',
        actionLabelUr: 'کلر پیلیٹ ایکسٹریکٹر کھولیں',
        tip: 'Export the palette directly as CSS Custom Properties for immediate use in web styling.',
        tipUr: 'سی ایس ایس ویری ایبلز کی صورت میں پیلیٹ ایکسپورٹ کر کے ویب سائٹ پر استعمال کریں۔',
      },
      {
        stepNumber: 2,
        title: 'Audit Harmonies & Contrast Ratios',
        titleUr: 'کنٹراسٹ اور ہارمونی چیک کریں',
        description:
          'Test extracted HEX codes for WCAG AA/AAA compliance against light and dark backgrounds to ensure accessible web typography.',
        descriptionUr:
          'رنگوں کا کنٹراسٹ اور ہارمونی چیک کریں تاکہ ویب سائٹ پر پڑھنے میں آسانی ہو۔',
        toolSlug: 'color-picker',
        actionLabel: 'Open Color Picker',
        actionLabelUr: 'کلر پکر کھولیں',
        tip: 'Ensure normal body text achieves at least a 4.5:1 contrast ratio against the background.',
        tipUr: 'متن اور پس منظر کے درمیان کم از کم 4.5:1 کا کنٹراسٹ ریشو ہونا ضروری ہے۔',
      },
    ],
  },
];

export function getWorkflows(): readonly ProductivityWorkflow[] {
  return PRODUCTIVITY_WORKFLOWS;
}

export function getWorkflowBySlug(slug: string): ProductivityWorkflow | undefined {
  return PRODUCTIVITY_WORKFLOWS.find((w) => w.slug === slug);
}

export function getToolsForWorkflow(workflow: ProductivityWorkflow): ToolItem[] {
  const slugs = Array.from(new Set(workflow.steps.map((s) => s.toolSlug)));
  return slugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolItem => Boolean(t && t.status === 'available'));
}
