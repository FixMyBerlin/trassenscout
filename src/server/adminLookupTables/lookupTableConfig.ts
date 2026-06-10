import type { z } from "zod"
import db from "@/src/server/db.server"
import type { LookupTableSchema } from "./adminLookupTables.inputSchemas"

export type LookupTable = z.infer<typeof LookupTableSchema>

type LookupTableConfig = {
  rowsKey: string
  orderBy: Record<string, "asc" | "desc">
  countForRow: (projectSlug: string, rowId: number) => Promise<number>
  countField: string
}

export const lookupTableConfig: Record<LookupTable, LookupTableConfig> = {
  acquisitionAreaStatuses: {
    rowsKey: "acquisitionAreaStatuses",
    orderBy: { title: "asc" },
    countField: "acquisitionAreaCount",
    countForRow: (projectSlug, rowId) =>
      db.acquisitionArea.count({
        where: {
          acquisitionAreaStatusId: rowId,
          subsubsection: { subsection: { project: { slug: projectSlug } } },
        },
      }),
  },
  networkHierarchies: {
    rowsKey: "networkHierarchys",
    orderBy: { slug: "asc" },
    countField: "subsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsection.count({
        where: { project: { slug: projectSlug }, networkHierarchyId: rowId },
      }),
  },
  operators: {
    rowsKey: "operators",
    orderBy: { order: "asc" },
    countField: "subsectionCount",
    countForRow: async (projectSlug, rowId) => {
      const operator = await db.operator.findFirst({
        where: { id: rowId, project: { slug: projectSlug } },
        select: { projectId: true },
      })
      if (!operator) return 0
      return db.subsection.count({
        where: { projectId: operator.projectId, operatorId: rowId },
      })
    },
  },
  projectRecordTopics: {
    rowsKey: "projectRecordTopics",
    orderBy: { title: "asc" },
    countField: "projectRecordCount",
    countForRow: (projectSlug, rowId) =>
      db.projectRecord.count({
        where: { projectRecordTopicId: rowId, project: { slug: projectSlug } },
      }),
  },
  qualityLevels: {
    rowsKey: "qualityLevels",
    orderBy: { id: "asc" },
    countField: "subsubsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsubsection.count({
        where: {
          qualityLevelId: rowId,
          subsection: { project: { slug: projectSlug } },
        },
      }),
  },
  subsectionStatuses: {
    rowsKey: "subsectionStatuss",
    orderBy: { id: "asc" },
    countField: "subsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsection.count({
        where: { project: { slug: projectSlug }, subsectionStatusId: rowId },
      }),
  },
  subsubsectionInfras: {
    rowsKey: "subsubsectionInfras",
    orderBy: { slug: "asc" },
    countField: "subsubsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsubsection.count({
        where: {
          subsubsectionInfraId: rowId,
          subsection: { project: { slug: projectSlug } },
        },
      }),
  },
  subsubsectionInfrastructureTypes: {
    rowsKey: "subsubsectionInfrastructureTypes",
    orderBy: { slug: "asc" },
    countField: "subsubsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsubsection.count({
        where: {
          subsubsectionInfrastructureTypeId: rowId,
          subsection: { project: { slug: projectSlug } },
        },
      }),
  },
  subsubsectionSpecials: {
    rowsKey: "subsubsectionSpecials",
    orderBy: { slug: "asc" },
    countField: "subsubsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsubsection.count({
        where: {
          specialFeatures: { some: { id: rowId } },
          subsection: { project: { slug: projectSlug } },
        },
      }),
  },
  subsubsectionStatuses: {
    rowsKey: "subsubsectionStatuss",
    orderBy: { id: "asc" },
    countField: "subsubsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsubsection.count({
        where: {
          subsubsectionStatusId: rowId,
          subsection: { project: { slug: projectSlug } },
        },
      }),
  },
  subsubsectionTasks: {
    rowsKey: "subsubsectionTasks",
    orderBy: { slug: "asc" },
    countField: "subsubsectionCount",
    countForRow: (projectSlug, rowId) =>
      db.subsubsection.count({
        where: {
          subsubsectionTaskId: rowId,
          subsection: { project: { slug: projectSlug } },
        },
      }),
  },
  surveyResponseTopics: {
    rowsKey: "surveyResponseTopics",
    orderBy: { title: "asc" },
    countField: "surveyResponseCount",
    countForRow: (projectSlug, rowId) =>
      db.surveyResponse.count({
        where: {
          surveyResponseTopics: { some: { id: rowId } },
          surveySession: { survey: { project: { slug: projectSlug } } },
        },
      }),
  },
}
