import { appendFileSync } from "node:fs"

export function writeGithubOutput(name: string, value: string) {
  const file = process.env.GITHUB_OUTPUT
  if (!file) throw new Error("GITHUB_OUTPUT is not set")
  appendFileSync(file, `${name}=${value}\n`, "utf8")
}

export function writeGithubEnv(name: string, value: string) {
  const file = process.env.GITHUB_ENV
  if (!file) throw new Error("GITHUB_ENV is not set")
  appendFileSync(file, `${name}=${value}\n`, "utf8")
}
