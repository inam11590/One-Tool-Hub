# URDU TRANSLATION & LOCALIZATION REVIEW — ONETOOLHUB (STEP 17)

**Review Date**: October 12, 2026  
**Lead Reviewer**: Urdu Language UX Specialist & Senior Localization Engineer  
**Scope**: Public User Interface, Header, Footer, Homepage, 24 Tools Metadata, Learning Center Hub  

---

## 1. Executive Summary & Quality Standard

The Urdu localization pilot for OneToolHub adheres to high-register modern Urdu (*Fasih Urdu*) blended with widely accepted technical terminology. Mechanical/literal machine translations (e.g. translating "JSON" or "WebAssembly" literally) were strictly avoided in favor of practical, developer- and student-friendly phrasing.

---

## 2. Core UI Translation Review

| English Term | Urdu Translation | Linguistic Context & Rationale |
| :--- | :--- | :--- |
| **All Tools** | تمام ٹولز | Standard and concise phrasing for tool directory. |
| **Learning Center** | لرننگ سینٹر | Widely recognized academic terminology. |
| **Categories** | کیٹیگریز | Familiar to modern Urdu tech audiences. |
| **Run / Process** | چلائیں / پروسیس کریں | Active verb conveying in-browser execution. |
| **Reset** | دوبارہ ترتیب دیں | Accurate and unambiguous reset instruction. |
| **Copy to Clipboard** | کاپی کریں | Direct and user-friendly action verb. |
| **Download** | ڈاؤن لوڈ کریں | Universal computing term in Urdu computing. |
| **Private & Local** | نجی اور مقامی: سرور پر کوئی فائل اپ لوڈ نہیں | Explicit security reassurance for users. |

---

## 3. All 24 Tools Urdu Mapping Status

All 24 tools in the suite have been translated and registered in `frontend/src/lib/i18n/tools-ur.ts`:

