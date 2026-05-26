export type RelationEntity = "projectRecord" | "upload"

export type RelationContext =
  | "project"
  | "subsubsection"
  | "acquisitionArea"
  | "surveyResponse"
  | "projectRecord"

export type RelationEditRule = "allEditable" | "projectRecordLocked"

export type RelationCreateDefaults = {
  project: boolean
  subsubsection: boolean
  acquisitionArea: boolean
  surveyResponse: boolean
  projectRecord: boolean
}

export type RelationPolicyEntry = {
  context: RelationContext
  filter: "explicitOnly" | "none"
  createDefaults: RelationCreateDefaults
  editRule: RelationEditRule
}

type RelationPolicyMap = Record<
  RelationEntity,
  Partial<Record<RelationContext, RelationPolicyEntry>>
>

const noDefaults: RelationCreateDefaults = {
  project: false,
  subsubsection: false,
  acquisitionArea: false,
  surveyResponse: false,
  projectRecord: false,
}

export const relationPolicy: RelationPolicyMap = {
  projectRecord: {
    project: {
      context: "project",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true },
      editRule: "allEditable",
    },
    subsubsection: {
      context: "subsubsection",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true, subsubsection: true },
      editRule: "allEditable",
    },
    acquisitionArea: {
      context: "acquisitionArea",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true, acquisitionArea: true },
      editRule: "allEditable",
    },
  },
  upload: {
    project: {
      context: "project",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true },
      editRule: "allEditable",
    },
    subsubsection: {
      context: "subsubsection",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true, subsubsection: true },
      editRule: "allEditable",
    },
    acquisitionArea: {
      context: "acquisitionArea",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true, acquisitionArea: true },
      editRule: "allEditable",
    },
    surveyResponse: {
      context: "surveyResponse",
      filter: "none",
      createDefaults: { ...noDefaults, project: true, surveyResponse: true },
      editRule: "allEditable",
    },
    projectRecord: {
      context: "projectRecord",
      filter: "explicitOnly",
      createDefaults: { ...noDefaults, project: true, projectRecord: true },
      editRule: "projectRecordLocked",
    },
  },
}
