export type GpaScalePreset = "4.0" | "5.0";

export interface GradeMappingEntry {
  grade: string;
  points: number;
}

export interface GpaCourseInput {
  id: string;
  name: string;
  credits: string;
  grade: string;
}

export interface GpaSemesterInput {
  id: string;
  name: string;
  courses: GpaCourseInput[];
}

export interface GpaCourseEvaluation {
  courseId: string;
  semesterId: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePointsPerCredit: number;
  qualityPoints: number;
}

export interface GpaValidationIssue {
  semesterId: string;
  semesterName: string;
  courseId?: string;
  courseName?: string;
  message: string;
}

export interface GpaSemesterSummary {
  semesterId: string;
  semesterName: string;
  validCoursesCount: number;
  totalCredits: number;
  totalQualityPoints: number;
  gpa: number | null;
  gpaFormatted: string;
}

export interface GpaCalculationResult {
  valid: boolean;
  scalePreset: GpaScalePreset;
  maxScalePoints: number;
  totalCredits: number;
  totalQualityPoints: number;
  cumulativeGpa: number | null;
  cumulativeGpaFormatted: string;
  semesterSummaries: GpaSemesterSummary[];
  evaluatedCourses: GpaCourseEvaluation[];
  validationIssues: GpaValidationIssue[];
  errorMessage?: string;
}

export const MAX_COURSE_CREDITS = 30;

export const DEFAULT_GRADE_MAPPING_4_0: readonly GradeMappingEntry[] = [
  { grade: "A+", points: 4.0 },
  { grade: "A", points: 4.0 },
  { grade: "A-", points: 3.7 },
  { grade: "B+", points: 3.3 },
  { grade: "B", points: 3.0 },
  { grade: "B-", points: 2.7 },
  { grade: "C+", points: 2.3 },
  { grade: "C", points: 2.0 },
  { grade: "C-", points: 1.7 },
  { grade: "D+", points: 1.3 },
  { grade: "D", points: 1.0 },
  { grade: "D-", points: 0.7 },
  { grade: "F", points: 0.0 },
] as const;

export const DEFAULT_GRADE_MAPPING_5_0: readonly GradeMappingEntry[] = [
  { grade: "A+", points: 5.0 },
  { grade: "A", points: 5.0 },
  { grade: "A-", points: 4.7 },
  { grade: "B+", points: 4.3 },
  { grade: "B", points: 4.0 },
  { grade: "B-", points: 3.7 },
  { grade: "C+", points: 3.3 },
  { grade: "C", points: 3.0 },
  { grade: "C-", points: 2.7 },
  { grade: "D+", points: 2.3 },
  { grade: "D", points: 2.0 },
  { grade: "D-", points: 1.7 },
  { grade: "F", points: 0.0 },
] as const;

export function getDefaultGradeMappings(
  scale: GpaScalePreset
): GradeMappingEntry[] {
  const source =
    scale === "5.0" ? DEFAULT_GRADE_MAPPING_5_0 : DEFAULT_GRADE_MAPPING_4_0;
  return source.map((entry) => ({ ...entry }));
}

export function createSampleSemesters(): GpaSemesterInput[] {
  return [
    {
      id: "sem-1",
      name: "Semester 1 (Fall)",
      courses: [
        {
          id: "course-1",
          name: "Introduction to Computer Science",
          credits: "4",
          grade: "A",
        },
        {
          id: "course-2",
          name: "Calculus I",
          credits: "4",
          grade: "B+",
        },
        {
          id: "course-3",
          name: "Academic Writing & Rhetoric",
          credits: "3",
          grade: "A-",
        },
        {
          id: "course-4",
          name: "Microeconomics",
          credits: "3",
          grade: "B",
        },
      ],
    },
  ];
}

export function createMultiSemesterSample(): GpaSemesterInput[] {
  return [
    {
      id: "sem-1",
      name: "Semester 1 (Fall)",
      courses: [
        {
          id: "course-1",
          name: "Introduction to Computer Science",
          credits: "4",
          grade: "A",
        },
        {
          id: "course-2",
          name: "Calculus I",
          credits: "4",
          grade: "B+",
        },
        {
          id: "course-3",
          name: "Academic Writing",
          credits: "3",
          grade: "A-",
        },
      ],
    },
    {
      id: "sem-2",
      name: "Semester 2 (Spring)",
      courses: [
        {
          id: "course-4",
          name: "Data Structures & Algorithms",
          credits: "4",
          grade: "A",
        },
        {
          id: "course-5",
          name: "Linear Algebra",
          credits: "3",
          grade: "B+",
        },
        {
          id: "course-6",
          name: "Discrete Mathematics",
          credits: "3",
          grade: "A-",
        },
      ],
    },
  ];
}

