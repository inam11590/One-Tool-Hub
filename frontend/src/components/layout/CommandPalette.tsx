'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Star, Clock, Sparkles } from 'lucide-react';
import { TOOLS_REGISTRY } from '@/lib/tools';
import { searchTools, type SearchResultItem } from '@/lib/search';
import { getFavoriteTools, getRecentlyUsedTools } from '@/lib/user-preferences';
import { ToolIcon } from '@/components/ui/ToolIcon';
import { trackToolEvent } from '@/lib/analytics';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const searchInputId = useId();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Get favorites and recents for empty query view
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFavoriteSlugs(getFavoriteTools());
      setRecentSlugs(getRecentlyUsedTools());
      setQuery('');
      setSelectedIndex(0);
      // Small timeout to allow modal mount before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape and outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults: SearchResultItem[] = query.trim()
    ? searchTools(TOOLS_REGISTRY, query, { maxResults: 8 })
    : [];

  const quickTools = !query.trim()
    ? TOOLS_REGISTRY.filter((t) =>
        t.status === 'available' &&
        (favoriteSlugs.includes(t.slug) || recentSlugs.includes(t.slug))
      ).slice(0, 5)
    : [];

  const defaultSuggestedTools = !query.trim() && quickTools.length === 0
    ? TOOLS_REGISTRY.filter((t) => t.status === 'available').slice(0, 5)
    : [];

  const displayedTools = query.trim()
    ? searchResults.map((r) => r.tool)
    : quickTools.length > 0
    ? quickTools
    : defaultSuggestedTools;

  // Handle keyboard list navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (displayedTools.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % displayedTools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayedTools.length) % displayedTools.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetTool = displayedTools[selectedIndex];
      if (targetTool?.href) {
        trackToolEvent('tool_open', {
          tool_slug: targetTool.slug,
          tool_category: targetTool.categoryId,
          operation_type: 'open_from_command_palette',
        });
        onClose();
        router.push(targetTool.href);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement)?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${searchInputId}-label`}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 border border-slate-200">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4">
          <Search className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
          <label id={`${searchInputId}-label`} htmlFor={searchInputId} className="sr-only">
            Search all tools
          </label>
          <input
            id={searchInputId}
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools by name, keyword, or task (e.g. compress, json, gpa)..."
            className="w-full bg-transparent py-4 pl-3 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            autoComplete="off"
            spellCheck="false"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              ESC
            </span>
          )}
        </div>

        {/* Results List or Suggestions */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() && (
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {quickTools.length > 0 ? 'Your Quick Access & Starred Tools' : 'Suggested Utilities'}
            </div>
          )}

          {query.trim() && displayedTools.length > 0 && (
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Matching Tools ({displayedTools.length})
            </div>
          )}

          {displayedTools.length > 0 ? (
            <ul ref={listRef} role="listbox" className="space-y-1">
              {displayedTools.map((tool, idx) => {
                const isSelected = idx === selectedIndex;
                const isFav = favoriteSlugs.includes(tool.slug);
                const isRecent = recentSlugs.includes(tool.slug);

                return (
                  <li
                    key={tool.slug}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (tool.href) {
                        trackToolEvent('tool_open', {
                          tool_slug: tool.slug,
                          tool_category: tool.categoryId,
                          operation_type: 'open_from_command_palette',
                        });
                        onClose();
                        router.push(tool.href);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {tool.name}
                          </p>
                          {isFav && <Star className={`h-3 w-3 ${isSelected ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />}
                          {isRecent && !isFav && <Clock className={`h-3 w-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />}
                        </div>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {tool.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {tool.categoryLabel}
                      </span>
                      <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-800">No tools found matching &quot;{query}&quot;</p>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for general keywords like <button type="button" onClick={() => setQuery('pdf')} className="text-indigo-600 font-semibold underline">pdf</button>, <button type="button" onClick={() => setQuery('json')} className="text-indigo-600 font-semibold underline">json</button>, <button type="button" onClick={() => setQuery('image')} className="text-indigo-600 font-semibold underline">image</button>, or <button type="button" onClick={() => setQuery('gpa')} className="text-indigo-600 font-semibold underline">gpa</button>.
              </p>
            </div>
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px] shadow-2xs">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px] shadow-2xs">↵</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px] shadow-2xs">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
