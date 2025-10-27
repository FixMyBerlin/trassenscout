// WORKFLOW
// copied from src/survey-responses/m2mFields.ts
// 1. Add a field here
// 2. Add the field **twice** to `src/server/uploads/schema.ts` at `LIST ALL m2mFields HERE`

export const m2mFields = ["projectRecords"] as const

export type M2MFieldsType = (typeof m2mFields)[number]
