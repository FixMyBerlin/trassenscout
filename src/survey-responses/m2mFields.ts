// WORKFLOW
// copied from src/server/subsubsections/m2mFields.ts
// 1. Add a field here
// 2. Add the field **twice** to `src/survey-responses/schema.ts` at `LIST ALL m2mFields HERE`

export const m2mFields = ["surveyResponseTopics"] as const

export type M2MFieldsType = (typeof m2mFields)[number]
