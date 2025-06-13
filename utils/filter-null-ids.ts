/**
 * Utility function to filter out null/undefined values from arrays
 * before using them in Supabase .in() queries to prevent database errors
 */
export function filterNullIds<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item != null)
}

/**
 * Creates a Set from an array while filtering out null/undefined values
 */
export function createFilteredSet<T>(arr: (T | null | undefined)[]): Set<T> {
  return new Set(filterNullIds(arr))
}

/**
 * Safely converts a Set to Array for use in Supabase .in() queries
 * Returns empty array if Set is empty to avoid database errors
 */
export function setToArray<T>(set: Set<T>): T[] {
  return Array.from(set)
}

/**
 * Checks if a Set has valid values before making a database query
 */
export function hasValidIds<T>(set: Set<T>): boolean {
  return set.size > 0
} 
