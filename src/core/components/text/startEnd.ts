import { Section, Subsection } from "@prisma/client"

export const startEnd = (object: Section | Subsection) => {
  return `${object.start} ▸ ${object.end}`
}
