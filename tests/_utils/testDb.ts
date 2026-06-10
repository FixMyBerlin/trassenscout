import { spawnSync } from "node:child_process"
import path from "node:path"
import { loadE2eEnvSync, toSpawnEnv } from "../../scripts/shared/e2eEnv"
import type { PrismaClient } from "../../src/prisma/generated/client"

const projectRoot = path.resolve(__dirname, "../..")
const testEnv = toSpawnEnv(loadE2eEnvSync())

async function prismaCall<T>(model: string, method: string, args: unknown[] = []): Promise<T> {
  const payload = JSON.stringify({ model, method, args })
  const result = spawnSync("bun", ["scripts/test/playwrightDb.ts", payload], {
    cwd: projectRoot,
    env: testEnv as NodeJS.ProcessEnv,
    encoding: "utf-8",
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `playwrightDb failed for ${model}.${method}`)
  }

  const output = result.stdout.trim()
  return output ? (JSON.parse(output) as T) : (undefined as T)
}

function createModelProxy(model: string) {
  return new Proxy(
    {},
    {
      get(_target, method) {
        if (typeof method !== "string") return undefined
        return (...args: unknown[]) => prismaCall(model, method, args)
      },
    },
  )
}

let dbProxy: PrismaClient | null = null

/** Prisma access for Playwright via Bun subprocess (Node workers cannot load generated client). */
export function getTestDb(): Promise<PrismaClient> {
  if (!dbProxy) {
    dbProxy = new Proxy({} as PrismaClient, {
      get(_target, model) {
        if (typeof model !== "string") return undefined
        return createModelProxy(model)
      },
    })
  }
  return Promise.resolve(dbProxy)
}
