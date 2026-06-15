// Vitest-alias-stub voor @s4m-kit/index. De echte kit is TS-source met .js-import-
// suffixen (ESM) zonder vite-extensionAlias → niet laadbaar in vitest; en de kit heeft
// z'n eigen test-suite in vendor/scrum4me-copilot. DigiPlein-tests die AppShell e.d.
// renderen hebben alleen een no-op nodig; de echte kit draait in de webpack-build/browser.
export function S4MCopilotDrawer(_props: { basePath: string }): null {
  return null
}

export class ToolRegistry {
  constructor(_tools?: unknown[]) {}
}

export function defineTool<T>(tool: T): T {
  return tool
}

export function createS4MRoutes(_config: unknown) {
  return {
    GET: async () => new Response(null, { status: 204 }),
    POST: async () => new Response(null, { status: 204 }),
    PATCH: async () => new Response(null, { status: 204 }),
  }
}
