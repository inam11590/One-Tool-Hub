export type ToolCategoryId =
  | "student"
  | "freelancer"
  | "youtube"
  | "developer";

export type ToolStatus = "available" | "coming-soon";

export type ToolIconName =
  | "Clock"
  | "Braces"
  | "Image"
  | "QrCode"
  | "FileText"
  | "GraduationCap"
  | "Receipt"
  | "Files";

export type CategoryIconName =
  | "GraduationCap"
  | "Briefcase"
  | "Video"
  | "Code2";

export interface ToolCategory {
  id: ToolCategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: CategoryIconName;
  audience: string;
  exampleUseCases: readonly string[];
}

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  categoryId: ToolCategoryId;
  categoryLabel: string;
  icon: ToolIconName;
  status: ToolStatus;
  featured: boolean;
  href?: string;
  keywords: readonly string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: "Zap" | "ShieldCheck" | "UserCheck" | "Smartphone";
}
