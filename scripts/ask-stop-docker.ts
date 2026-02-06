#!/usr/bin/env bun

import { confirm } from "@clack/prompts"
import { $ } from "bun"

const shouldStop = await confirm({
  message: "Stop Docker containers?",
  initialValue: false,
})

if (shouldStop) {
  console.log("Stopping Docker containers...")
  await $`docker compose stop`
} else {
  console.log("Keeping Docker containers running.")
}
