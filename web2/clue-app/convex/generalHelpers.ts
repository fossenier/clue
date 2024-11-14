"use server";

/**
 * Generates a random integer between the specified minimum and maximum values, inclusive of the minimum and  the maximum.
 *
 * @param min - The minimum value (inclusive).
 * @param max - The maximum value (inclusive).
 * @returns A random integer between min (inclusive) and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random number within a specified range.
 *
 * @param start - The start of the range (inclusive).
 * @param stop - The end of the range (exclusive).
 * @param step - The step between each number in the range. Defaults to 1.
 * @returns A random number within the specified range.
 *
 * @throws Will throw an error if the step is zero.
 */
export function randomRange(
  start: number,
  stop: number,
  step: number = 1
): number {
  if (step === 0) {
    throw new Error("Step cannot be zero");
  }
  const rangeLength = Math.floor((stop - start) / step);
  const randomIndex = randomInt(0, rangeLength);
  return start + randomIndex * step;
}
