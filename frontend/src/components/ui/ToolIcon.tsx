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
  KeyRound,
  Scaling,
  Binary,
  Percent,
  FileImage,
  Images,
  Layers,
  Stamp,
  Regex,
  GitCompare,
  Palette,
  Fingerprint,
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
    case "KeyRound":
      return <KeyRound {...props} />;
    case "Scaling":
      return <Scaling {...props} />;
    case "Binary":
      return <Binary {...props} />;
    case "Percent":
      return <Percent {...props} />;
    case "FileImage":
      return <FileImage {...props} />;
    case "Images":
      return <Images {...props} />;
    case "Layers":
      return <Layers {...props} />;
    case "Stamp":
      return <Stamp {...props} />;
    case "Regex":
      return <Regex {...props} />;
    case "GitCompare":
      return <GitCompare {...props} />;
    case "Palette":
      return <Palette {...props} />;
    case "Fingerprint":
      return <Fingerprint {...props} />;
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
