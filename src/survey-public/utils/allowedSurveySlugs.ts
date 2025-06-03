// All currently active "allowed" surveys need to be added to this array.
// The array will give us the type savety for the switch-case statements in getConfg*
// and will render a 404 for all other surveys.

import { z } from "zod"

export const allowedSurveySlugsLegacy = ["rs8", "frm7", "radnetz-brandenburg"] as const
export type AllowedSurveySlugsLegacy = (typeof allowedSurveySlugsLegacy)[number]

export const AllowedSurveySlugsSchemaLegacy = z
  .object({ slug: z.enum(allowedSurveySlugsLegacy) })
  .passthrough()
