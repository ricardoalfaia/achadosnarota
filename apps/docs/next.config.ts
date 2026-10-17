import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: fileURLToPath(new URL("../..", import.meta.url)),
  },
};

// Liga o fumadocs-mdx: os arquivos de content/docs viram páginas.
const comMDX = createMDX();

export default comMDX(nextConfig);
