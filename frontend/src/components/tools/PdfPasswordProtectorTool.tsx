'use client';

import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { ToolFeedbackCard } from '@/components/tools/ToolFeedbackCard';

const TOOL_SLUG = 'pdf-password-protector';

export function PdfPasswordProtectorTool() {
  return (
    <div className="space-y-8">
      {/* Feasibility & Security Architecture Status Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                Feature Status: Blocked
              </span>
              <span className="text-xs text-amber-800 font-medium">
                Cryptographic Safety Gate Enforced
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-amber-950">
              PDF Password Protection is Temporarily Blocked for Security Safety
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed max-w-2xl">
              OneToolHub enforces a strict <strong>Zero-Server-Upload</strong> security invariant. All document utilities must run entirely inside your browser. Genuine PDF password protection requires compliant AES-256 / Standard PDF 2.0 encryption dictionaries.
            </p>
          </div>
        </div>

        {/* Security & Feasibility Findings */}
        <div className="rounded-xl bg-white/90 border border-amber-200 p-4 sm:p-5 space-y-3 text-xs text-slate-700">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Engineering Feasibility Audit Findings:
          </h3>
          <ul className="space-y-2 list-disc list-inside text-slate-600 leading-relaxed">
            <li>
              <strong>Standard Browser PDF Libraries Lack Encryption:</strong> The maintained client-side library (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">pdf-lib</code>) does not provide ISO 32000-compliant PDF encryption.
            </li>
            <li>
              <strong>No Fake Encryption Policy:</strong> Many online utilities mislead users by setting permission flags or XOR masks without actual cryptographic encryption. OneToolHub refuses to deploy unverified or pseudosecure encryption.
            </li>
            <li>
              <strong>No Cloud Document Uploads:</strong> We will never bypass browser limitations by transmitting your confidential PDFs to a remote conversion server.
            </li>
          </ul>
        </div>

        {/* Recommended Safe Offline Alternatives */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            Recommended Safe Offline Alternatives:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-2xs">
              <p className="font-bold text-slate-900 text-xs">macOS Preview</p>
              <p className="mt-1 text-[11px] text-slate-500">File &gt; Export as PDF &gt; Permissions &gt; Require Password (AES-128/256).</p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-2xs">
              <p className="font-bold text-slate-900 text-xs">QPDF CLI (Open Source)</p>
              <p className="mt-1 text-[11px] text-slate-500">Industry-standard terminal tool: <code className="bg-slate-100 px-1 rounded text-[10px]">qpdf --encrypt ...</code></p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-2xs">
              <p className="font-bold text-slate-900 text-xs">Adobe Acrobat / LibreOffice</p>
              <p className="mt-1 text-[11px] text-slate-500">Local document protection with standard AES-256 certificate or password.</p>
            </div>
          </div>
        </div>

        {/* Discover Functional PDF Tools */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Available PDF Tools:</span>
          <Link
            href="/tools/pdf-merge-split"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs"
          >
            PDF Merge &amp; Split
          </Link>
          <Link
            href="/tools/pdf-page-rotator"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs"
          >
            PDF Page Rotator
          </Link>
          <Link
            href="/tools/pdf-text-extractor"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs"
          >
            PDF Text Extractor
          </Link>
          <Link
            href="/tools/pdf-metadata-editor"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs"
          >
            PDF Metadata Editor
          </Link>
        </div>
      </div>

      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF Password Protector" />
    </div>
  );
}
