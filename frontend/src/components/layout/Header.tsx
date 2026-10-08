import Link from "next/link";
import { Layers } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Container } from "@/components/ui/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <Container className="relative flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-lg py-1 pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs transition-colors group-hover:bg-indigo-700">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            OneTool<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <Navigation />
      </Container>
    </header>
  );
}
