const { spawnSync } = require("node:child_process")

const result = spawnSync("docker", ["rm", "-f", "ts-test-db"], {
  encoding: "utf8",
  stdio: "pipe",
})

if (result.stdout) {
  process.stdout.write(result.stdout)
}

if (result.stderr && !result.stderr.includes("No such container")) {
  process.stderr.write(result.stderr)
}

if (result.status !== 0 && !result.stderr?.includes("No such container")) {
  process.exit(result.status ?? 1)
}
