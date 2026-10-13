'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  X,
  Flame,
  RotateCcw,
  Compass,
  Layers,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import {
  getFavoriteTools,
  getRecentlyUsedTools,
  getFrequentlyUsedTools,
  getRecommendedTools,
  clearRecentTools,
  resetAllPreferences,
  toggleFavoriteTool,
  subscribeUserPreferences,
} from '@/lib/user-preferences';
import { getToolBySlug, TOOLS_REGISTRY } from '@/lib/tools';
import { trackRetentionEvent } from '@/lib/analytics';
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
  const [frequentSlugs, setFrequentSlugs] = useState<{ slug: string; count: number }[]>([]);
  const [recommendedSlugs, setRecommendedSlugs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recents' | 'frequent'>('favorites');
  const [isMounted, setIsMounted] = useState(false);
  const [dismissEmptyState, setDismissEmptyState] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const sync = () => {
      setFavoriteSlugs(getFavoriteTools());
      setRecentSlugs(getRecentlyUsedTools());
      setFrequentSlugs(getFrequentlyUsedTools(6));
      setRecommendedSlugs(getRecommendedTools(TOOLS_REGISTRY, 4));
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

  const frequentTools: ToolItem[] = frequentSlugs
    .map((item) => getToolBySlug(item.slug))
    .filter((t): t is ToolItem => Boolean(t && t.status === 'available'));

  const recommendedTools: ToolItem[] = recommendedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolItem => Boolean(t && t.status === 'available'));

  const hasFavorites = favoriteTools.length > 0;
  const hasRecents = recentTools.length > 0;
  const hasFrequent = frequentTools.length > 0;
  const mostRecentTool = recentTools[0] ?? null;

  const handleResetWorkspace = () => {
    resetAllPreferences();
    setShowResetConfirm(false);
    trackRetentionEvent('workspace_reset', { event_category: 'workspace' });
  };

  // Empty state for first-time visitors
  if (!hasFavorites && !hasRecents && !hasFrequent) {
    if (dismissEmptyState) return null;

    const emptyContent = (
      <div className={`rounded-2xl border border-indigo-100/80 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-white p-4 sm:p-5 shadow-xs ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Personalized Workspace &bull; Local &amp; Private
                </h2>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Step 20 Enhanced
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 max-w-xl leading-relaxed">
                Star any tool with the <Star className="inline h-3.5 w-3.5 text-amber-500 fill-amber-400" /> icon to pin it here for instant 1-click access. Your preferences stay 100% inside your browser—no account or login required.
              </p>

              {/* Discovery shortcuts */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href="/tool-finder"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/80 shadow-2xs transition-colors"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Smart Tool Finder</span>
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  <span>Curated Collections</span>
                </Link>
                <Link
                  href="/workflows"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs transition-colors"
                >
                  <WorkflowIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Productivity Workflows</span>
                </Link>
              </div>

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

  // Determine displayed tab
  let displayedTab: 'favorites' | 'recents' | 'frequent' = activeTab;
  if (displayedTab === 'favorites' && !hasFavorites) {
    displayedTab = hasRecents ? 'recents' : (hasFrequent ? 'frequent' : 'favorites');
  } else if (displayedTab === 'recents' && !hasRecents) {
    displayedTab = hasFavorites ? 'favorites' : (hasFrequent ? 'frequent' : 'recents');
  }

  let displayedTools = favoriteTools;
  if (displayedTab === 'recents') displayedTools = recentTools;
  if (displayedTab === 'frequent') displayedTools = frequentTools;

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
          <div className="flex items-center gap-3">
            <Link
              href="/tool-finder"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Compass className="h-3 w-3" />
              <span>Finder</span>
            </Link>
            <Link
              href={mostRecentTool.href || `/tools/${mostRecentTool.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>Resume workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Tabs & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100/70 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
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

            {hasFrequent && (
              <button
                type="button"
                onClick={() => setActiveTab('frequent')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  displayedTab === 'frequent'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Frequent ({frequentTools.length})</span>
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 hidden md:inline">
            Saved securely in your browser
          </span>
        </div>

        {/* Clear History, Reset Controls & Discovery Links */}
        <div className="flex items-center gap-3">
          {displayedTab === 'recents' && hasRecents && (
            <button
              type="button"
              onClick={() => clearRecentTools()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition-colors"
              title="Clear recently used tools history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear recents</span>
            </button>
          )}

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition-colors"
              title="Reset all local workspace preferences"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-xs">
              <span className="text-rose-700 font-medium">Reset all?</span>
              <button
                type="button"
                onClick={handleResetWorkspace}
                className="font-bold text-rose-700 hover:underline"
              >
                Yes
              </button>
              <span className="text-slate-300">&bull;</span>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                No
              </button>
            </div>
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

      {/* Category-based Recommendations */}
      {recommendedTools.length > 0 && (
        <div className="mt-5 pt-4 border-t border-indigo-100/60">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recommended For You
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Based on your activity</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {recommendedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href || `/tools/${tool.slug}`}
                className="group flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 p-2 text-xs hover:border-indigo-300 hover:bg-white transition-all shadow-2xs"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ToolIcon name={tool.icon} className="h-3 w-3" />
                </span>
                <span className="font-medium text-slate-800 truncate group-hover:text-indigo-600">
                  {tool.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (withContainer) {
    return <Container className="pt-6 pb-2">{content}</Container>;
  }

  return content;
}

