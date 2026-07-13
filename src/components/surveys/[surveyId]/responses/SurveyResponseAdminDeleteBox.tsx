import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { deleteSurveyResponseAsAdminFn } from "@/src/server/survey-responses/surveyResponses.functions"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"

type Props = {
  response: FeedbackSurveyResponse
  projectSlug: string
  refetchResponsesAndTopics: () => Promise<void>
}

export const SurveyResponseAdminDeleteBox = ({
  response,
  projectSlug,
  refetchResponsesAndTopics,
}: Props) => {
  const deleteSurveyResponseMutation = useMutation({ mutationFn: deleteSurveyResponseAsAdminFn })
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  )

  const handleDelete = async () => {
    setFeedback(null)
    if (
      !window.confirm(
        `Eintrag ${response.id} unwiderruflich löschen? Dies kann nicht rückgängig gemacht werden. ` +
          `Zugehörige Uploads werden ebenfalls gelöscht und die zugehörige Session wird gelöscht, ` +
          `wenn sie keine weiteren Einträge enthält.`,
      )
    ) {
      return
    }

    try {
      await deleteSurveyResponseMutation.mutateAsync({ data: { projectSlug, id: response.id } })
      await refetchResponsesAndTopics()
      setFeedback({ type: "success", message: `Eintrag ${response.id} wurde gelöscht.` })
    } catch (e: unknown) {
      setFeedback({
        type: "error",
        message: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return (
    <SuperAdminBox className="my-6">
      <p className="mt-1 text-xs text-gray-700">
        Entfernt Eintrag {response.id} unwiderruflich. Zugehörige Uploads ohne andere Verknüpfungen
        werden gelöscht; die Session wird entfernt, wenn sie keine weiteren Einträge enthält.
        Einträge, die mit einer Maßnahme verknüpft sind, können nicht gelöscht werden.
      </p>
      <button
        type="button"
        className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
        disabled={deleteSurveyResponseMutation.isPending}
        onClick={() => void handleDelete()}
      >
        {deleteSurveyResponseMutation.isPending
          ? "Wird gelöscht…"
          : `Eintrag ${response.id} löschen`}
      </button>
      {feedback ? (
        <p
          className={
            feedback.type === "error"
              ? "mt-3 text-xs font-medium text-red-800"
              : "mt-3 text-xs text-gray-800"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </SuperAdminBox>
  )
}
