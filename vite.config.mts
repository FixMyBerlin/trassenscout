import { fileURLToPath, URL } from "node:url"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import { forwardApiRequestsPastViteAssetMiddleware } from "./vite/forwardApiRequestsPastViteAssetMiddleware"

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4000,
    hmr: {
      protocol: "ws",
      host: "127.0.0.1",
      port: 4000,
      clientPort: 4000,
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL(".", import.meta.url)),
      },
    ],
  },
  plugins: [
    devtools({
      // react-map-gl spreads all props into map.addSource/addLayer — devtools source attrs break Maplibre validation.
      injectSource: {
        enabled: true,
        ignore: {
          components: ["Source", "Layer"],
        },
      },
    }),
    forwardApiRequestsPastViteAssetMiddleware(),
    nitro({
      preset: "bun",
      plugins: [
        "src/server/instrumentation/nitro-env-validation.plugin.server.ts",
        "src/server/instrumentation/nitro-otel-langfuse.plugin.server.ts",
      ],
      sourcemap: true,
    }),
    tailwindcss(),
    tanstackStart({}),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
})
