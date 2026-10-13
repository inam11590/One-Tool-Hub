import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const PdfPasswordProtectorTool = dynamic(
  () =>
    import("@/components/tools/PdfPasswordProtectorTool").then(
      (mod) => mod.PdfPasswordProtectorTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading Security Advisory...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "pdf-password-protector";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Password Protection Security Advisory — OneToolHub",
  description:
    "Cryptographic feasibility review and security advisory regarding client-side PDF password encryption and privacy-safe offline alternatives.",
  path: `/tools/${TOOL_SLUG}`,
  noIndex: true,
});

const OVERVIEW =
  "OneToolHub upholds a strict zero-server-upload privacy guarantee: all tools operate entirely within your browser's local sandbox without transmitting your documents to remote cloud infrastructure. Standard PDF encryption requires authenticated AES-256 or RC4 stream transformation with complex revision 5/6 security handlers. Because client-side JavaScript PDF engines currently lack secure, audited cryptographic encryption primitives, this tool is marked as BLOCKED rather than deploying insecure 'fake permissions' or sending your private files to third-party servers.";

const FEATURES = [
  "Strict zero-fake-security policy: no cosmetic permission flags that give a false sense of protection.",
  "100% privacy preservation: documents are never transmitted to cloud servers for server-side encryption.",
  "Cryptographic architecture transparency explaining PDF revision 5/6 AES-256 security handlers.",
  "Clear offline recommendations using native OS tools (macOS Preview, Windows PDF print, LibreOffice, QPDF CLI).",
] as const;

const EXAMPLES = [
  {
    title: "Offline Password Protection via macOS Preview",
    description: "Open any PDF in macOS Preview → File → Export as PDF → Check 'Encrypt' → Set AES-128/256 password.",
    sample: "contract.pdf → Native macOS Quartz Security → contract-encrypted.pdf (100% offline & secure)",
  },
  {
    title: "Offline Encryption via Open-Source QPDF CLI",
    description: "Use the audited command-line utility QPDF to encrypt documents with AES-256 without sending files over the network.",
    sample: "qpdf --encrypt user_pw owner_pw 256 -- input.pdf encrypted.pdf",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Understand Privacy Boundary",
    stepDescription: "Many online 'PDF protectors' upload your confidential contracts and bank statements to remote servers to run server-side tools.",
  },
  {
    stepTitle: "Avoid Insecure Client Hacks",
    stepDescription: "Tools that claim to 'lock' PDFs client-side without standard cryptographic stream ciphers are easily bypassed in 2 seconds.",
  },
  {
    stepTitle: "Use Verified Offline Tools",
    stepDescription: "Protect sensitive personal data by using native operating system utilities (macOS Preview, LibreOffice, or QPDF CLI).",
  },
] as const;

const FAQS = [
  {
    question: "Why doesn't OneToolHub provide instant PDF password locking in the browser?",
    answer:
      "Client-side PDF libraries (such as pdf-lib) do not natively implement ISO 32000-1 AES-256 encryption. Other online tools achieve this by uploading your documents to their servers. Doing so violates OneToolHub's zero-server-upload privacy promise.",
  },
  {
    question: "Why not just disable copying or editing using PDF permission flags?",
    answer:
      "PDF permission flags without cryptographic encryption are easily stripped or ignored by modern PDF viewers and browsers. Deploying 'fake encryption' would mislead users into a false sense of security.",
  },
  {
    question: "Will OneToolHub support client-side PDF encryption in the future?",
    answer:
      "Yes. We are actively evaluating audited WebAssembly (WASM) cryptographic modules that can securely perform AES-256 PDF encryption entirely client-side without server dependencies.",
  },
] as const;

export default function PdfPasswordProtectorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Password Protector (Security Advisory)"
      description="Cryptographic feasibility review and security advisory regarding client-side PDF password encryption."
      privacyNote="Zero document upload guarantee: OneToolHub does not compromise security with fake encryption or unvetted cloud uploads."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfPasswordProtectorTool />
    </ToolPageShell>
  );
}
