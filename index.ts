type AngleUnit = "deg" | "grad" | "rad" | "turn";

export type AngleString = `${number}${AngleUnit | ""}`;

// https://developer.mozilla.org/en-US/docs/Web/CSS/angle#units
const unitToHalfCircleValue: Record<AngleUnit, number> = {
  deg: 180,
  grad: 200,
  rad: Math.PI,
  turn: 0.5,
};

function parseStringAngle(angle: string): [value: number, unit: AngleUnit] {
  const value = Number.parseFloat(angle);

  if (!Number.isFinite(value)) {
    throw new Error(`Unable to parse angle: ${angle}`);
  }
  const regexResult = /[^A-z](deg|grad|rad|turn)?\s*$/.exec(angle);
  if (!regexResult) {
    throw new Error(`Unable to parse angle: ${angle}`);
  }

  return [value, (regexResult[1] as AngleUnit | undefined) ?? "deg"];
}

function normalizeAngle(
  angle: number | string,
): [angleInRadians: number, angleWithUnit: string] {
  const [value, unit] =
    typeof angle === "string"
      ? parseStringAngle(angle)
      : ([angle, "deg"] as const);

  return [
    clampAngle((value * Math.PI) / unitToHalfCircleValue[unit]),
    `${value}${unit}`,
  ];
}

// Clamp to -180..180 degrees range.
function clampAngle(angleInRadians: number) {
  let res = angleInRadians % Math.PI;
  if (res > Math.PI) {
    res = res - Math.PI - Math.PI;
  }
  if (res < -Math.PI) {
    res = res + Math.PI + Math.PI;
  }
  return res;
}

function calcBgDimensions(
  patternLength: number,
  angleInRadians: number,
): [width: number, height: number] {
  // 1px width is enough as the pattern lines are horizontal
  if (Math.abs(angleInRadians) === 0 || Math.abs(angleInRadians) === Math.PI) {
    return [1, patternLength];
  }
  // Same for the height when lines are vertical
  if (Math.abs(angleInRadians) === Math.PI / 2) {
    return [patternLength, 1];
  }
  return [
    Math.abs(patternLength / Math.sin(angleInRadians)),
    Math.abs(patternLength / Math.cos(angleInRadians)),
  ];
}

// 6 should be enough: Chrome rounds to 6 places automatically and everything looks good.
// Used primarily for improved tests readability.
const cssPrecision = 6;

function round(value: number) {
  return Number(value.toPrecision(cssPrecision));
}

function angleIsMultipleOf45Degrees(value: number, unit: AngleUnit) {
  return round(value) % round(unitToHalfCircleValue[unit] / 4) === 0;
}

/**
 * @param pattern Array of tuples
 * @param angle Pattern rotation angle.
 *              Number or numeric string will be treated as degrees.
 *              String can contain CSS angle unit, e.g. `45deg`, `50grad`, `0.7854rad`, `0.125turn`
 * @param offset Pattern offset, in pixels
 */
export default function stripedBackground(
  pattern: [color: string, length: number][],
  angle: number | AngleString = 45,
  offset = 0,
): Partial<
  Pick<
    CSSStyleDeclaration,
    | "backgroundImage"
    | "backgroundSize"
    | "backgroundPosition"
    | "backgroundColor"
  >
> {
  // Nothing to apply
  if (pattern.length === 0) {
    return {};
  }
  // Solid single color background
  if (pattern.length === 1) {
    return {
      backgroundColor: pattern[0][0],
    };
  }
  const [angleRadians, angleWithUnit] = normalizeAngle(angle);

  // When angle is multiple of 45 degrees (1/8 of full circle), transition smoothing is not necessary.
  const smoothing = angleIsMultipleOf45Degrees(angleNormalized, unit) ? 0 : 0.5;

  const colorStops = [];
  let currentOffset = 0;
  for (let i = 0; i < pattern.length * 2 - 1; i++) {
    currentOffset += pattern[i % pattern.length][1];
    // We need clear edges between colors, so each color starts exactly where previous ends (plus smoothing margin).
    colorStops.push(
      `${pattern[i % pattern.length][0]} ${currentOffset - smoothing}px`,
      `${pattern[(i + 1) % pattern.length][0]} ${currentOffset + smoothing}px`,
    );
  }

  const patternLength = pattern.reduce((acc, [, l]) => acc + l, 0);

  const offsetNorm = offset % patternLength,
    offsetX = offsetNorm * Math.sin(angleRadians),
    offsetY = offsetNorm * Math.cos(angleRadians);

  const [bgWidth, bgHeight] = calcBgDimensions(patternLength, angleRadians);

  return {
    // Normalize angle value, but do not apply rounding and unit conversion to keep original precision.
    backgroundImage: `linear-gradient(
      ${angleWithUnit},
      ${colorStops.join(", ")}
    )`,
    backgroundPosition: `top ${round(-offsetY)}px left ${round(offsetX)}px`,
    backgroundSize: `${round(bgWidth)}px ${round(bgHeight)}px`,
  };
}
