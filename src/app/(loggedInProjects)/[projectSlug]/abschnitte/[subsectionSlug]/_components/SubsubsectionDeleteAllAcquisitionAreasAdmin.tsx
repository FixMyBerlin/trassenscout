"use client"

import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import deleteAllAcquisitionAreasForSubsubsection from "@/src/server/acquisitionAreas/mutations/deleteAllAcquisitionAreasForSubsubsection"
import getAcquisitionAreasBySubsubsection from "@/src/server/acquisitionAreas/queries/getAcquisitionAreasBySubsubsection"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { useState } from "react"

type Props = {
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug: string
  subsubsectionId: number
}

export const SubsubsectionDeleteAllAcquisitionAreasAdmin = ({
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
  subsubsectionId,
}: Props) => {
  const [deleteMutation, { isLoading }] = useMutation(deleteAllAcquisitionAreasForSubsubsection)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleClick = async () => {
    setFeedback(null)
    if (
      !window.confirm(
        "Alle Dealflächen dieses Eintrags unwiderruflich löschen? Verknüpfte Projektdokumentation kann entfallen.",
      )
    ) {
      return
    }
    try {
      const result = await deleteMutation({
        projectSlug,
        subsectionSlug,
        subsubsectionSlug,
      })
      invalidateQuery(getSubsubsection)
      invalidateQuery(getAcquisitionAreasBySubsubsection)
      invalidateQuery(getProjectRecordsBySubsubsection)
      invalidateQuery(getUploadsWithSubsections)
      setFeedback(
        `Gelöscht: ${result.deletedAcquisitionAreas} Dealfläche(n). Hinweis: verknüpfte Projektdokumentation zu diesen Flächen kann entfallen (Datenbank-Cascade).`,
      )
    } catch (e: unknown) {
      setFeedback(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <SuperAdminBox className="my-6">
      <p className="mt-1 text-xs text-gray-700">
        Entfernt alle Grunderwerbs-Flächen und ggf. leere ALKIS-Parcels für Eintrag-ID{" "}
        {subsubsectionId}. Projektdokumentation, die nur über eine Dealfläche verknüpft war, kann
        entfallen.
      </p>
      <button
        type="button"
        className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
        disabled={isLoading}
        onClick={() => void handleClick()}
      >
        {isLoading ? "Wird gelöscht…" : "Alle Dealflächen dieses Eintrags löschen"}
      </button>
      {feedback ? <p className="mt-3 text-xs text-gray-800">{feedback}</p> : null}
    </SuperAdminBox>
  )
}
