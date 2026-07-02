import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { deleteAllAcquisitionAreasForSubsubsectionFn } from "@/src/server/acquisitionAreas/acquisitionAreas.functions"
import { acquisitionAreasBySubsubsectionQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasAbschnitteQueryOptions"
import { projectRecordsBySubsubsectionQueryOptions } from "@/src/server/projectRecords/projectRecordsAbschnitteQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"

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
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({ mutationFn: deleteAllAcquisitionAreasForSubsubsectionFn })
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleClick = async () => {
    setFeedback(null)
    if (
      !window.confirm(
        "Alle Verhandlungsflächen dieser Maßnahme unwiderruflich löschen? Verknüpfte Projektdokumentation kann entfallen.",
      )
    ) {
      return
    }
    try {
      const result = await deleteMutation.mutateAsync({
        data: {
          projectSlug,
          subsectionSlug,
          subsubsectionSlug,
        },
      })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: subsubsectionBySlugQueryOptions({
            projectSlug,
            subsectionSlug,
            subsubsectionSlug,
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: acquisitionAreasBySubsubsectionQueryOptions({
            projectSlug,
            subsubsectionId,
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectRecordsBySubsubsectionQueryOptions({
            projectSlug,
            subsubsectionId,
          }).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: ["uploadsWithSubsections"] }),
      ])
      setFeedback(
        `Gelöscht: ${result.deletedAcquisitionAreas} Verhandlungsfläche(n). Hinweis: verknüpfte Projektdokumentation zu diesen Flächen kann entfallen (Datenbank-Cascade).`,
      )
    } catch (e: unknown) {
      setFeedback(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <SuperAdminBox className="my-6">
      <p className="mt-1 text-xs text-gray-700">
        Entfernt alle Grunderwerbs-Flächen und ggf. leere ALKIS-Parcels für Maßnahme -ID{" "}
        {subsubsectionId}. Projektdokumentation, die nur über eine Verhandlungsfläche verknüpft war,
        kann entfallen.
      </p>
      <button
        type="button"
        className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
        disabled={deleteMutation.isPending}
        onClick={() => void handleClick()}
      >
        {deleteMutation.isPending
          ? "Wird gelöscht…"
          : "Alle Verhandlungsflächen dieser Maßnahme löschen"}
      </button>
      {feedback ? <p className="mt-3 text-xs text-gray-800">{feedback}</p> : null}
    </SuperAdminBox>
  )
}
