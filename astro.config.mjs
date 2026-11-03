import { defineConfig } from "astro/config";

// Static output only. No Cloudflare SSR adapter or runtime server.
export default defineConfig({ output: "static", trailingSlash: "always" });