export const WORKED_GPA_EXAMPLE = {
  scale: "4.0" as GpaScalePreset,
  courses: [
    {
      name: "Computer Science I",
      credits: 4,
      grade: "A",
      gradePoints: 4.0,
      qualityPoints: 16.0,
    },
    {
      name: "Calculus I",
      credits: 4,
      grade: "B+",
      gradePoints: 3.3,
      qualityPoints: 13.2,
    },
    {
      name: "Academic Writing",
      credits: 3,
      grade: "A-",
      gradePoints: 3.7,
      qualityPoints: 11.1,
    },
  ],
  totalCredits: 11,
  totalQualityPoints: 40.3,
  formulaText: "(16.00 + 13.20 + 11.10) ÷ 11 = 40.30 ÷ 11 = 3.66",
  finalGpa: "3.66",
} as const;

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function validateGradeMappings(
  mappings: readonly GradeMappingEntry[],
  scalePreset: GpaScalePreset
): { valid: boolean; error?: string; map: Map<string, number> } {
  const maxAllowed = scalePreset === "5.0" ? 5.0 : 4.0;
  const map = new Map<string, number>();

  if (!mappings || mappings.length === 0) {
    return {
      valid: false,
      error: "At least one letter grade mapping is required.",
      map,
    };
  }

  for (const entry of mappings) {
    const cleanGrade = entry.grade.trim();
    if (!cleanGrade) {
      return {
        valid: false,
        error: "Grade labels in the grade-to-point table cannot be empty.",
        map,
      };
    }

    if (
      typeof entry.points !== "number" ||
      !Number.isFinite(entry.points) ||
      entry.points < 0 ||
      entry.points > maxAllowed
    ) {
      return {
        valid: false,
        error: `Grade "${cleanGrade}" has an invalid point value. Points must be between 0.00 and ${maxAllowed.toFixed(1)} for the ${scalePreset} scale.`,
        map,
      };
    }

    map.set(cleanGrade, roundToTwoDecimals(entry.points));
  }

  return { valid: true, map };
}

