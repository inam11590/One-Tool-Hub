/**
 * Multi-Mode Percentage Calculator Core
 *
 * Supported Calculation Modes:
 * 1. "what-is-x-percent-of-y": What is X% of Y?  => (X / 100) * Y
 * 2. "x-is-what-percent-of-y": X is what % of Y? => (X / Y) * 100
 * 3. "percentage-change": % increase/decrease from X to Y => ((Y - X) / |X|) * 100
 * 4. "add-x-percent-to-y": Add X% to Y => Y + (Y * (X / 100))
 * 5. "subtract-x-percent-from-y": Subtract X% from Y => Y - (Y * (X / 100))
 */

export type PercentageCalcMode =
  | "what-is-x-percent-of-y"
  | "x-is-what-percent-of-y"
  | "percentage-change"
  | "add-x-percent-to-y"
  | "subtract-x-percent-from-y";

export interface PercentageCalcInput {
  mode: PercentageCalcMode;
  valX: number;
  valY: number;
}

export interface PercentageCalcResult {
  valid: boolean;
  value: number;
  formattedResult: string;
  formula: string;
  explanation: string;
  direction?: "increase" | "decrease" | "no-change";
  error?: string;
}

/**
 * Formats a floating point number cleanly without trailing zero noise.
 */
export function formatPercentageNumber(num: number, maxDecimals = 4): string {
  if (!Number.isFinite(num)) return "0";
  // Round to maxDecimals cleanly
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Calculates percentage operations according to the chosen mode.
 */
export function calculatePercentage(
  input: PercentageCalcInput
): PercentageCalcResult {
  const { mode, valX, valY } = input;

  if (!Number.isFinite(valX) || !Number.isFinite(valY)) {
    return {
      valid: false,
      value: 0,
      formattedResult: "",
      formula: "",
      explanation: "",
      error: "Please enter valid numeric values for both fields.",
    };
  }

  switch (mode) {
    case "what-is-x-percent-of-y": {
      // (valX / 100) * valY
      const res = (valX / 100) * valY;
      const formatted = formatPercentageNumber(res);
      return {
        valid: true,
        value: res,
        formattedResult: formatted,
        formula: `${valX}% × ${valY} = (${valX} / 100) × ${valY}`,
        explanation: `${valX}% of ${valY} equals ${formatted}.`,
      };
    }

    case "x-is-what-percent-of-y": {
      // (valX / valY) * 100
      if (valY === 0) {
        return {
          valid: false,
          value: 0,
          formattedResult: "Undefined",
          formula: `(${valX} / 0) × 100`,
          explanation: "Division by zero is undefined. Denominator cannot be zero.",
          error: "Cannot calculate percentage with a denominator of 0.",
        };
      }
      const res = (valX / valY) * 100;
      const formatted = `${formatPercentageNumber(res)}%`;
      return {
        valid: true,
        value: res,
        formattedResult: formatted,
        formula: `(${valX} / ${valY}) × 100`,
        explanation: `${valX} is ${formatted} of ${valY}.`,
      };
    }

    case "percentage-change": {
      // ((valY - valX) / |valX|) * 100
      if (valX === 0) {
        return {
          valid: false,
          value: 0,
          formattedResult: "Undefined",
          formula: `((${valY} - 0) / 0) × 100`,
          explanation: "Initial value is zero; percentage change from 0 is mathematically undefined.",
          error: "Initial value (X) cannot be zero when calculating percentage change.",
        };
      }
      const diff = valY - valX;
      const res = (diff / Math.abs(valX)) * 100;
      const direction: PercentageCalcResult["direction"] =
        res > 0 ? "increase" : res < 0 ? "decrease" : "no-change";
      const formatted = `${formatPercentageNumber(Math.abs(res))}%`;

      const expl =
        direction === "increase"
          ? `An increase of ${formatted} from ${valX} to ${valY}.`
          : direction === "decrease"
          ? `A decrease of ${formatted} from ${valX} to ${valY}.`
          : `No change (0%) between ${valX} and ${valY}.`;

      return {
        valid: true,
        value: res,
        formattedResult: direction === "decrease" ? `-${formatted}` : `+${formatted}`,
        formula: `((${valY} - ${valX}) / |${valX}|) × 100`,
        explanation: expl,
        direction,
      };
    }

    case "add-x-percent-to-y": {
      // valY + (valY * (valX / 100))
      const change = valY * (valX / 100);
      const res = valY + change;
      const formatted = formatPercentageNumber(res);
      return {
        valid: true,
        value: res,
        formattedResult: formatted,
        formula: `${valY} + (${valY} × ${valX}%) = ${valY} + ${formatPercentageNumber(change)}`,
        explanation: `Adding ${valX}% to ${valY} yields ${formatted}.`,
      };
    }

    case "subtract-x-percent-from-y": {
      // valY - (valY * (valX / 100))
      const discount = valY * (valX / 100);
      const res = valY - discount;
      const formatted = formatPercentageNumber(res);
      return {
        valid: true,
        value: res,
        formattedResult: formatted,
        formula: `${valY} - (${valY} × ${valX}%) = ${valY} - ${formatPercentageNumber(discount)}`,
        explanation: `Subtracting ${valX}% from ${valY} yields ${formatted}.`,
      };
    }
  }
}
