import db from "@/src/server/db.server"

type PlaywrightDbRequest = {
  model: string
  method: string
  args: unknown[]
}

async function main() {
  const payload = process.argv[2]
  if (!payload) {
    throw new Error("playwrightDb requires a JSON payload argument")
  }

  const { model, method, args } = JSON.parse(payload) as PlaywrightDbRequest
  const target = (
    db as unknown as Record<string, Record<string, (...callArgs: unknown[]) => unknown>>
  )[model]
  if (!target?.[method]) {
    throw new Error(`Unknown Prisma call: ${model}.${method}`)
  }

  const result = await target[method](...args)
  process.stdout.write(
    JSON.stringify(result, (_key, value) => (typeof value === "bigint" ? value.toString() : value)),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