export function calculateGpa(
  semesters: readonly GpaSemesterInput[],
  mappings: readonly GradeMappingEntry[],
  scalePreset: GpaScalePreset = "4.0"
): GpaCalculationResult {
  const maxScalePoints = scalePreset === "5.0" ? 5.0 : 4.0;
  const mappingCheck = validateGradeMappings(mappings, scalePreset);

  if (!mappingCheck.valid) {
    return {
      valid: false,
      scalePreset,
      maxScalePoints,
      totalCredits: 0,
      totalQualityPoints: 0,
      cumulativeGpa: null,
      cumulativeGpaFormatted: "0.00",
      semesterSummaries: [],
      evaluatedCourses: [],
      validationIssues: [],
      errorMessage: mappingCheck.error,
    };
  }

  const gradeMap = mappingCheck.map;
  const validationIssues: GpaValidationIssue[] = [];
  const evaluatedCourses: GpaCourseEvaluation[] = [];
  const semesterSummaries: GpaSemesterSummary[] = [];

  let grandTotalCredits = 0;
  let grandTotalQualityPoints = 0;

  if (!semesters || semesters.length === 0) {
    return {
      valid: false,
      scalePreset,
      maxScalePoints,
      totalCredits: 0,
      totalQualityPoints: 0,
      cumulativeGpa: null,
      cumulativeGpaFormatted: "0.00",
      semesterSummaries: [],
      evaluatedCourses: [],
      validationIssues: [],
      errorMessage: "Please add at least one semester and course to calculate GPA.",
    };
  }

  semesters.forEach((semester, semIndex) => {
    const semesterLabel =
      semester.name.trim() || `Semester ${semIndex + 1}`;
    let semCredits = 0;
    let semQualityPoints = 0;
    let semValidCourses = 0;

    if (!semester.courses || semester.courses.length === 0) {
      validationIssues.push({
        semesterId: semester.id,
        semesterName: semesterLabel,
        message: `${semesterLabel} has no courses. Add at least one course or remove the empty semester.`,
      });
    }

    semester.courses.forEach((course, courseIndex) => {
      const courseLabel =
        course.name.trim() || `Course ${courseIndex + 1}`;
      const rawCredits = course.credits.trim();
      const rawGrade = course.grade.trim();

      if (!rawCredits) {
        validationIssues.push({
          semesterId: semester.id,
          semesterName: semesterLabel,
          courseId: course.id,
          courseName: courseLabel,
          message: `${semesterLabel} — "${courseLabel}": Credit hours are required.`,
        });
        return;
      }

      const parsedCredits = Number(rawCredits);
      if (
        !Number.isFinite(parsedCredits) ||
        parsedCredits <= 0 ||
        parsedCredits > MAX_COURSE_CREDITS
      ) {
        validationIssues.push({
          semesterId: semester.id,
          semesterName: semesterLabel,
          courseId: course.id,
          courseName: courseLabel,
          message: `${semesterLabel} — "${courseLabel}": Credit hours must be a positive number between 0.5 and ${MAX_COURSE_CREDITS}.`,
        });
        return;
      }

      if (!rawGrade) {
        validationIssues.push({
          semesterId: semester.id,
          semesterName: semesterLabel,
          courseId: course.id,
          courseName: courseLabel,
          message: `${semesterLabel} — "${courseLabel}": Please select a letter grade.`,
        });
        return;
      }

      const gradePoints = gradeMap.get(rawGrade);
      if (gradePoints === undefined) {
        validationIssues.push({
          semesterId: semester.id,
          semesterName: semesterLabel,
          courseId: course.id,
          courseName: courseLabel,
          message: `${semesterLabel} — "${courseLabel}": Grade "${rawGrade}" is not defined in the current grade scale mapping.`,
        });
        return;
      }

      const qualityPoints = roundToTwoDecimals(parsedCredits * gradePoints);
      semCredits = roundToTwoDecimals(semCredits + parsedCredits);
      semQualityPoints = roundToTwoDecimals(semQualityPoints + qualityPoints);
      semValidCourses += 1;

      grandTotalCredits = roundToTwoDecimals(grandTotalCredits + parsedCredits);
      grandTotalQualityPoints = roundToTwoDecimals(
        grandTotalQualityPoints + qualityPoints
      );

      evaluatedCourses.push({
        courseId: course.id,
        semesterId: semester.id,
        courseName: courseLabel,
        credits: parsedCredits,
        grade: rawGrade,
        gradePointsPerCredit: gradePoints,
        qualityPoints,
      });
    });

    const semGpa =
      semCredits > 0
        ? roundToTwoDecimals(semQualityPoints / semCredits)
        : null;

    semesterSummaries.push({
      semesterId: semester.id,
      semesterName: semesterLabel,
      validCoursesCount: semValidCourses,
      totalCredits: semCredits,
      totalQualityPoints: semQualityPoints,
      gpa: semGpa,
      gpaFormatted: semGpa !== null ? semGpa.toFixed(2) : "0.00",
    });
  });

  if (validationIssues.length > 0) {
    return {
      valid: false,
      scalePreset,
      maxScalePoints,
      totalCredits: grandTotalCredits,
      totalQualityPoints: grandTotalQualityPoints,
      cumulativeGpa:
        grandTotalCredits > 0
          ? roundToTwoDecimals(grandTotalQualityPoints / grandTotalCredits)
          : null,
      cumulativeGpaFormatted:
        grandTotalCredits > 0
          ? roundToTwoDecimals(
              grandTotalQualityPoints / grandTotalCredits
            ).toFixed(2)
          : "0.00",
      semesterSummaries,
      evaluatedCourses,
      validationIssues,
      errorMessage: validationIssues[0]?.message,
    };
  }

  if (grandTotalCredits <= 0) {
    return {
      valid: false,
      scalePreset,
      maxScalePoints,
      totalCredits: 0,
      totalQualityPoints: 0,
      cumulativeGpa: null,
      cumulativeGpaFormatted: "0.00",
      semesterSummaries,
      evaluatedCourses,
      validationIssues,
      errorMessage:
        "Total credit hours cannot be zero. Please enter valid positive credit hours for at least one course.",
    };
  }

  const cumulativeGpa = roundToTwoDecimals(
    grandTotalQualityPoints / grandTotalCredits
  );

  return {
    valid: true,
    scalePreset,
    maxScalePoints,
    totalCredits: grandTotalCredits,
    totalQualityPoints: grandTotalQualityPoints,
    cumulativeGpa,
    cumulativeGpaFormatted: cumulativeGpa.toFixed(2),
    semesterSummaries,
    evaluatedCourses,
    validationIssues: [],
  };
}
