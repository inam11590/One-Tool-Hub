# PDF Security Review & Cryptographic Feasibility Gate

**Document Version:** 1.0.0  
**Project:** OneToolHub  
**Date:** October 13, 2026  
**Auditor:** Principal Software Architect, Application Security Engineer & Cryptographic Specialist  
**Target Component:** Client-Side PDF Security, Encryption Feasibility & Document Manipulation Suite  

---

## 1. Executive Summary & Feasibility Gate Ruling

During **Step 21 (Advanced PDF & Document Productivity Expansion)**, OneToolHub evaluated four new document utilities:
1. **PDF Password Protector** (`/tools/pdf-password-protector`)
2. **PDF Text Extractor** (`/tools/pdf-text-extractor`)
3. **PDF Page Rotator** (`/tools/pdf-page-rotator`)
4. **PDF Metadata Viewer & Editor** (`/tools/pdf-metadata-editor`)

### Formal Feasibility Ruling on PDF Password Protector: BLOCKED (Ethical Security Policy)
A rigorous cryptographic feasibility gate was executed on the installed PDF processing engines (`pdf-lib@^1.17.1` and `pdfjs-dist@^4.10.38`):
* **Prototype Inspection Result:** `PDFDocument.prototype.encrypt` is `undefined`. `pdf-lib` has no native cryptographic encryption capabilities (ISO 32000-1 / ISO 32000-2 Section 7.6).
* **The "Fake Security" Dilemma:** Many disreputable web utilities claim to "password-protect" PDFs in the browser by either setting user access permissions flags (`/P` dictionary entries) without encrypting data streams, or applying XOR-based masks. In ISO PDF standards, permission flags without an encrypted `/Encrypt` dictionary are ignored by standard PDF readers, PDF.js, and web browsers.
* **The "Cloud Upload" Dilemma:** Other web tools provide real AES-256 PDF encryption by secretly uploading user files to remote cloud servers running `qpdf`, `poppler`, or `ghostscript`. This directly violates OneToolHub's foundational **Zero-Server-Upload Privacy Guarantee**.
* **Decision:** In strict accordance with the Step 21 protocol, OneToolHub refused to ship insecure cosmetic locks or covert cloud pipelines. **PDF Password Protector is formally marked as BLOCKED**, assigned `status: "coming-soon"` in the tool registry, excluded from functional tools counts, assigned `noIndex: true`, and provisioned with an educational **Security Advisory and Feasibility Review Card** that guides users to secure, 100% offline OS-native solutions.

---

## 2. Cryptographic Analysis of PDF Encryption Standards

### 2.1 PDF Encryption Architecture (ISO 32000-1 §7.6)
PDF document encryption requires an `/Encrypt` dictionary residing at the root document trailer containing:
* **Filter:** Standard security handler (`/Standard`).
* **V (Version):** Encryption algorithm code (`4` for AES-128, `5` for AES-256).
* **R (Revision):** Security handler revision (`5` or `6` for ISO 32000-2 AES-256 encryption).
* **O (Owner Password Hash):** 32-byte or 127-byte validation hash computed via iterative SHA-256/SHA-384/SHA-512 and AES key derivation.
* **U (User Password Hash):** 32-byte or 127-byte hash for document access authentication.
* **OE / UE (Owner & User Encryption Keys):** Authenticated key encapsulation blocks.
* **Perms:** Encrypted 16-byte permissions check block confirming successful decryption.
* **Stream & String Encryption:** Every uncompressed stream object (`/FlateDecode`, fonts, images, content streams) must be individually encrypted using AES in CBC or CFB mode with unique object/generation-derived IVs or random 16-byte salt vectors.

### 2.2 Why Pure In-Browser Client Encryption is Challenging Without Heavy WASM
1. **Object Graph Serialization:** PDF files are cross-reference table (`xref`) indexed binary graphs. Encrypting objects requires walking the indirect object table, intercepting every stream before compression, applying authenticated cipher suites, and generating cryptographically aligned byte offsets for the trailer xref table.
2. **Library Status:** Standard npm packages (`pdf-lib`, `jspdf`, `pdfjs-dist`) do not implement Revision 5/6 security handlers.
3. **WASM Overhead & Stability:** Packaging a full C++ `qpdf` or Rust `lopdf` build compiled to WebAssembly requires 12–25 MB binary payloads, multithreaded SharedArrayBuffer support, and COOP/COEP header constraints that degrade Core Web Vitals and CDN caching.

---

## 3. Threat Model & Abuse Resistance for Functional Tools

| Threat Vector | Attack Scenario | Defense Mechanism in OneToolHub | Status |
|---|---|---|---|
| **Malicious PDF Payloads** | Embedded `/JavaScript` action streams, buffer overflows, or launch actions (`/Launch`). | All operations parse PDFs using sandboxed web workers (`pdfjs-dist`) and clean AST generation (`pdf-lib`). Active JavaScript streams are neutralized; files are never executed. | **MITIGATED** |
| **Silent Exfiltration** | Sensitive financial or legal documents transmitted to analytics or telemetry. | Zero telemetry hooks touch file contents. File names, page counts, and metadata values are strictly excluded from GA4 and operational RUM logs. | **VERIFIED** |
| **ZIP Slip / Path Traversal** | File download attacks attempting path traversal via crafted names. | File export names are sanitized with strict regex, stripping directories and enforcing standard extensions (`.txt`, `.pdf`). | **MITIGATED** |
| **De-anonymization via Metadata** | Leaking author usernames, printer network UNC paths, or software versions. | The PDF Metadata Editor provides a 1-click "Clear All Metadata" wipe that zeros out Title, Author, Subject, Keywords, Creator, and Producer. | **VERIFIED** |
| **Denial of Service (DoS)** | Billion-laugh style PDF compression bombs or 10,000-page memory starvation. | Enforced `MAX_FILE_SIZE = 50 MB` and `MAX_PAGES = 300`. Web worker execution prevents UI thread lockup. | **MITIGATED** |

---

## 4. Transparent User Security Recommendations

For users requiring cryptographically secure, military-grade PDF password protection without cloud exposure, OneToolHub advises the following zero-trust offline workflows:

1. **macOS Native Preview (Quartz Security):**
   * Open document in Preview → File → Export as PDF...
   * Check "Encrypt" → Select AES-256 → Enter User/Owner password.
   * *Security Rating: High (100% offline, hardware-accelerated Apple Quartz AES-256).*
2. **Open-Source QPDF CLI (Audited Standard):**
   * Run command: `qpdf --encrypt <user-password> <owner-password> 256 -- input.pdf output_protected.pdf`
   * *Security Rating: Military-grade (Deterministic, open-source, fully offline).*
3. **LibreOffice / OpenOffice Suite:**
   * Open in LibreOffice Writer / Draw → Export as PDF → Security Tab → Set Passwords → Encrypt with AES-256.
   * *Security Rating: High (Cross-platform, open-source).*

---

## 5. Security Sign-Off

* **Zero Fake Security:** Confirmed. No deceptive permission masks were deployed.
* **Zero Cloud Transmissions:** Confirmed. 100% in-browser processing via Web APIs.
* **Cryptographic Advisory Published:** Confirmed. Route `/tools/pdf-password-protector` serves an educational advisory with `noIndex: true`.
* **Signature:** Principal Application Security Engineer, OneToolHub
