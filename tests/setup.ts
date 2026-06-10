import "@testing-library/jest-dom"
import "@/src/components/shared/zodDeLocale"
import { testSetupEnvSchema } from "@/scripts/shared/e2eEnv"
import { parseValidatedEnv } from "@/scripts/shared/env"

parseValidatedEnv(testSetupEnvSchema, process.env)
