"use client";

import { useId, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calculator,
  CheckCircle2,
  GraduationCap,
  Info,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  calculateGpa,
  createMultiSemesterSample,
  createSampleSemesters,
  getDefaultGradeMappings,
  MAX_COURSE_CREDITS,
  WORKED_GPA_EXAMPLE,
  type GpaScalePreset,
  type GpaSemesterInput,
  type GradeMappingEntry,
} from "@/lib/tools/gpa-calculator";
import { trackToolEvent } from "@/lib/analytics";

const TOOL_SLUG = "gpa-calculator";
const TOOL_CATEGORY = "student";

export function GpaCalculatorTool() {
  const baseId = useId();
  const [scalePreset, setScalePreset] = useState<GpaScalePreset>("4.0");
  const [gradeMappings, setGradeMappings] = useState<GradeMappingEntry[]>(() =>
    getDefaultGradeMappings("4.0")
  );
  const [semesters, setSemesters] = useState<GpaSemesterInput[]>(() =>
    createSampleSemesters()
  );
  const [nextIdCounter, setNextIdCounter] = useState(20);

  const result = useMemo(
    () => calculateGpa(semesters, gradeMappings, scalePreset),
    [semesters, gradeMappings, scalePreset]
  );

  const handleScaleChange = (newScale: GpaScalePreset) => {
    setScalePreset(newScale);
    setGradeMappings(getDefaultGradeMappings(newScale));
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: `scale_${newScale}`,
    });
  };

  const handleMappingPointChange = (index: number, rawValue: string) => {
    const parsed = Number(rawValue);
    setGradeMappings((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              points: Number.isFinite(parsed) ? parsed : -1,
            }
          : item
      )
    );
  };

  const handleResetMappingsToDefault = () => {
    setGradeMappings(getDefaultGradeMappings(scalePreset));
  };

  const handleAddSemester = () => {
    const semId = `sem-${nextIdCounter}`;
    const courseId = `course-${nextIdCounter + 1}`;
    setNextIdCounter((c) => c + 2);
    setSemesters((prev) => [
      ...prev,
      {
        id: semId,
        name: `Semester ${prev.length + 1}`,
        courses: [
          {
            id: courseId,
            name: "",
            credits: "3",
            grade: gradeMappings[0]?.grade ?? "A",
          },
        ],
      },
    ]);
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "add_semester",
    });
  };

  const handleRemoveSemester = (semesterId: string) => {
    setSemesters((prev) =>
      prev.length > 1 ? prev.filter((s) => s.id !== semesterId) : prev
    );
  };

  const handleSemesterNameChange = (semesterId: string, name: string) => {
    setSemesters((prev) =>
      prev.map((sem) => (sem.id === semesterId ? { ...sem, name } : sem))
    );
  };

  const handleAddCourse = (semesterId: string) => {
    const courseId = `course-${nextIdCounter}`;
    setNextIdCounter((c) => c + 1);
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? {
              ...sem,
              courses: [
                ...sem.courses,
                {
                  id: courseId,
                  name: "",
                  credits: "3",
                  grade: gradeMappings[0]?.grade ?? "A",
                },
              ],
            }
          : sem
      )
    );
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;
        if (sem.courses.length <= 1) return sem;
        return {
          ...sem,
          courses: sem.courses.filter((c) => c.id !== courseId),
        };
      })
    );
  };

  const handleCourseFieldChange = (
    semesterId: string,
    courseId: string,
    field: "name" | "credits" | "grade",
    value: string
  ) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? {
              ...sem,
              courses: sem.courses.map((course) =>
                course.id === courseId ? { ...course, [field]: value } : course
              ),
            }
          : sem
      )
    );
  };

  const hasCustomCourses = semesters.some((s) =>
    s.courses.some((c) => c.name.trim() !== "")
  );

  const handleResetAll = () => {
    if (
      hasCustomCourses &&
      typeof window !== "undefined" &&
      !window.confirm("Reset all semesters and courses? This action cannot be undone.")
    ) {
      return;
    }
    setScalePreset("4.0");
    setGradeMappings(getDefaultGradeMappings("4.0"));
    setSemesters([
      {
        id: "sem-reset-1",
        name: "Semester 1",
        courses: [
          {
            id: "course-reset-1",
            name: "",
            credits: "3",
            grade: "A",
          },
        ],
      },
    ]);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset_all",
    });
  };

  const handleLoadSampleSingle = () => {
    if (
      hasCustomCourses &&
      typeof window !== "undefined" &&
      !window.confirm("Replace current courses with sample semester data?")
    ) {
      return;
    }
    setSemesters(createSampleSemesters());
  };

  const handleLoadSampleMulti = () => {
    if (
      hasCustomCourses &&
      typeof window !== "undefined" &&
      !window.confirm("Replace current courses with multi-semester sample data?")
    ) {
      return;
    }
    setSemesters(createMultiSemesterSample());
  };

  return (
    <div className="space-y-8">
      {/* Top Action & Scale Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Grading Scale:
          </span>
          <div
            role="group"
            aria-label="Select GPA Grading Scale"
            className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1"
          >
            {(["4.0", "5.0"] as const).map((scale) => {
              const active = scalePreset === scale;
              return (
                <button
                  key={scale}
                  type="button"
                  onClick={() => handleScaleChange(scale)}
                  aria-pressed={active}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    active
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {scale} Scale (Unweighted / Weighted)
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSampleSingle}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
            <span>1-Semester Sample</span>
          </button>
          <button
            type="button"
            onClick={handleLoadSampleMulti}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
            <span>2-Semester Sample</span>
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Live GPA Summary Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Cumulative GPA ({scalePreset} Scale)
            </span>
            <GraduationCap className="h-5 w-5 text-indigo-200" aria-hidden="true" />
          </div>
          <p
            aria-live="polite"
            className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            {result.valid ? result.cumulativeGpaFormatted : "—"}
          </p>
          <p className="mt-2 text-xs text-indigo-100">
            {result.valid
              ? `Across ${semesters.length} ${semesters.length === 1 ? "semester" : "semesters"} (${result.evaluatedCourses.length} ${result.evaluatedCourses.length === 1 ? "course" : "courses"})`
              : "Resolve validation issues below to compute GPA"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Credit Hours
            </span>
            <BookOpen className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {result.totalCredits.toFixed(2).replace(/\.00$/, "")}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Sum of credit hours across all valid courses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Grade Points
            </span>
            <Calculator className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {result.totalQualityPoints.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Sum of (Grade Points &times; Credit Hours)
          </p>
        </div>
      </div>

      {/* Validation Alert Banner */}
      {!result.valid && result.errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-950"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">
              Please review the following input errors:
            </p>
            {result.validationIssues.length > 0 ? (
              <ul className="list-inside list-disc space-y-1 text-xs text-rose-800 sm:text-sm">
                {result.validationIssues.map((issue, idx) => (
                  <li key={`${issue.semesterId}-${issue.courseId ?? idx}`}>
                    {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-rose-800 sm:text-sm">
                {result.errorMessage}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Main Grid: Left Semesters & Courses, Right Grade Scale Mapping & Worked Example */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Semesters & Courses Column */}
        <div className="space-y-6 lg:col-span-8">
          {semesters.map((semester, semIndex) => {
            const semSummary = result.semesterSummaries.find(
              (s) => s.semesterId === semester.id
            );

            return (
              <div
                key={semester.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
              >
                {/* Semester Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      S{semIndex + 1}
                    </span>
                    <div className="flex-1">
                      <label
                        htmlFor={`${baseId}-sem-name-${semester.id}`}
                        className="sr-only"
                      >
                        Semester {semIndex + 1} Name
                      </label>
                      <input
                        id={`${baseId}-sem-name-${semester.id}`}
                        type="text"
                        value={semester.name}
                        onChange={(e) =>
                          handleSemesterNameChange(semester.id, e.target.value)
                        }
                        placeholder={`Semester ${semIndex + 1}`}
                        className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      Semester GPA:{" "}
                      <span className="font-extrabold text-indigo-700">
                        {semSummary && semSummary.gpa !== null
                          ? semSummary.gpaFormatted
                          : "—"}
                      </span>{" "}
                      <span className="text-slate-500">
                        ({semSummary?.totalCredits ?? 0} cr)
                      </span>
                    </div>

                    {semesters.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveSemester(semester.id)}
                        aria-label={`Remove ${semester.name || `Semester ${semIndex + 1}`}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/60 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove Semester</span>
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Courses List */}
                <div className="mt-4 space-y-3">
                  {/* Column Headers on Desktop */}
                  <div className="hidden grid-cols-12 gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid">
                    <div className="col-span-5">Course Name</div>
                    <div className="col-span-3">Credit Hours</div>
                    <div className="col-span-3">Letter Grade</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>

                  {semester.courses.map((course, courseIndex) => {
                    const gradePointObj = gradeMappings.find(
                      (m) => m.grade === course.grade
                    );

                    return (
                      <div
                        key={course.id}
                        className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 sm:grid-cols-12 sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                      >
                        {/* Course Name */}
                        <div className="sm:col-span-5">
                          <label
                            htmlFor={`${baseId}-course-name-${course.id}`}
                            className="mb-1 block text-xs font-semibold text-slate-600 sm:sr-only"
                          >
                            Course {courseIndex + 1} Name
                          </label>
                          <input
                            id={`${baseId}-course-name-${course.id}`}
                            type="text"
                            value={course.name}
                            onChange={(e) =>
                              handleCourseFieldChange(
                                semester.id,
                                course.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder={`Course ${courseIndex + 1} (e.g., Calculus I)`}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                          />
                        </div>

                        {/* Credit Hours */}
                        <div className="sm:col-span-3">
                          <label
                            htmlFor={`${baseId}-course-credits-${course.id}`}
                            className="mb-1 block text-xs font-semibold text-slate-600 sm:sr-only"
                          >
                            Course {courseIndex + 1} Credit Hours
                          </label>
                          <input
                            id={`${baseId}-course-credits-${course.id}`}
                            type="number"
                            min="0.5"
                            max={MAX_COURSE_CREDITS}
                            step="0.5"
                            value={course.credits}
                            onChange={(e) =>
                              handleCourseFieldChange(
                                semester.id,
                                course.id,
                                "credits",
                                e.target.value
                              )
                            }
                            placeholder="Credits (e.g., 3)"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                          />
                        </div>

                        {/* Letter Grade */}
                        <div className="sm:col-span-3">
                          <label
                            htmlFor={`${baseId}-course-grade-${course.id}`}
                            className="mb-1 block text-xs font-semibold text-slate-600 sm:sr-only"
                          >
                            Course {courseIndex + 1} Letter Grade
                          </label>
                          <select
                            id={`${baseId}-course-grade-${course.id}`}
                            value={course.grade}
                            onChange={(e) =>
                              handleCourseFieldChange(
                                semester.id,
                                course.id,
                                "grade",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                          >
                            <option value="">Select Grade...</option>
                            {gradeMappings.map((mapping) => (
                              <option key={mapping.grade} value={mapping.grade}>
                                {mapping.grade} (
                                {Number.isFinite(mapping.points) &&
                                mapping.points >= 0
                                  ? mapping.points.toFixed(2)
                                  : "—"}{" "}
                                pts)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Remove Course Button */}
                        <div className="flex items-center justify-between sm:col-span-1 sm:justify-end">
                          <span className="text-xs text-slate-500 sm:hidden">
                            {gradePointObj && Number(course.credits) > 0
                              ? `${(gradePointObj.points * Number(course.credits)).toFixed(2)} grade pts`
                              : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveCourse(semester.id, course.id)
                            }
                            disabled={semester.courses.length <= 1}
                            aria-label={`Remove ${course.name || `Course ${courseIndex + 1}`}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Course Button */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleAddCourse(semester.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 transition-colors hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Add Course</span>
                  </button>

                  {semSummary ? (
                    <span className="text-xs text-slate-500">
                      Semester Total:{" "}
                      <strong className="text-slate-800">
                        {semSummary.totalQualityPoints.toFixed(2)}
                      </strong>{" "}
                      grade pts &divide;{" "}
                      <strong className="text-slate-800">
                        {semSummary.totalCredits}
                      </strong>{" "}
                      credits ={" "}
                      <strong className="text-indigo-700">
                        {semSummary.gpaFormatted}
                      </strong>
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Add Another Semester Button */}
          <button
            type="button"
            onClick={handleAddSemester}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-4 text-sm font-bold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Another Semester for Cumulative GPA</span>
          </button>

          {/* Worked Calculation Example Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Worked Calculation Example (4.0 Scale)</span>
            </div>
            <h3 className="mt-1.5 text-base font-bold text-slate-900">
              How Weighted GPA is Calculated Step-by-Step
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Formula:{" "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-indigo-700 ring-1 ring-slate-200">
                GPA = Sum of (Grade Points &times; Credit Hours) &divide; Total
                Credit Hours
              </code>
            </p>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-3.5 py-2.5">Course</th>
                    <th className="px-3.5 py-2.5">Credits</th>
                    <th className="px-3.5 py-2.5">Letter Grade</th>
                    <th className="px-3.5 py-2.5">Points / Credit</th>
                    <th className="px-3.5 py-2.5 text-right">Grade Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {WORKED_GPA_EXAMPLE.courses.map((item) => (
                    <tr key={item.name}>
                      <td className="px-3.5 py-2 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-3.5 py-2">{item.credits}</td>
                      <td className="px-3.5 py-2">{item.grade}</td>
                      <td className="px-3.5 py-2">
                        {item.gradePoints.toFixed(1)}
                      </td>
                      <td className="px-3.5 py-2 text-right font-semibold text-slate-900">
                        {item.credits} &times; {item.gradePoints.toFixed(1)} ={" "}
                        {item.qualityPoints.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-indigo-50/60 font-bold text-slate-900">
                  <tr>
                    <td className="px-3.5 py-2.5">Total</td>
                    <td className="px-3.5 py-2.5">
                      {WORKED_GPA_EXAMPLE.totalCredits} cr
                    </td>
                    <td colSpan={2} className="px-3.5 py-2.5 text-xs text-slate-600">
                      {WORKED_GPA_EXAMPLE.formulaText}
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-indigo-700">
                      GPA: {WORKED_GPA_EXAMPLE.finalGpa}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Grade-to-Point Mapping Table & Institutional Note */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Settings2
                  className="h-4 w-4 text-indigo-600"
                  aria-hidden="true"
                />
                <h2 className="text-base font-bold text-slate-900">
                  Grade-to-Point Mapping ({scalePreset})
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetMappingsToDefault}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Reset Scale
              </button>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Universities worldwide use different grade point values. Customize
              any letter grade point value below to match your institution&apos;s
              official syllabus.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2">
              {gradeMappings.map((entry, idx) => (
                <div
                  key={entry.grade}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
                >
                  <label
                    htmlFor={`${baseId}-grade-map-${entry.grade}`}
                    className="text-xs font-extrabold text-slate-900"
                  >
                    {entry.grade}
                  </label>
                  <input
                    id={`${baseId}-grade-map-${entry.grade}`}
                    type="number"
                    min="0"
                    max={scalePreset === "5.0" ? "5" : "4"}
                    step="0.1"
                    value={entry.points >= 0 ? entry.points : ""}
                    onChange={(e) =>
                      handleMappingPointChange(idx, e.target.value)
                    }
                    className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                  />
                </div>
              ))}
            </div>

            {/* Institutional Grading Disclaimer */}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-950">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <strong className="font-bold">Important Academic Note:</strong>{" "}
                No single grade mapping is universal. Official university
                transcripts may differ based on institutional rounding rules,
                pass/fail policies, or repeated-course forgiveness.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
