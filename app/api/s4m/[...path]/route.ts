import { createS4MRoutes, ToolRegistry } from '@s4m-kit/index'

import { copilotRequireSession } from '@/lib/copilot-session'

export const dynamic = 'force-dynamic' // VERPLICHT voor de SSE-stream

// Host-tools: voorlopig LEEG. Mutaties op de app lopen via de Scrum4Me dev-flow
// (idee → job → agent-PR → verify → deploy), niet via host-tools. Cliënt-/vrijwilligers-
// data-tools komen er pas na expliciete per-tool AVG-dataminimalisatie + scoping-review.
// Zie vendor/scrum4me-copilot/kit/README.md §4.
const tools = new ToolRegistry([])

export const { GET, POST, PATCH } = createS4MRoutes({
  requireSession: copilotRequireSession,
  tools,
  serviceUrl: process.env.S4M_COPILOT_URL!, // interne URL van de centrale scrum4me-copilot-service
  appKey: process.env.S4M_COPILOT_APP_KEY!, // == COPILOT_APP_DIGIPLEIN_KEY van de service-binding
})
