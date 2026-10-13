# URDU LOCALIZATION QUALITY AUDIT & NATIVE-SPEAKER CHECKLIST — ONETOOLHUB (STEP 18)

**Audit Date**: October 13, 2026  
**Auditor**: Localization QA Lead & Urdu UX Specialist  
**Production Site**: https://one-tool-hub-sooty.vercel.app  
**Target Locale**: Urdu (`ur`) / `ur_PK`  

---

## 1. Executive Summary & Linguistic Quality Matrix

OneToolHub’s Urdu localization pilot was audited for technical accuracy, natural register, grammar, terminology consistency, mixed Urdu/English layout rendering, and RTL numbers/code preservation.

| Category / Component | Evaluation Metric | Result | Status |
| :--- | :--- | :--- | :---: |
| **Header & Global Navigation** | Clear phrasing; natural terms | ہوم، تمام ٹولز، کیٹیگریز، لرننگ سینٹر | **VERIFIED** |
| **Language Switcher** | Accessible; reciprocal toggle | "English" / "اردو" with active state | **VERIFIED** |
| **Homepage Hero & Benefits** | High-register modern Urdu | بجلی کی سی رفتار، 100% براؤزر پرائیویسی | **VERIFIED** |
| **Tool Directory & Filtering** | Accurate category taxonomy | طلباء، فری لانسرز، یوٹیوب، ڈویلپرز | **VERIFIED** |
| **All 24 Tool Titles & Metadata** | Complete mapping in `tools-ur.ts` | 24/24 tools mapped with Urdu keywords | **VERIFIED** |
| **Code & Technical Identifiers** | Preserved in LTR | JSON, Regex, UUIDs, Base64 kept LTR | **VERIFIED** |
| **Long-form Urdu Tutorials** | Detailed educational copy | Hub live; deep articles withheld | **REQUIRES HUMAN REVIEW** |

---

## 2. All 24 Tools Urdu Quality Audit

| Tool Slug | English Name | Urdu Localized Name | Tone & Linguistic Verification |
| :--- | :--- | :--- | :---: |
| `json-formatter` | JSON Formatter & Validator | JSON فارمیٹر اور ویلیڈیٹر | Natural & Technical |
| `image-compressor` | Image Compressor | امیج کمپریسر | Clear action verbs |
| `qr-code-generator` | QR Code Generator | QR کوڈ جنریٹر | Familiar terminology |
| `word-counter` | Word & Character Counter | ورڈ اور کریکٹر کاؤنٹر | Accurate academic phrasing |
| `youtube-timestamp-formatter` | YouTube Timestamp Formatter | یوٹیوب ٹائم اسٹیمپ فارمیٹر | Creator-friendly phrasing |
| `gpa-calculator` | College GPA Calculator | کالج اور یونیورسٹی GPA کیلکولیٹر | Accurate Pakistani/int'l terms |
| `invoice-generator` | Invoice Generator | انوائس جنریٹر اور بلنگ ٹول | Professional commercial tone |
| `pdf-merge-split` | PDF Merge & Split | PDF مرج اور اسپلٹ ٹول | Clear document verbs |
| `password-generator` | Secure Password Generator | محفوظ پاس ورڈ جنریٹر | Accurate cryptographic phrasing |
| `image-resizer` | Image Resizer | امیج ریسائزر اور اسکیلر | Clear dimension controls |
| `base64-encoder-decoder` | Base64 Encoder & Decoder | Base64 انکوڈر اور ڈیکوڈر | Standard developer terminology |
| `percentage-calculator` | Percentage Calculator | فیصد (پرسنٹیج) کیلکولیٹر | Plain arithmetic phrasing |
| `pdf-to-image` | PDF to Image Converter | PDF سے JPG اور PNG کنورٹر | Clear conversion directions |
| `image-to-pdf` | Image to PDF Converter | تصاویر (JPG/PNG) سے PDF کنورٹر | Clear multi-photo instructions |
| `pdf-organizer` | PDF Page Organizer | PDF پیج آرگنائزر اور مینیجر | Intuitive reorder phrasing |
| `pdf-watermark` | PDF Watermark Tool | PDF واٹر مارک ٹول | Clear security stamp terms |
| `regex-tester` | Regex Tester & Debugger | ریجیکس (Regex) ٹیسٹر اور ڈیبگر | Preserves English tokens |
| `code-diff-checker` | Code Diff Checker | کوڈ ڈیف (Diff) چیکر | Standard developer wording |
| `color-picker` | Color Picker & Converter | کلر پکر اور کنورٹر | Design-friendly wording |
| `uuid-generator` | UUID Generator & Validator | UUID اور GUID جنریٹر | Standard RFC 4122 terms |
| `text-case-converter` | Text Case Converter | ٹیکسٹ کیس کنورٹر | Clear typographical terms |
| `text-compare` | Text Compare & Diff | ٹیکسٹ موازنہ اور فرق چیکر | Clear prose comparison terms |
| `text-cleaner` | Text Cleaner & Formatter | ٹیکسٹ کلینر اور فارمیٹر | Natural formatting actions |
| `lorem-ipsum-generator` | Lorem Ipsum Generator | Lorem Ipsum ڈمی ٹیکسٹ جنریٹر | Clear placeholder terminology |

---

## 3. Mixed Urdu/English & Technical LTR Guardrails

1. **Bi-Directional Code Editors**:
   - The JSON Formatter, Regex Tester, and Code Diff Checker use `dir="ltr"` and `text-left` containers.
   - Punctuation marks (semicolons, curly braces, quotes) are never inverted.
2. **Numbers and Calculations**:
   - Numeric inputs and currency symbols remain Latin/Arabic digits (`1, 2, 3...`) rather than Urdu numerals to prevent arithmetic library incompatibilities and clipboard errors.
3. **URL and UUID Integrity**:
   - Output URLs and UUID strings remain left-to-right (`text-left font-mono select-all`).

---

## 4. Checklist for Final Native-Speaker Human Review

Before deploying extensive Urdu localized blogs or promotional campaigns, native Urdu speakers should verify:
- [ ] Review font readability across low-DPI Android devices.
- [ ] Confirm no line-break awkwardness on multi-word compound technical terms (e.g. `ویب سائٹ کے کیو آر کوڈ`).
- [ ] Verify that tooltip labels and button hover states in localized views remain intuitive.
- [ ] Ensure that mixed Urdu and English technical sentences flow smoothly from right to left without unexpected punctuation displacement.
