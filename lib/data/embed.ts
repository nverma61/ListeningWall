/** PostgREST may return a nested row as object or single-element array depending on shape. */
export function embedOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}
