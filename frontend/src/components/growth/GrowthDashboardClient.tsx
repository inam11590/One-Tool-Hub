"use client";

import React, { useState, useTransition } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Upload,
  Trash2,
  FileText,
  Wrench,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  parseCsvText,
  parseGscQueries,
  parseGscPages,
  parseGscCountries,
  parseGa4Pages,
  buildGrowthSummary,
  type GrowthMetricsSummary,
} from "@/lib/growth-analytics";

export function GrowthDashboardClient() {
  const [summary, setSummary] = useState<GrowthMetricsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"queries" | "pages" | "tools" | "countries">("queries");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadedFileNames, setLoadedFileNames] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    const fileList = Array.from(files);
    const newFileNames: string[] = [];

    startTransition(async () => {
      try {
        let queries: ReturnType<typeof parseGscQueries> = [];
        let pages: ReturnType<typeof parseGscPages> = [];
        let countries: ReturnType<typeof parseGscCountries> = [];
        let gaPages: ReturnType<typeof parseGa4Pages> = [];

        for (const file of fileList) {
          newFileNames.push(file.name);
          const text = await file.text();
          const records = parseCsvText(text);

          if (records.length === 0) continue;

          const sampleKeys = Object.keys(records[0] || {});

          if (sampleKeys.includes("query") || sampleKeys.includes("top_queries")) {
            queries = parseGscQueries(records);
          } else if (sampleKeys.includes("page") || sampleKeys.includes("top_pages")) {
            pages = parseGscPages(records);
          } else if (sampleKeys.includes("country") || sampleKeys.includes("country_name")) {
            countries = parseGscCountries(records);
          } else if (
            sampleKeys.includes("page_path") ||
            sampleKeys.includes("page_path_and_screen_class") ||
            sampleKeys.includes("views")
          ) {
            gaPages = parseGa4Pages(records);
          }
        }

        const calculated = buildGrowthSummary({
          queries,
          pages,
          countries,
          gaPages,
        });

        if (
          calculated.totalClicks === 0 &&
          calculated.totalImpressions === 0 &&
          calculated.totalViews === 0 &&
          queries.length === 0 &&
          pages.length === 0
        ) {
          setErrorMessage(
            "Could not detect valid Google Search Console or GA4 columns in the uploaded CSV files. Please ensure you upload standard export files (e.g. Queries.csv, Pages.csv, or Pages_and_screens.csv)."
          );
        } else {
          setSummary(calculated);
          setLoadedFileNames(newFileNames);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? `Failed to parse CSV: ${err.message}`
            : "An error occurred while reading the CSV file."
        );
      }
    });
  };

  const handleClear = () => {
    setSummary(null);
    setLoadedFileNames([]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      {/* Privacy Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs leading-relaxed text-indigo-950 sm:text-sm">
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
        <div>
          <strong className="font-semibold text-indigo-900">100% Local &amp; Private Analysis:</strong>{" "}
          Files uploaded here are processed entirely in your web browser memory. No metrics, query logs,
          or analytics files are ever uploaded or transmitted to any server.
        </div>
      </div>

      {/* CSV File Upload Dropzone */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center transition-colors hover:border-indigo-400 sm:p-8">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-base font-bold text-slate-900 sm:text-lg">
            Import Search Console or GA4 CSV Export
          </h2>
          <p className="mt-1.5 text-xs text-slate-600 sm:text-sm">
            Drag and drop or select CSV files exported from Google Search Console (Queries, Pages, Countries)
            or Google Analytics 4 (Pages &amp; Screens).
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 sm:text-sm">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              <span>{isPending ? "Parsing CSV..." : "Choose CSV Files"}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                multiple
                onChange={handleFileUpload}
                className="sr-only"
                disabled={isPending}
              />
            </label>

            {summary ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
              >
                <Trash2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>Clear Data</span>
              </button>
            ) : null}
          </div>

          {loadedFileNames.length > 0 ? (
            <p className="mt-3 text-xs text-emerald-700 font-medium">
              Loaded: {loadedFileNames.join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs leading-relaxed text-rose-900 sm:text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <div>{errorMessage}</div>
        </div>
      ) : null}

      {/* Dashboard Metrics (When CSV is Loaded) */}
      {summary ? (
        <div className="space-y-8">
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Clicks
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {summary.totalClicks.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Impressions
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {summary.totalImpressions.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average CTR
              </span>
              <p className="mt-2 text-2xl font-black text-indigo-600">
                {summary.averageCtr}%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Position
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {summary.averagePosition > 0 ? summary.averagePosition : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pageviews
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {summary.totalViews > 0 ? summary.totalViews.toLocaleString() : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Users
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {summary.totalActiveUsers > 0
                  ? summary.totalActiveUsers.toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>

          {/* Breakdown Navigation Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-6 text-sm font-semibold" aria-label="Report breakdowns">
              <button
                type="button"
                onClick={() => setActiveTab("queries")}
                className={`border-b-2 pb-3 transition-colors ${
                  activeTab === "queries"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Top Queries ({summary.topQueries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pages")}
                className={`border-b-2 pb-3 transition-colors ${
                  activeTab === "pages"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Landing Pages ({summary.topPages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tools")}
                className={`border-b-2 pb-3 transition-colors ${
                  activeTab === "tools"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Tools &amp; Guides ({summary.topTools.length + summary.topTutorials.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("countries")}
                className={`border-b-2 pb-3 transition-colors ${
                  activeTab === "countries"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Countries ({summary.topCountries.length})
              </button>
            </nav>
          </div>

          {/* Tab Content: Queries */}
          {activeTab === "queries" ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Organic Search Queries
                </h3>
              </div>
              {summary.topQueries.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No query data found in the uploaded CSV files.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Search Query</th>
                        <th className="px-6 py-3 text-right">Clicks</th>
                        <th className="px-6 py-3 text-right">Impressions</th>
                        <th className="px-6 py-3 text-right">CTR</th>
                        <th className="px-6 py-3 text-right">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {summary.topQueries.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-6 py-3.5 font-medium text-slate-900">
                            {q.query}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                            {q.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {q.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right text-indigo-600 font-medium">
                            {q.ctr.toFixed(1)}%
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {q.position.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {/* Tab Content: Pages */}
          {activeTab === "pages" ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Top Landing Pages
                </h3>
              </div>
              {summary.topPages.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No page data found in the uploaded CSV files.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Page URL / Path</th>
                        <th className="px-6 py-3 text-right">Clicks</th>
                        <th className="px-6 py-3 text-right">Impressions</th>
                        <th className="px-6 py-3 text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {summary.topPages.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-6 py-3.5 font-mono text-xs text-slate-900">
                            {p.page}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                            {p.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {p.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right text-indigo-600 font-medium">
                            {p.ctr.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {/* Tab Content: Tools & Guides */}
          {activeTab === "tools" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Wrench className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  <span>Tool Usage</span>
                </div>
                {summary.topTools.length === 0 ? (
                  <p className="mt-4 text-xs text-slate-500">
                    No specific tool paths identified in the uploaded data.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-slate-100">
                    {summary.topTools.map((t, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="font-medium text-slate-800">{t.name}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {t.viewsOrClicks.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FileText className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  <span>Learning Center Tutorials</span>
                </div>
                {summary.topTutorials.length === 0 ? (
                  <p className="mt-4 text-xs text-slate-500">
                    No tutorial paths identified in the uploaded data.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-slate-100">
                    {summary.topTutorials.map((t, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="font-medium text-slate-800 truncate max-w-xs">{t.title}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {t.viewsOrClicks.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}

          {/* Tab Content: Countries */}
          {activeTab === "countries" ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Geographic Traffic Distribution
                </h3>
              </div>
              {summary.topCountries.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No country records found in the uploaded CSV files.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Country / Region</th>
                        <th className="px-6 py-3 text-right">Clicks / Users</th>
                        <th className="px-6 py-3 text-right">Impressions</th>
                        <th className="px-6 py-3 text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {summary.topCountries.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-6 py-3.5 font-medium text-slate-900">
                            {c.country}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                            {c.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {c.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right text-indigo-600 font-medium">
                            {c.ctr.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center sm:p-12">
          <div className="mx-auto max-w-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No Analytics Data Loaded
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              OneToolHub enforces zero-fabrication metrics. To inspect performance, export your Search Console
              or Google Analytics 4 performance table as a CSV and drop it above.
            </p>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-left text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">How to export:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <strong>Google Search Console</strong> &rarr; Performance &rarr; Export &rarr; <strong>Download CSV</strong>.</li>
                <li>Go to <strong>Google Analytics 4</strong> &rarr; Reports &rarr; Pages &amp; Screens &rarr; Share &rarr; <strong>Download CSV</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
