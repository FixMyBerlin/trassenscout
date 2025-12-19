"use client"

import { LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { ProjectRecordReviewState } from "@prisma/client"

export const ReviewProjectRecordForm = ({ admin }: { admin?: boolean }) => {
  let reviewStateOptions: { value: ProjectRecordReviewState; label: string }[] = [
    {
      value: ProjectRecordReviewState.APPROVED,
      label: "Genehmigt - Protokolleintrag ist korrekt",
    },
    {
      value: ProjectRecordReviewState.NEEDSREVIEW,
      label: "Benötigt Bestätigung",
    },
    {
      value: ProjectRecordReviewState.REJECTED,
      label: "Abgelehnt - Protokolleintrag entspricht nicht den Standards",
    },
  ]

  if (admin) {
    reviewStateOptions = [
      ...reviewStateOptions,
      {
        value: ProjectRecordReviewState.NEEDSADMINREVIEW,
        label: "Benötigt Admin-Bestätigung",
      },
    ]
  }

  return (
    <div className="mt-8 mb-6 space-y-2 rounded-md border border-gray-200 bg-yellow-50 p-4 text-gray-700">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-5" />
        <h3 className="font-semibold">Protokolleintrag-Bestätigung</h3>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Hinweis: Abgelehnte Protokolleinträge werden nicht mehr in der Protokoll-Übersicht
          angezeigt.
        </p>
        <LabeledRadiobuttonGroup scope="reviewState" items={reviewStateOptions} />

        <LabeledTextareaField
          name="reviewNotes"
          label="Bestätigungsnotiz"
          placeholder="Kommentare, Verbesserungsvorschläge oder Begründung für die Entscheidung..."
          rows={5}
          optional
        />
      </div>
    </div>
  )
}
