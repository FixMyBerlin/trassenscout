import { frenchQuote } from "@/src/components/core/components/text/quote"
import {
  type AcquisitionAreaRelation,
  formatAcquisitionAreaRelationOptionLabel,
  formatSubsubsectionRelationOptionLabel,
  type ProjectRecordRelation,
  type SubsubsectionRelation,
} from "@/src/components/project-records/ProjectRelationLinks"

export type UploadLinks = {
  projectRecords: ProjectRecordRelation[]
  subsubsections: SubsubsectionRelation[]
  acquisitionAreas: AcquisitionAreaRelation[]
  surveyResponse: { id: number } | null
}

const MAX_LISTED_PLACES = 6

export function uploadDeletionConfirmMessage(uploadTitle: string, links: UploadLinks | null) {
  const question = `Möchten Sie das Dokument ${frenchQuote(uploadTitle)} wirklich unwiderruflich löschen?`
  if (!links) return question

  const places = [
    ...links.projectRecords.map((record) => `Protokolleintrag: ${record.title}`),
    ...links.subsubsections.map(formatSubsubsectionRelationOptionLabel),
    ...links.acquisitionAreas.map(formatAcquisitionAreaRelationOptionLabel),
    ...(links.surveyResponse ? [`Beteiligung: Eingabe mit der ID ${links.surveyResponse.id}`] : []),
  ]
  if (places.length < 2) return question

  const listed = places.slice(0, MAX_LISTED_PLACES)
  const notListed = places.length - listed.length
  return [
    question,
    "",
    "Es ist an mehreren Stellen verknüpft und wird überall entfernt:",
    ...listed.map((place) => `– ${place}`),
    ...(notListed > 0 ? [`– und ${notListed} weitere`] : []),
  ].join("\n")
}
