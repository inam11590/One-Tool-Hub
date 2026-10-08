import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LEARN_ARTICLES } from "@/lib/learn";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/learn/ArticleCard";

export function FeaturedGuides() {
  const featuredArticles = LEARN_ARTICLES.filter((a) => a.featured).slice(0, 3);

  return (
    <section
      aria-labelledby="home-featured-guides-heading"
      className="border-t border-slate-200/80 bg-white py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Learning Center</span>
            </div>
            <h2
              id="home-featured-guides-heading"
              className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
            >
              Practical Guides &amp; Step-by-Step Tutorials
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Learn how to validate JSON syntax, optimize web images, format
              YouTube chapters, calculate weighted college GPA, and prepare
              professional invoices.
            </p>
          </div>

          <Link
            href="/learn"
            className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Explore All {LEARN_ARTICLES.length} Tutorials &rarr;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
    </section>
  );
}
