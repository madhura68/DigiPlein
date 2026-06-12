// Pure helpers (los van de server-actions, zodat ze direct testbaar zijn).

export function formatLesdagen(course: {
  onTuesday: boolean
  onThursday: boolean
}): string {
  if (course.onTuesday && course.onThursday) return 'di + do'
  if (course.onTuesday) return 'di'
  if (course.onThursday) return 'do'
  return '—'
}

export function formatMaxSessions(maxSessions: number | null): string {
  return maxSessions === null ? 'Onbeperkt' : `Max. ${maxSessions}`
}
