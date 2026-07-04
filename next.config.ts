import type { NextConfig } from "next"
import packageJson from "./package.json"

const buildTime =
  process.env.NEXT_PUBLIC_BUILD_TIME ??
  process.env.BUILD_TIME ??
  new Date().toISOString()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION:
      process.env.NEXT_PUBLIC_APP_VERSION ?? packageJson.version,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  // Slank productie-image: Next bundelt server.js + getracede node_modules in
  // .next/standalone (zie Dockerfile). Vereist voor de Docker-deploy op scrum4me-srv.
  output: "standalone",
  // De gevendorde @s4m-kit/* (+ interne protocol/-imports) zijn TS-source met .js-suffixen
  // (ESM). Turbopack heeft geen extensionAlias → .js->.ts faalt. Daarom webpack-build
  // (scripts gebruiken --webpack) met deze alias. Zie vendor/scrum4me-copilot/kit/README.md §3.
  webpack: (config) => {
    config.resolve ??= {}
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    }
    return config
  },
}

export default nextConfig
