'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Clock, Trash2, ArrowRight, Sparkles, X } from 'lucide-react';
import {
  getFavoriteTools,
  getRecentlyUsedTools,
  clearRecentTools,
  toggleFavoriteTool,
  subscribeUserPreferences,
} from '@/lib/user-preferences';
import { getToolBySlug } from '@/lib/tools';
import { ToolIcon } from '@/components/ui/ToolIcon';
import { Container } from '@/components/ui/Container';
import type { ToolItem } from '@/types/tools';

interface QuickAccessToolsProps {
  className?: string;
  withContainer?: boolean;
}

export function QuickAccessTools({ className = '', withContainer = false }: QuickAccessToolsProps) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recents'>('favorites');
  const [isMounted, setIsMounted] = useState(false);
  const [dismissEmptyState, setDismissEmptyState] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const sync = () => {
      setFavoriteSlugs(getFavoriteTools());
      setRecentSlugs(getRecentlyUsedTools());
    };
    sync();
    const unsubscribe = subscribeUserPreferences(sync);
    return () => unsubscribe();
  }, []);

  if (!isMounted) return null;

  const favoriteTools: ToolItem[] = favoriteSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolItem => Boolean(t && t.status === 'available'));

  const recentTools: ToolItem[] = recentSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolItem => Boolean(t && t.status === 'available'));

  const hasFavorites = favoriteTools.length > 0;
  const hasRecents = recentTools.length > 0;
  const mostRecentTool = recentTools[0] ?? null;

  // Empty state for first-time visitors
  if (!hasFavorites && !hasRecents) {
    if (dismissEmptyState) return null;

    const emptyContent = (
      <div className={`rounded-2xl border border-indigo-100/80 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-white p-4 sm:p-5 shadow-xs ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Personalized Workspace &bull; Local &amp; Private
              </h2>
              <p className="mt-1 text-xs text-slate-600 max-w-xl leading-relaxed">
                Star any tool with the <Star className="inline h-3.5 w-3.5 text-amber-500 fill-amber-400" /> icon to pin it here for instant 1-click access. Your preferences stay 100% inside your browser—no account or login required.
              </p>

              {/* Starter Quick Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Popular starter tools:</span>
                {['json-formatter', 'image-compressor', 'gpa-calculator', 'invoice-generator'].map((slug) => {
                  const tool = getToolBySlug(slug);
                  if (!tool) return null;
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => toggleFavoriteTool(slug)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs transition-colors"
                      title={`Star ${tool.name}`}
                    >
                      <Star className="h-3 w-3 text-slate-400" />
                      <span>{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissEmptyState(true)}
            aria-label="Dismiss workspace tip"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );

    return withContainer ? <Container className="pt-6 pb-2">{emptyContent}</Container> : emptyContent;
  }

  // Auto-switch to recents if no favorites yet
  const displayedTab = !hasFavorites && hasRecents ? 'recents' : activeTab;
  const displayedTools = displayedTab === 'favorites' ? favoriteTools : recentTools;

  const content = (
    <div
      className={`rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50 p-5 shadow-xs ${className}`}
      aria-label="Personalized Workspace"
    >
      {/* Most Recent Spotlight Banner */}
      {mostRecentTool && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white/90 border border-indigo-100/80 px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600">
              Jump back in: <strong className="font-semibold text-slate-900">{mostRecentTool.name}</strong>
            </span>
          </div>
          <Link
            href={mostRecentTool.href || `/tools/${mostRecentTool.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span>Resume workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Tabs & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white p-1 shadow-2xs border border-slate-200">
            {hasFavorites && (
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  displayedTab === 'favorites'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Favorites ({favoriteTools.length})</span>
              </button>
            )}

            {hasRecents && (
              <button
                type="button"
                onClick={() => setActiveTab('recents')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  displayedTab === 'recents'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Recent ({recentTools.length})</span>
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 hidden md:inline">
            Saved securely in your browser
          </span>
        </div>

        {/* Clear History or Category Shortcuts */}
        <div className="flex items-center gap-3">
          {displayedTab === 'recents' && hasRecents && (
            <button
              type="button"
              onClick={() => clearRecentTools()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition-colors"
              title="Clear recently used tools history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear history</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedTools.map((tool) => (
          <div
            key={tool.slug}
            className="group relative flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-xs"
          >
            <Link
              href={tool.href || `/tools/${tool.slug}`}
              className="flex items-center gap-3 min-w-0 flex-1 focus:outline-hidden"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ToolIcon name={tool.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{tool.categoryLabel}</p>
              </div>
            </Link>

            <div className="flex items-center gap-1 pl-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavoriteTool(tool.slug);
                }}
                className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition-colors"
                title={favoriteSlugs.includes(tool.slug) ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={favoriteSlugs.includes(tool.slug) ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    favoriteSlugs.includes(tool.slug)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-400'
                  }`}
                />
              </button>
              <Link
                href={tool.href || `/tools/${tool.slug}`}
                className="p-1.5 text-slate-400 group-hover:text-indigo-600 transition-colors"
                aria-label={`Open ${tool.name}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (withContainer) {
    return <Container className="pt-6 pb-2">{content}</Container>;
  }

  return content;
}
