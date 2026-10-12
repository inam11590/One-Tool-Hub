/**
 * Client-Side Lorem Ipsum & Placeholder Text Generator
 *
 * Supported Modes:
 * - Paragraphs (1 to 50)
 * - Sentences (1 to 100)
 * - Words (1 to 1,000)
 *
 * Text Flavors:
 * - Classic Latin: Traditional Cicero-derived vocabulary (dolor, sit, amet, consectetur...)
 * - Plain English: Cohesive, clearly fictional mock English sentences for prototyping UI/UX layouts.
 *
 * 100% In-Browser Local Generation. Zero external APIs.
 */

export type PlaceholderMode = "paragraphs" | "sentences" | "words";
export type PlaceholderFlavor = "latin" | "english";

export interface LoremIpsumOptions {
  mode: PlaceholderMode;
  quantity: number;
  flavor: PlaceholderFlavor;
  startWithLorem: boolean;
  asHtmlParagraphs: boolean;
}

export const LATIN_VOCABULARY = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum", "curabitur", "pretium", "tincidunt", "lacus",
  "rhoncus", "maecenas", "placerat", "vulputate", "neque", "fermentum", "congue", "pellentesque",
  "habitant", "morbi", "tristique", "senectus", "netus", "malesuada", "fames", "ac", "turpis",
  "egestas", "integer", "quis", "metus", "gravida", "ultricies", "sapien", "scelerisque",
  "vestibulum", "facilisis", "pharetra", "dignissim", "hendrerit", "porta", "bibendum", "lobortis",
  "elementum", "imperdiet", "interdum", "posuere", "convallis", "efficitur", "iaculis", "sollicitudin",
];

export const ENGLISH_VOCABULARY = [
  "the", "quick", "adaptive", "interface", "presents", "intuitive", "visual", "components", "across",
  "responsive", "viewports", "modern", "design", "systems", "prioritize", "clarity", "consistency",
  "and", "accessible", "navigation", "principles", "clean", "architecture", "enhances", "maintainability",
  "while", "optimizing", "rendering", "performance", "digital", "prototypes", "accelerate", "collaboration",
  "between", "engineering", "teams", "and", "product", "designers", "carefully", "curated", "color",
  "tokens", "ensure", "inclusive", "contrast", "readability", "for", "every", "user", "flexible",
  "layout", "grids", "adapt", "seamlessly", "to", "desktop", "and", "mobile", "devices", "structured",
  "information", "architecture", "guides", "visitors", "toward", "meaningful", "actions", "rigorous",
  "usability", "testing", "identifies", "potential", "friction", "points", "early", "in", "the",
  "development", "lifecycle", "delightful", "micro-interactions", "provide", "reassuring", "feedback",
];

const CLASSIC_LOREM_PREFIX = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomWord(vocab: string[]): string {
  return vocab[Math.floor(Math.random() * vocab.length)] ?? "ipsum";
}

function generateSentence(vocab: string[], minWords = 6, maxWords = 14): string {
  const wordCount = getRandomInt(minWords, maxWords);
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord(vocab));
  }

  // Capitalize first word and append period
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function generateParagraph(
  vocab: string[],
  minSentences = 4,
  maxSentences = 7
): string {
  const sentenceCount = getRandomInt(minSentences, maxSentences);
  const sentences: string[] = [];

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(vocab));
  }

  return sentences.join(" ");
}

/**
 * Generates custom placeholder text based on user options.
 */
export function generatePlaceholderText(options: LoremIpsumOptions): string {
  const { mode, quantity, flavor, startWithLorem, asHtmlParagraphs } = options;
  const vocab = flavor === "english" ? ENGLISH_VOCABULARY : LATIN_VOCABULARY;

  const safeQuantity = Math.max(1, Math.min(
    mode === "words" ? 1000 : mode === "sentences" ? 100 : 50,
    Math.floor(quantity)
  ));

  let output = "";

  if (mode === "words") {
    const words: string[] = [];
    if (startWithLorem && flavor === "latin") {
      const prefixWords = "lorem ipsum dolor sit amet consectetur adipiscing elit".split(" ");
      words.push(...prefixWords.slice(0, safeQuantity));
    }

    while (words.length < safeQuantity) {
      words.push(getRandomWord(vocab));
    }

    output = words.slice(0, safeQuantity).join(" ");
    output = output.charAt(0).toUpperCase() + output.slice(1);
  } else if (mode === "sentences") {
    const sentences: string[] = [];

    if (startWithLorem && flavor === "latin") {
      sentences.push(CLASSIC_LOREM_PREFIX);
    }

    while (sentences.length < safeQuantity) {
      sentences.push(generateSentence(vocab));
    }

    output = sentences.slice(0, safeQuantity).join(" ");
  } else {
    // mode === "paragraphs"
    const paragraphs: string[] = [];

    for (let p = 0; p < safeQuantity; p++) {
      let para = generateParagraph(vocab);

      if (p === 0 && startWithLorem && flavor === "latin") {
        para = `${CLASSIC_LOREM_PREFIX} ${para}`;
      }

      if (asHtmlParagraphs) {
        paragraphs.push(`<p>${para}</p>`);
      } else {
        paragraphs.push(para);
      }
    }

    output = paragraphs.join(asHtmlParagraphs ? "\n\n" : "\n\n");
  }

  return output;
}
