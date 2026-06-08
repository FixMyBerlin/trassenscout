const { spawnSync } = require("node:child_process")

const CONTAINER_NAME = "ts-test-db"

const run = (args, options = {}) =>
  spawnSync("docker", args, {
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  })

const fail = (message, details) => {
  if (details) {
    console.error(details)
  }
  throw new Error(message)
}

const inspectRunningState = () => {
  const result = run(["inspect", "-f", "{{.State.Running}}", CONTAINER_NAME])
  if (result.status === 0) {
    return result.stdout.trim()
  }
  return null
}

const containerExists = () => {
  const result = run(["ps", "-a", "--filter", `name=^/${CONTAINER_NAME}$`, "--format", "{{.Names}}"])
  if (result.status !== 0) {
    fail("Failed to check existing Docker containers for E2E test DB", result.stderr)
  }

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .includes(CONTAINER_NAME)
}

const ensureRunning = () => {
  const runningState = inspectRunningState()

  if (runningState === "true") {
    console.log("Docker: Reusing running ts-test-db")
    return
  }

  if (containerExists()) {
    const result = run(["start", CONTAINER_NAME], { stdio: "inherit" })
    if (result.status !== 0) {
      fail("Failed to start existing ts-test-db container")
    }
    return
  }

  const result = run(
    ["run", "-d", "-e", "POSTGRES_PASSWORD=password", "-p", "6002:5432", "--name=ts-test-db", "postgres:16-alpine"],
    { stdio: "inherit" },
  )

  if (result.status !== 0) {
    fail("Failed to create ts-test-db container")
  }
}

ensureRunning()