1. **`json-formatter`**: JSON فارمیٹر اور ویلیڈیٹر — اپنے براؤزر میں JSON کو فوری خوبصورت بنائیں، منی فائی کریں اور درستگی چیک کریں۔
2. **`image-compressor`**: امیج کمپریسر — WebP، JPEG اور PNG تصاویر کا سائز معیار برقرار رکھتے ہوئے 80% تک کم کریں۔
3. **`qr-code-generator`**: QR کوڈ جنریٹر — ویب سائٹس اور ٹیکسٹ کے لیے حسب ضرورت رنگوں کے ساتھ SVG اور PNG کیو آر کوڈ بنائیں۔
4. **`word-counter`**: ورڈ اور کریکٹر کاؤنٹر — الفاظ، حروف، جملے اور مطالعے کا تخمینہ وقت لائیو چیک کریں۔
5. **`youtube-timestamp-formatter`**: یوٹیوب ٹائم اسٹیمپ فارمیٹر — ویڈیو نوٹوں کو یوٹیوب چیپٹرز کے درست فارمیٹ میں تبدیل اور تصدیق کریں۔
6. **`gpa-calculator`**: کالج اور یونیورسٹی GPA کیلکولیٹر — کریڈٹ آورز کے ساتھ 4.0 اور 5.0 اسکیل پر سمسٹر اور مجموعی GPA کا درست حساب لگائیں۔
7. **`invoice-generator`**: انوائس جنریٹر اور بلنگ ٹول — ٹیکس، رعایت اور پی ڈی ایف ڈاؤن لوڈ کے ساتھ پیشہ ورانہ کلائنٹ انوائس بنائیں۔
8. **`pdf-merge-split`**: PDF مرج اور اسپلٹ ٹول — متعدد پی ڈی ایف فائلیں آپس میں جوڑیں یا مخصوص صفحات کو الگ کریں، 100% نجی۔
9. **`password-generator`**: محفوظ پاس ورڈ جنریٹر — مضبوط، غیر متوقع اور کریپٹو گرافک طور پر محفوظ پاس ورڈز بنائیں۔
10. **`image-resizer`**: امیج ریسائزر اور اسکیلر — تصاویر کی چوڑائی اور اونچائی پکسلز میں درست تبدیل کریں اور فائل فارمیٹ بدلیں۔
11. **`base64-encoder-decoder`**: Base64 انکوڈر اور ڈیکوڈر — متن اور بائنری فائلوں کو Base64 میں محفوظ اور تیز رفتاری سے تبدیل کریں۔
12. **`percentage-calculator`**: فیصد (پرسنٹیج) کیلکولیٹر — فیصد اضافہ، کمی، تناسب اور عددی تفریق کا فوری اور آسان حساب۔
13. **`pdf-to-image`**: PDF سے JPG اور PNG کنورٹر — پی ڈی ایف کے تمام صفحات کو بہترین کوالٹی کی تصاویر یا زپ فائل میں ڈاؤن لوڈ کریں۔
14. **`image-to-pdf`**: تصاویر (JPG/PNG) سے PDF کنورٹر — متعدد تصاویر کو ترتیب دے کر ایک خوبصورت پی ڈی ایف دستاویز میں یکجا کریں۔
15. **`pdf-organizer`**: PDF پیج آرگنائزر اور مینیجر — پی ڈی ایف کے صفحات کی ترتیب بدلیں، صفحات گھمائیں یا غیر ضروری صفحات ہٹائیں۔
16. **`pdf-watermark`**: PDF واٹر مارک ٹول — اپنی پی ڈی ایف دستاویزات پر نجی اور پیشہ ورانہ ٹیکسٹ واٹر مارک لگائیں۔
17. **`regex-tester`**: ریجیکس (Regex) ٹیسٹر اور ڈیبگر — ریگولر ایکسپریشنز کو لائیو میچ ہائی لائٹنگ اور گروپس کے ساتھ ٹیسٹ کریں۔
18. **`code-diff-checker`**: کوڈ ڈیف (Diff) چیکر — کوڈ اور اسکرپٹس کے دو ورژن کے درمیان تبدیلیوں کا سائیڈ بائی سائیڈ موازنہ کریں۔
19. **`color-picker`**: کلر پکر اور کنورٹر — HEX، RGB اور HSL رنگ کوڈز منتخب کریں اور کنٹراسٹ ریٹنگز چیک کریں۔
20. **`uuid-generator`**: UUID اور GUID جنریٹر — پروگرامنگ اور ڈیٹا بیس کے لیے RFC 4122 v4 منفرد آئی ڈیز بنائیں اور تصدیق کریں۔
21. **`text-case-converter`**: ٹیکسٹ کیس کنورٹر — متن کو اپر کیس، لوئر کیس، ٹائٹل کیس، کیمل کیس اور اسنیک کیس میں تبدیل کریں۔
22. **`text-compare`**: ٹیکسٹ موازنہ اور فرق چیکر — دو تحریروں یا مضامین کے درمیان الفاظ اور جملوں کے فرق کا واضح موازنہ کریں۔
23. **`text-cleaner`**: ٹیکسٹ کلینر اور فارمیٹر — اضافی خالی جگہوں، خالی لائنوں اور HTML ٹیگز کو متن سے فوری صاف کریں۔
24. **`lorem-ipsum-generator`**: Lorem Ipsum ڈمی ٹیکسٹ جنریٹر — ڈیزائن، ویب سائٹس اور لے آؤٹس کے لیے پیراگراف اور فرضی متن بنائیں۔

---

## 4. Status of Long-Form Urdu Tutorials
Per the Critical Rules (*"Do not automatically publish incomplete translations. If a complete, accurate translation cannot be produced, mark that route as NOT READY and keep it out of production indexing until corrected"*):
- The 24 individual long-form technical tutorials (totalling over 3,000 lines of English instructional copy) are currently available in English.
- The Urdu Learning Center hub route (`/ur/learn`) has been published to provide the localized overview.
- Dedicated `/ur/learn/[slug]` individual tutorial routes are marked as **NOT READY / TRANSLATION REVIEW REQUIRED** and are excluded from the sitemap to prevent thin or incomplete content penalties.
