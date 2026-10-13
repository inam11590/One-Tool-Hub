'use client';

import { useState, useId, useTransition } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  X,
  Star,
} from 'lucide-react';
import {
  findToolsForTask,
  TASK_SUGGESTIONS,
  type ToolFinderResult,
  type ToolFinderMatch,
} from '@/lib/tool-finder';
import { isFavoriteTool, toggleFavoriteTool } from '@/lib/user-preferences';
import { trackRetentionEvent } from '@/lib/analytics';
import { ToolIcon } from '@/components/ui/ToolIcon';

interface ToolFinderClientProps {
  initialQuery?: string;
  lang?: 'en' | 'ur';
}

export function ToolFinderClient({
  initialQuery = '',
  lang = 'en',
}: ToolFinderClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [, startTransition] = useTransition();
  const inputId = useId();

  const isUrdu = lang === 'ur';

  // Compute matched tools deterministically
  const searchOutput: ToolFinderResult = findToolsForTask(query, {
    maxResults: 8,
    locale: lang,
  });

  const filteredMatches: ToolFinderMatch[] = searchOutput.matches.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.tool.categoryId === selectedCategory;
  });

  const handleSuggestionClick = (taskText: string) => {
    startTransition(() => {
      setQuery(taskText);
    });
    trackRetentionEvent('tool_finder_search', {
      event_category: 'discovery',
      count: 1,
    });
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleToolSelect = (slug: string) => {
    trackRetentionEvent('tool_finder_select', {
      event_category: 'discovery',
      item_slug: slug,
    });
  };

  return (
    <div className="space-y-8" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Search Input Box */}
      <div className="relative rounded-2xl border border-indigo-100 bg-white p-4 sm:p-6 shadow-sm">
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          {isUrdu
            ? 'آپ کیا کام مکمل کرنا چاہتے ہیں؟'
            : 'What task or goal do you want to accomplish?'}
        </label>
        <div className="relative flex items-center">
          <Search
            className={`absolute ${
              isUrdu ? 'right-4' : 'left-4'
            } h-5 w-5 text-slate-400 pointer-events-none`}
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 2) {
                trackRetentionEvent('tool_finder_search', {
                  event_category: 'discovery',
                  count: 1,
                });
              }
            }}
            placeholder={
              isUrdu
                ? 'مثال: تصویر کا سائز کم کریں، پی ڈی ایف جوڑیں، کیو آر کوڈ بنائیں...'
                : 'e.g., compress photos for my website, merge PDF invoices, format json...'
            }
            className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 ${
              isUrdu ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12 text-left'
            } text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute ${
                isUrdu ? 'left-3' : 'right-3'
              } p-1 text-slate-400 hover:text-slate-600 rounded-md`}
              aria-label={isUrdu ? 'صاف کریں' : 'Clear input'}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Task suggestions pills */}
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">
            {isUrdu ? 'تجویز کردہ عام کام:' : 'Popular task suggestions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {TASK_SUGGESTIONS.map((suggestion) => {
              const text = isUrdu ? suggestion.queryUr : suggestion.query;
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(text)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    query === text
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {isUrdu ? 'زمرہ فلٹر:' : 'Filter category:'}
          </span>
          {[
            { id: 'all', label: isUrdu ? 'تمام زمرہ جات' : 'All Categories' },
            { id: 'student', label: isUrdu ? 'طلباء' : 'Student' },
            { id: 'freelancer', label: isUrdu ? 'فری لانسر' : 'Freelancer' },
            { id: 'youtube', label: isUrdu ? 'یوٹیوب / تخلیق کار' : 'Creator' },
            { id: 'developer', label: isUrdu ? 'ڈیولپر' : 'Developer' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            {isUrdu
              ? `ملنے والے ٹولز (${filteredMatches.length})`
              : `Matched Tools (${filteredMatches.length})`}
          </h2>
        </div>
        {query && (
          <span className="text-xs text-slate-500">
            {isUrdu
              ? `نتیجہ برائے: "${query}"`
              : `Results for: "${query}"`}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map(({ tool, reason, reasonUr }) => {
            const isFav = isFavoriteTool(tool.slug);
            const toolHref = isUrdu
              ? `/ur/tools/${tool.slug}`
              : `/tools/${tool.slug}`;
            const tutorialHref = isUrdu
              ? `/ur/learn/${tool.slug}`
              : `/learn/${tool.slug}`;

            return (
              <div
                key={tool.slug}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ToolIcon name={tool.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <Link
                          href={toolHref}
                          onClick={() => handleToolSelect(tool.slug)}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {tool.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">
                          {tool.categoryLabel}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavoriteTool(tool.slug)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      aria-label={`Favorite ${tool.name}`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {tool.shortDescription}
                  </p>

                  {/* Match Reason Banner */}
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 text-[11px] text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">{isUrdu ? reasonUr : reason}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={tutorialHref}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{isUrdu ? 'رہنما گائیڈ' : 'Tutorial Guide'}</span>
                  </Link>

                  <Link
                    href={toolHref}
                    onClick={() => handleToolSelect(tool.slug)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors"
                  >
                    <span>{isUrdu ? 'ٹول کھولیں' : 'Launch Tool'}</span>
                    <ArrowRight className={`h-3.5 w-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-2 text-sm font-bold text-slate-900">
            {isUrdu ? 'کوئی موزوں ٹول نہیں ملا' : 'No matching tools found'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {isUrdu
              ? 'براہ کرم کوئی دوسرا جملہ آزمائیں یا اوپر دی گئی تجاویز میں سے منتخب کریں۔'
              : 'Try different task keywords (e.g. compress, calculate, merge, format) or click one of the suggested tasks above.'}
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            {isUrdu ? 'فلٹر صاف کریں' : 'Reset search'}
          </button>
        </div>
      )}
    </div>
  );
}
