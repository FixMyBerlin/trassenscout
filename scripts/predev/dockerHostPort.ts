import { $ } from "bun"

/** Host port published by a running Docker container (`0.0.0.0:5435->5432/tcp`). */
export async function findContainerPublishingHostPort(port: number): Promise<string | null> {
  const result = await $`docker ps --filter publish=${port} --format {{.Names}}`.quiet().nothrow()
  if (result.exitCode !== 0) return null
  const name = result.text().trim()
  return name || null
}
