import type { getSurvey } from "./surveys.server"

export type Survey = Awaited<ReturnType<typeof getSurvey>>
