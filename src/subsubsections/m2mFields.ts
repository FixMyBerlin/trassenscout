// WORKFLOW
// 1. Add a field here
// 2. Add the field **twice** to `src/subsubsections/schema.ts` at `LIST ALL m2mFields HERE`

export const m2mFields = ["specialFeatures"] as const

export type M2MFieldsType = (typeof m2mFields)[number]
