import type { Map as MaplibreMap } from "maplibre-gl"
import type { EnvFullSchema, EnvVite } from "./server/envSchema"

/// <reference types="vite/client" />
/// <reference types="bun-types" />
/// <reference types="web" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  interface ImportMetaEnv extends EnvVite {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface Window {
    __mainMap?: MaplibreMap
    __mapLoaded?: boolean
    __PLAYWRIGHT_ENABLED?: boolean
  }

  namespace NodeJS {
    interface ProcessEnv extends EnvFullSchema {}
  }
}

export {}
