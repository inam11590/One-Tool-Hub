'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Star,
  Check,
  Share2,
} from 'lucide-react';
import {
  getCollections,
  getToolsForCollection,
  type ToolCollection,
} from '@/lib/collections';
import { toggleFavoriteTool, getFavoriteTools } from '@/lib/user-preferences';
import { trackRetentionEvent } from '@/lib/analytics';
import { ToolIcon } from '@/components/ui/ToolIcon';
import type { ToolItem } from '@/types/tools';

interface CollectionsClientProps {
  lang?: 'en' | 'ur';
}

export function CollectionsClient({ lang = 'en' }: CollectionsClientProps) {
  const isUrdu = lang === 'ur';
  const collections = getCollections();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [favoritedBundle, setFavoritedBundle] = useState<string | null>(null);

  const handleCopyLink = (slug: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${isUrdu ? '/ur' : ''}/collections#${slug}`;
      navigator.clipboard.writeText(url).catch(() => {});
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
      trackRetentionEvent('collection_view', {
        event_category: 'collection',
        item_slug: slug,
      });
    }
  };

  const handleFavoriteAllInBundle = (collection: ToolCollection) => {
    const currentFavs = getFavoriteTools();
    for (const slug of collection.toolSlugs) {
      if (!currentFavs.includes(slug)) {
        toggleFavoriteTool(slug);
      }
    }
    setFavoritedBundle(collection.slug);
    setTimeout(() => setFavoritedBundle(null), 3000);
    trackRetentionEvent('collection_view', {
      event_category: 'collection',
      item_slug: collection.slug,
      count: collection.toolSlugs.length,
    });
  };

  return (
    <div className="space-y-10" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 gap-8">
        {collections.map((col) => {
          const tools: ToolItem[] = getToolsForCollection(col);
          const isCopied = copiedSlug === col.slug;
          const isBundleFavorited = favoritedBundle === col.slug;
          const title = isUrdu ? col.titleUr : col.title;
          const description = isUrdu ? col.descriptionUr : col.description;
          const badge = isUrdu ? col.badgeUr : col.badge;
          const tagline = isUrdu ? col.taglineUr : col.tagline;

          return (
            <div
              key={col.slug}
              id={col.slug}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {badge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{tagline}</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(col.slug)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors"
                    title={isUrdu ? 'مجموعہ کا لنک کاپی کریں' : 'Share collection'}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">
                          {isUrdu ? 'کاپی ہو گیا' : 'Copied!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{isUrdu ? 'شیئر کریں' : 'Share'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFavoriteAllInBundle(col)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 shadow-2xs transition-colors"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>
                      {isBundleFavorited
                        ? isUrdu
                          ? 'شامل کر دیا گیا!'
                          : 'Pinned to Favorites!'
                        : isUrdu
                        ? 'تمام ٹولز پسندیدہ میں پن کریں'
                        : 'Pin All to Workspace'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tools in this collection */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  {isUrdu
                    ? `اس مجموعہ میں شامل ٹولز (${tools.length}):`
                    : `Included Tools (${tools.length}):`}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={isUrdu ? `/ur/tools/${tool.slug}` : `/tools/${tool.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 hover:border-indigo-300 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ToolIcon name={tool.icon} className="h-4 w-4" />
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 truncate">
                            {tool.categoryLabel}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {tool.name}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {tool.shortDescription}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-[11px] font-semibold text-indigo-600 group-hover:text-indigo-700">
                        <span>{isUrdu ? 'کھولیں' : 'Launch'}</span>
                        <ArrowRight className={`ml-1 h-3 w-3 ${isUrdu ? 'rotate-180 mr-1 ml-0' : ''}`} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
