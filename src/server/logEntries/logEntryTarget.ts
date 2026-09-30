import { LogLevelActionEnum } from "@/src/prisma/generated/browser"

type SlugPath = { slug: string; subsection: { slug: string } }

export const logEntryTargetSelect = {
  uploadId: true,
  contactId: true,
  projectRecordId: true,
  acquisitionArea: {
    select: {
      id: true,
      subsubsection: { select: { slug: true, subsection: { select: { slug: true } } } },
    },
  },
  surveyResponse: { select: { id: true, surveySession: { select: { surveyId: true } } } },
  subsubsection: { select: { slug: true, subsection: { select: { slug: true } } } },
  subsection: { select: { slug: true } },
} as const

export type LogEntryTargetSource = {
  action: LogLevelActionEnum
  uploadId: number | null
  contactId: number | null
  projectRecordId: number | null
  acquisitionArea: { id: number; subsubsection: SlugPath } | null
  surveyResponse: { id: number; surveySession: { surveyId: number } } | null
  subsubsection: SlugPath | null
  subsection: { slug: string } | null
}

export type LogEntryTarget =
  | { type: "upload"; uploadId: number }
  | { type: "contact"; contactId: number }
  | { type: "projectRecord"; projectRecordId: number }
  | {
      type: "acquisitionArea"
      acquisitionAreaId: number
      subsectionSlug: string
      subsubsectionSlug: string
    }
  | { type: "surveyResponse"; surveyId: number; surveyResponseId: number }
  | { type: "subsubsection"; subsectionSlug: string; subsubsectionSlug: string }
  | { type: "subsection"; subsectionSlug: string }

export function logEntryTarget(entry: LogEntryTargetSource): LogEntryTarget | null {
  if (entry.action === LogLevelActionEnum.DELETE) return null

  if (entry.uploadId) return { type: "upload", uploadId: entry.uploadId }
  if (entry.contactId) return { type: "contact", contactId: entry.contactId }
  if (entry.projectRecordId) {
    return { type: "projectRecord", projectRecordId: entry.projectRecordId }
  }
  if (entry.acquisitionArea) {
    return {
      type: "acquisitionArea",
      acquisitionAreaId: entry.acquisitionArea.id,
      subsectionSlug: entry.acquisitionArea.subsubsection.subsection.slug,
      subsubsectionSlug: entry.acquisitionArea.subsubsection.slug,
    }
  }
  if (entry.surveyResponse) {
    return {
      type: "surveyResponse",
      surveyId: entry.surveyResponse.surveySession.surveyId,
      surveyResponseId: entry.surveyResponse.id,
    }
  }
  if (entry.subsubsection) {
    return {
      type: "subsubsection",
      subsectionSlug: entry.subsubsection.subsection.slug,
      subsubsectionSlug: entry.subsubsection.slug,
    }
  }
  if (entry.subsection) return { type: "subsection", subsectionSlug: entry.subsection.slug }

  return null
}
