'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
  RotateCcw,
  Info,
} from 'lucide-react';
import { getWorkflows } from '@/lib/workflows';
import { getToolBySlug } from '@/lib/tools';
import { trackRetentionEvent } from '@/lib/analytics';
import { ToolIcon } from '@/components/ui/ToolIcon';

interface WorkflowsClientProps {
  lang?: 'en' | 'ur';
}

export function WorkflowsClient({ lang = 'en' }: WorkflowsClientProps) {
  const isUrdu = lang === 'ur';
  const workflows = getWorkflows();
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load recipe progress from localStorage
    try {
      const saved: Record<string, number[]> = {};
      const allWfs = getWorkflows();
      for (const wf of allWfs) {
        const raw = window.localStorage.getItem(`onetoolhub_wf_${wf.slug}`);
        if (raw) {
          saved[wf.slug] = JSON.parse(raw);
        }
      }
      setCompletedSteps(saved);
    } catch {
      // Non-blocking
    }
  }, []);

  const toggleStep = (workflowSlug: string, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const current = prev[workflowSlug] ?? [];
      const updated = current.includes(stepNumber)
        ? current.filter((s) => s !== stepNumber)
        : [...current, stepNumber];
      
      const next = { ...prev, [workflowSlug]: updated };
      try {
        window.localStorage.setItem(`onetoolhub_wf_${workflowSlug}`, JSON.stringify(updated));
      } catch {
        // Non-blocking
      }
      return next;
    });

    trackRetentionEvent('workflow_view', {
      event_category: 'workflow',
      item_slug: workflowSlug,
      count: stepNumber,
    });
  };

  const resetWorkflow = (workflowSlug: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [workflowSlug]: [] };
      try {
        window.localStorage.removeItem(`onetoolhub_wf_${workflowSlug}`);
      } catch {
        // Non-blocking
      }
      return next;
    });
  };

  return (
    <div className="space-y-12" dir={isUrdu ? 'rtl' : 'ltr'}>
      {workflows.map((wf) => {
        const doneList = completedSteps[wf.slug] ?? [];
        const isComplete = doneList.length === wf.steps.length;
        const progressPct = Math.round((doneList.length / wf.steps.length) * 100);
        const title = isUrdu ? wf.titleUr : wf.title;
        const description = isUrdu ? wf.descriptionUr : wf.description;
        const badge = isUrdu ? wf.badgeUr : wf.badge;
        const audience = isUrdu ? wf.targetAudienceUr : wf.targetAudience;

        return (
          <div
            key={wf.slug}
            id={wf.slug}
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
                    <span>{wf.estimatedMinutes} {isUrdu ? 'منٹ' : 'mins total'}</span>
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-500">{audience}</span>
                  {isMounted && isComplete && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isUrdu ? 'مکمل ہو گیا!' : 'All steps completed!'}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Progress & Reset */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-700">
                    {isMounted ? `${doneList.length}/${wf.steps.length} ${isUrdu ? 'اقدامات' : 'steps'}` : ''}
                  </div>
                  <div className="w-24 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${isMounted ? progressPct : 0}%` }}
                    />
                  </div>
                </div>

                {isMounted && doneList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => resetWorkflow(wf.slug)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title={isUrdu ? 'پیش رفت دوبارہ شروع کریں' : 'Reset recipe progress'}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Step-by-step pipeline */}
            <div className="mt-6 space-y-4">
              {wf.steps.map((step) => {
                const tool = getToolBySlug(step.toolSlug);
                const isStepDone = isMounted && doneList.includes(step.stepNumber);
                const stepTitle = isUrdu ? step.titleUr : step.title;
                const stepDesc = isUrdu ? step.descriptionUr : step.description;
                const stepTip = isUrdu ? step.tipUr : step.tip;
                const toolHref = isUrdu
                  ? `/ur/tools/${step.toolSlug}`
                  : `/tools/${step.toolSlug}`;

                return (
                  <div
                    key={step.stepNumber}
                    className={`rounded-xl border p-4 sm:p-5 transition-all ${
                      isStepDone
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Checkbox & Details */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleStep(wf.slug, step.stepNumber)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 shrink-0 transition-colors"
                          aria-label={`Mark step ${step.stepNumber} as ${isStepDone ? 'incomplete' : 'complete'}`}
                        >
                          {isStepDone ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                              {isUrdu ? `مرحلہ ${step.stepNumber}` : `Step ${step.stepNumber}`}
                            </span>
                          </div>

                          <h3 className={`text-sm sm:text-base font-bold mt-0.5 ${
                            isStepDone ? 'text-slate-500 line-through' : 'text-slate-900'
                          }`}>
                            {stepTitle}
                          </h3>

                          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {stepDesc}
                          </p>

                          {/* Tip */}
                          {stepTip && (
                            <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-indigo-50/50 border border-indigo-100/70 p-2 text-xs text-indigo-900">
                              <Info className="h-3.5 w-3.5 shrink-0 text-indigo-600 mt-0.5" />
                              <span className="leading-relaxed">
                                <strong className="font-semibold">{isUrdu ? 'رہنمائی: ' : 'Pro Tip: '}</strong>
                                {stepTip}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tool Action Button */}
                      {tool && (
                        <div className="sm:self-center shrink-0">
                          <Link
                            href={toolHref}
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs transition-all"
                          >
                            <ToolIcon name={tool.icon} className="h-4 w-4" />
                            <span>{tool.name}</span>
                            <ArrowRight className={`h-3.5 w-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
