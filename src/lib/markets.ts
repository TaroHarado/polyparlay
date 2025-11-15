/**
 * Normalize outcomes from various formats to string array
 */
export function normalizeOutcomes(raw: any): string[] {
  if (Array.isArray(raw)) return raw.map(String)

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(String)
      return [String(parsed)]
    } catch {
      return [raw]
    }
  }

  if (!raw) return []

  return [String(raw)]
}

