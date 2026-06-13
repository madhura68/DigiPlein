import { configDefaults, defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    exclude: [...configDefaults.exclude, '**/.claude/**', 'vendor/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, 'tests/stubs/server-only.ts'),
      // De gevendorde kit is TS-source met .js-suffixen (geen vite-extensionAlias) en
      // heeft z'n eigen tests; stub 'm zodat AppShell e.d. laadbaar zijn in jsdom.
      '@s4m-kit/index': path.resolve(__dirname, 'tests/stubs/s4m-kit.tsx'),
    },
  },
})
