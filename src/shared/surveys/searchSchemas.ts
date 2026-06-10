import { z } from "zod"

/** Dynamic survey field keys synced to the URL on public beteiligung pages. */
export const beteiligungSurveySearchSchema = z.record(z.string(), z.string())
