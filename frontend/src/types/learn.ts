import type { ValidToolSlug } from "@/lib/analytics";
import type { ToolFaqItem, ToolIconName } from "@/types/tools";

export type LearnCategoryId =
  | "developer-tutorials"
  | "image-pdf-guides"
  | "youtube-creator-guides"
  | "student-resources"
  | "freelancer-resources";

export interface LearnCategory {
  id: LearnCategoryId;
  name: string;
  shortName: string;
  description: string;
}

export interface LearnStepItem {
  stepTitle: string;
  stepDescription: string;
  proTip?: string;
}

export interface LearnPracticalExample {
  title: string;
  scenario: string;
  inputLabel?: string;
  inputSample?: string;
  outputLabel?: string;
  outputSample?: string;
  explanation: string;
}

export interface LearnMistakeItem {
  mistake: string;
  whyItHappens: string;
  howToFix: string;
}

export interface LearnTroubleshootingItem {
  symptom: string;
  solution: string;
}

export interface LearnArticle {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  categoryId: LearnCategoryId;
  categoryLabel: string;
  icon: ToolIconName;
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  primaryToolSlug: ValidToolSlug;
  relatedToolSlugs: readonly ValidToolSlug[];
  relatedArticleSlugs: readonly string[];
  keywords: readonly string[];
  introduction: readonly string[];
  problemSolved: {
    heading: string;
    paragraphs: readonly string[];
    keyTakeaways: readonly string[];
  };
  steps: readonly LearnStepItem[];
  practicalExample: LearnPracticalExample;
  commonMistakes: readonly LearnMistakeItem[];
  troubleshooting: readonly LearnTroubleshootingItem[];
  faqs: readonly ToolFaqItem[];
  conclusion: {
    heading: string;
    paragraphs: readonly string[];
    ctaLabel: string;
  };
}

export type LearnArticleSummary = Pick<
  LearnArticle,
  | "slug"
  | "title"
  | "excerpt"
  | "categoryId"
  | "categoryLabel"
  | "icon"
  | "readingTimeMinutes"
  | "featured"
  | "primaryToolSlug"
  | "keywords"
>;

