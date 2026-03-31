// WORKFLOW
// 1. Add a field here
// 2. Add the field **twice** to `src/server/subsubsections/schema.ts` at `LIST ALL m2mFields HERE`

export const m2mFields = ["subsubsectionInfrastructureTypeIds", "specialFeatures"] as const

export type M2MFieldsType = (typeof m2mFields)[number]

export const m2mFieldRelationNames: Record<M2MFieldsType, string> = {
  subsubsectionInfrastructureTypeIds: "SubsubsectionInfrastructureTypes",
  specialFeatures: "specialFeatures",
}
