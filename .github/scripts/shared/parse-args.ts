export function parseArgs(argv: string[]) {
  const args = new Map<string, string>()
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i]
    const value = argv[i + 1]
    if (!key.startsWith("--")) throw new Error(`Invalid argument: ${key}`)
    if (value === undefined || value.startsWith("--")) throw new Error(`Missing value for ${key}`)
    args.set(key.slice(2), value)
    i += 1
  }
  return args
}
