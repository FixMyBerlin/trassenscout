import { homedir } from "node:os"
import { fileURLToPath, URL } from "node:url"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import browserslistToEsbuild from "browserslist-to-esbuild"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import { forwardApiRequestsPastViteAssetMiddleware } from "./vite/forwardApiRequestsPastViteAssetMiddleware"

const appRoot = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  environments: {
    client: {
      build: {
        target: browserslistToEsbuild(),
        sourcemap: true,
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4000,
    // Bun globalStore (bunfig.toml) symlinks realpath outside the project (~/.bun/install/cache/links/).
    // Extend (not replace) Vite's default fs.allow — setting allow alone drops the project root.
    // @see https://bun.com/docs/pm/global-store
    // @see https://vite.dev/config/server-options.html#server-fs-allow
    fs: {
      allow: [appRoot, `${homedir()}/.bun/install/cache/links`],
    },
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
