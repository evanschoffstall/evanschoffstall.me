type ClassValue = false | null | string | undefined;

/**
 * Joins truthy class-name fragments into a single class string.
 * @param values - The class fragments to join.
 * @returns The joined class string.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
