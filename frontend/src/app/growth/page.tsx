import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { GrowthDashboardClient } from '@/components/growth/GrowthDashboardClient';

export const metadata: Metadata = {
  title: 'Local Growth & Traffic Analytics | OneToolHub',
  description: 'Private, in-browser growth analytics and CSV parser for Google Search Console and Google Analytics 4 data. No data leaves your machine.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GrowthPage() {
  return (
    <div className="py-10 bg-slate-900 min-h-screen text-slate-100">
      <Container>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Local-First Private Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Traffic & Growth Intelligence
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Analyze official Google Search Console (GSC) and Google Analytics 4 (GA4) CSV exports. 
            Execution is 100% in-browser memory—zero cookies, zero backend uploads, and zero third-party leakage.
          </p>
        </div>

        <GrowthDashboardClient />
      </Container>
    </div>
  );
}
