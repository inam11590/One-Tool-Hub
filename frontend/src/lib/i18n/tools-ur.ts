export interface LocalizedToolMetadata {
  slug: string;
  name: string;
  shortDescription: string;
  keywords: readonly string[];
}

export const UR_TOOLS_MAP: Record<string, LocalizedToolMetadata> = {
  "json-formatter": {
    slug: "json-formatter",
    name: "JSON فارمیٹر اور ویلیڈیٹر",
    shortDescription: "اپنے براؤزر میں JSON کو فوری خوبصورت بنائیں، منی فائی کریں اور درستگی چیک کریں۔",
    keywords: ["json فارمیٹر", "json ویلیڈیٹر", "json خوبصورت بنائیں", "json درستگی"],
  },
  "image-compressor": {
    slug: "image-compressor",
    name: "امیج کمپریسر",
    shortDescription: "WebP، JPEG اور PNG تصاویر کا سائز معیار برقرار رکھتے ہوئے 80% تک کم کریں۔",
    keywords: ["تصویر کا سائز کم کریں", "امیج کمپریسر", "webp کمپریشن", "آن لائن فوٹو کمپریس"],
  },
  "qr-code-generator": {
    slug: "qr-code-generator",
    name: "QR کوڈ جنریٹر",
    shortDescription: "ویب سائٹس اور ٹیکسٹ کے لیے حسب ضرورت رنگوں کے ساتھ SVG اور PNG کیو آر کوڈ بنائیں۔",
    keywords: ["qr کوڈ بنائیں", "کیو آر کوڈ جنریٹر", "مفت qr کوڈ", "لوگو کے ساتھ qr کوڈ"],
  },
  "word-counter": {
    slug: "word-counter",
    name: "ورڈ اور کریکٹر کاؤنٹر",
    shortDescription: "الفاظ، حروف، جملے اور مطالعے کا تخمینہ وقت لائیو چیک کریں۔",
    keywords: ["الفاظ کی گنتی", "حروف کاؤنٹر", "مضمون ورڈ کاؤنٹ", "پڑھنے کا وقت"],
  },
  "youtube-timestamp-formatter": {
    slug: "youtube-timestamp-formatter",
    name: "یوٹیوب ٹائم اسٹیمپ فارمیٹر",
    shortDescription: "ویڈیو نوٹوں کو یوٹیوب چیپٹرز کے درست فارمیٹ میں تبدیل اور تصدیق کریں۔",
    keywords: ["یوٹیوب چیپٹرز", "ٹائم اسٹیمپ فارمیٹر", "ویڈیو چیپٹر جنریٹر"],
  },
  "gpa-calculator": {
    slug: "gpa-calculator",
    name: "کالج اور یونیورسٹی GPA کیلکولیٹر",
    shortDescription: "کریڈٹ آورز کے ساتھ 4.0 اور 5.0 اسکیل پر سمسٹر اور مجموعی GPA کا درست حساب لگائیں۔",
    keywords: ["gpa کیلکولیٹر", "سی جی پی اے کا حساب", "کالج گریڈ کیلکولیٹر"],
  },
  "invoice-generator": {
    slug: "invoice-generator",
    name: "انوائس جنریٹر اور بلنگ ٹول",
    shortDescription: "ٹیکس، رعایت اور پی ڈی ایف ڈاؤن لوڈ کے ساتھ پیشہ ورانہ کلائنٹ انوائس بنائیں۔",
    keywords: ["مفت انوائس جنریٹر", "انوائس پی ڈی ایف", "بلنگ سافٹ ویئر آن لائن"],
  },
  "pdf-merge-split": {
    slug: "pdf-merge-split",
    name: "PDF مرج اور اسپلٹ ٹول",
    shortDescription: "متعدد پی ڈی ایف فائلیں آپس میں جوڑیں یا مخصوص صفحات کو الگ کریں، 100% نجی۔",
    keywords: ["پی ڈی ایف جوڑیں", "pdf مرج", "pdf صفحات الگ کریں", "پی ڈی ایف تقسیم"],
  },
  "password-generator": {
    slug: "password-generator",
    name: "محفوظ پاس ورڈ جنریٹر",
    shortDescription: "مضبوط، غیر متوقع اور کریپٹو گرافک طور پر محفوظ پاس ورڈز بنائیں جن کا کریک ہونا ناممکن ہو۔",
    keywords: ["مضبوط پاس ورڈ بنائیں", "پاس ورڈ جنریٹر", "محفوظ پاس ورڈ آن لائن"],
  },
  "image-resizer": {
    slug: "image-resizer",
    name: "امیج ریسائزر اور اسکیلر",
    shortDescription: "تصاویر کی چوڑائی اور اونچائی پکسلز میں درست تبدیل کریں اور فائل فارمیٹ بدلیں۔",
    keywords: ["تصویر کا سائز تبدیل کریں", "امیج ریسائزر", "فوٹو اسکیل کریں"],
  },
  "base64-encoder-decoder": {
    slug: "base64-encoder-decoder",
    name: "Base64 انکوڈر اور ڈیکوڈر",
    shortDescription: "متن اور بائنری فائلوں کو Base64 میں محفوظ اور تیز رفتاری سے تبدیل کریں۔",
    keywords: ["base64 انکوڈر", "base64 ڈیکوڈ", "متن سے base64"],
  },
  "percentage-calculator": {
    slug: "percentage-calculator",
    name: "فیصد (پرسنٹیج) کیلکولیٹر",
    shortDescription: "فیصد اضافہ، کمی، تناسب اور عددی تفریق کا فوری اور آسان حساب۔",
    keywords: ["فیصد کیلکولیٹر", "پرسنٹیج نکالیں", "رعایت کا حساب"],
  },
  "pdf-to-image": {
    slug: "pdf-to-image",
    name: "PDF سے JPG اور PNG کنورٹر",
    shortDescription: "پی ڈی ایف کے تمام صفحات کو بہترین کوالٹی کی تصاویر یا زپ فائل میں ڈاؤن لوڈ کریں۔",
    keywords: ["pdf سے تصویر", "pdf سے jpg", "پی ڈی ایف صفحات کنورٹ"],
  },
  "image-to-pdf": {
    slug: "image-to-pdf",
    name: "تصاویر (JPG/PNG) سے PDF کنورٹر",
    shortDescription: "متعدد تصاویر کو ترتیب دے کر ایک خوبصورت پی ڈی ایف دستاویز میں یکجا کریں۔",
    keywords: ["تصویر سے pdf بنائیں", "jpg سے pdf", "فوٹوز کو pdf میں تبدیل"],
  },
  "pdf-organizer": {
    slug: "pdf-organizer",
    name: "PDF پیج آرگنائزر اور مینیجر",
    shortDescription: "پی ڈی ایف کے صفحات کی ترتیب بدلیں، صفحات گھمائیں (روٹیٹ کریں) یا غیر ضروری صفحات ہٹائیں۔",
    keywords: ["pdf صفحات کی ترتیب", "پی ڈی ایف پیج ڈیلیٹ", "پی ڈی ایف روٹیٹ"],
  },
  "pdf-watermark": {
    slug: "pdf-watermark",
    name: "PDF واٹر مارک ٹول",
    shortDescription: "اپنی پی ڈی ایف دستاویزات پر نجی اور پیشہ ورانہ ٹیکسٹ واٹر مارک لگائیں۔",
    keywords: ["pdf پر واٹر مارک لگائیں", "پی ڈی ایف واٹر مارک آن لائن", "مہر لگائیں"],
  },
  "regex-tester": {
    slug: "regex-tester",
    name: "ریجیکس (Regex) ٹیسٹر اور ڈیبگر",
    shortDescription: "ریگولر ایکسپریشنز کو لائیو میچ ہائی لائٹنگ اور گروپس کے ساتھ ٹیسٹ کریں۔",
    keywords: ["regex ٹیسٹر", "ریجیکس ڈیبگر", "ریگولر ایکسپریشنز"],
  },
  "code-diff-checker": {
    slug: "code-diff-checker",
    name: "کوڈ ڈیف (Diff) چیکر",
    shortDescription: "کوڈ اور اسکرپٹس کے دو ورژن کے درمیان تبدیلیوں کا سائیڈ بائی سائیڈ موازنہ کریں۔",
    keywords: ["کوڈ موازنہ", "کوڈ diff چیکر", "فائل کا فرق چیک کریں"],
  },
  "color-picker": {
    slug: "color-picker",
    name: "کلر پکر اور کنورٹر",
    shortDescription: "HEX، RGB اور HSL رنگ کوڈز منتخب کریں اور کنٹراسٹ ریٹنگز چیک کریں۔",
    keywords: ["کلر پکر", "رنگ کا کوڈ معلوم کریں", "hex سے rgb"],
  },
  "uuid-generator": {
    slug: "uuid-generator",
    name: "UUID اور GUID جنریٹر",
    shortDescription: "پروگرامنگ اور ڈیٹا بیس کے لیے RFC 4122 v4 منفرد آئی ڈیز بنائیں اور تصدیق کریں۔",
    keywords: ["uuid جنریٹر", "guid جنریٹر آن لائن", "مفت uuid v4"],
  },
  "text-case-converter": {
    slug: "text-case-converter",
    name: "ٹیکسٹ کیس کنورٹر",
    shortDescription: "متن کو اپر کیس، لوئر کیس، ٹائٹل کیس، کیمل کیس اور اسنیک کیس میں تبدیل کریں۔",
    keywords: ["ٹیکسٹ کیس کنورٹ", "بڑے حروف سے چھوٹے حروف", "title case کنورٹر"],
  },
  "text-compare": {
    slug: "text-compare",
    name: "ٹیکسٹ موازنہ اور فرق چیکر",
    shortDescription: "دو تحریروں یا مضامین کے درمیان الفاظ اور جملوں کے فرق کا واضح موازنہ کریں۔",
    keywords: ["متن کا موازنہ", "ٹیکسٹ compare", "تحریر کا فرق چیک کریں"],
  },
  "text-cleaner": {
    slug: "text-cleaner",
    name: "ٹیکسٹ کلینر اور فارمیٹر",
    shortDescription: "اضافی خالی جگہوں، خالی لائنوں اور HTML ٹیگز کو متن سے فوری صاف کریں۔",
    keywords: ["ٹیکسٹ صاف کریں", "اضافی اسپیس ہٹائیں", "ٹیکسٹ فارمیٹر"],
  },
  "lorem-ipsum-generator": {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum ڈمی ٹیکسٹ جنریٹر",
    shortDescription: "ڈیزائن، ویب سائٹس اور لے آؤٹس کے لیے پیراگراف اور فرضی متن بنائیں۔",
    keywords: ["lorem ipsum جنریٹر", "ڈمی ٹیکسٹ", "فرضی تحریر جنریٹر"],
  },
};
