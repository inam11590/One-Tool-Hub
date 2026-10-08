import {
  Briefcase,
  Braces,
  Clock,
  Code2,
  Files,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Video,
  Zap,
  type LucideProps,
} from "lucide-react";
import type { CategoryIconName, ToolIconName } from "@/types/tools";

export function ToolIcon({
  name,
  ...props
}: { name: ToolIconName } & LucideProps) {
  switch (name) {
    case "Clock":
      return <Clock {...props} />;
    case "Braces":
      return <Braces {...props} />;
    case "Image":
      return <ImageIcon {...props} />;
    case "QrCode":
      return <QrCode {...props} />;
    case "FileText":
      return <FileText {...props} />;
    case "GraduationCap":
      return <GraduationCap {...props} />;
    case "Receipt":
      return <Receipt {...props} />;
    case "Files":
      return <Files {...props} />;
  }
}

export function CategoryIcon({
  name,
  ...props
}: { name: CategoryIconName } & LucideProps) {
  switch (name) {
    case "GraduationCap":
      return <GraduationCap {...props} />;
    case "Briefcase":
      return <Briefcase {...props} />;
    case "Video":
      return <Video {...props} />;
    case "Code2":
      return <Code2 {...props} />;
  }
}

export function BenefitIcon({
  name,
  ...props
}: {
  name: "Zap" | "ShieldCheck" | "UserCheck" | "Smartphone";
} & LucideProps) {
  switch (name) {
    case "Zap":
      return <Zap {...props} />;
    case "ShieldCheck":
      return <ShieldCheck {...props} />;
    case "UserCheck":
      return <UserCheck {...props} />;
    case "Smartphone":
      return <Smartphone {...props} />;
  }
}
