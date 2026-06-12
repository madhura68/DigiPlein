import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Slank productie-image: Next bundelt server.js + getracede node_modules in
  // .next/standalone (zie Dockerfile). Vereist voor de Docker-deploy op scrum4me-srv.
  output: "standalone",
}

export default nextConfig
