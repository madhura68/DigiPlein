import { getSession } from '@/lib/auth'
import { isPairedSessionExpired } from '@/lib/auth/pairing'

// Session-adapter voor de scrum4me-copilot-kit (vendor/scrum4me-copilot/kit/README.md §4b).
// De kit stuurt `String(user.id)` als X-S4M-App-User; lever dus een object MÉT een stabiele,
// PII-arme `.id` (= staffId). De paired-session-expiry wordt hier afgedwongen omdat proxy.ts
// /api/*-routes hun eigen auth laat doen (geen login-redirect) → een verlopen paired-sessie
// mag geen copilot-verzoeken meer doen. null → de kit geeft 401.
export async function copilotRequireSession() {
  const s = await getSession()
  if (!s.staffId || isPairedSessionExpired(s)) return null
  return { id: s.staffId, name: s.name, role: s.role }
}
