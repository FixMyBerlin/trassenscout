import type { getSubsectionBySlug, getSubsections } from "./subsections.server"

export type SubsectionsList = Awaited<ReturnType<typeof getSubsections>>
export type SubsectionBySlug = Awaited<ReturnType<typeof getSubsectionBySlug>>
