import { z } from "zod"

export const SlugSchema = z
  .string()
  .min(1, { message: "Pflichtfeld. Mindestens 1 Zeichen." })
  .regex(/^[a-z0-9-]*$/, { message: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, -." })

export const NameSchema = z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." })
