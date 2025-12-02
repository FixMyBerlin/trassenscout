"use client"

import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { ProjectRecordReviewState } from "@prisma/client"

const ReviewProjectRecordFormComponent = ({
  reviewStateOptions,
}: {
  reviewStateOptions: { value: ProjectRecordReviewState; label: string }[]
}) => (
  <div className="mt-8 mb-6 space-y-2 rounded-md border border-gray-200 bg-yellow-50 p-4 text-gray-700">
    <div className="flex items-center gap-2">
      <SparklesIcon className="size-5" />
      <h3 className="font-semibold">Protokoll-Freigabe</h3>
    </div>
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Hinweis: Abgelehnte Protokolle werden nicht mehr in der Protokoll-Liste angezeigt.
      </p>
      <LabeledRadiobuttonGroup scope="reviewState" items={reviewStateOptions} />

      <LabeledTextareaField
        name="reviewNotes"
        label="Review-Notizen"
        placeholder="Kommentare, Verbesserungsvorschläge oder Begründung für die Entscheidung..."
        rows={5}
        optional
      />
    </div>
  </div>
)

export const ReviewProjectRecordForm = ({
  adminView,
  reviewView,
}: {
  adminView?: boolean
  reviewView?: boolean
}) => {
  const reviewStateOptions: { value: ProjectRecordReviewState; label: string }[] = [
    {
      value: ProjectRecordReviewState.APPROVED,
      label: "Genehmigt - Protokoll ist korrekt",
    },
    {
      value: ProjectRecordReviewState.NEEDSREVIEW,
      label: "Benötigt Review",
    },
    {
      value: ProjectRecordReviewState.REJECTED,
      label: "Abgelehnt - Protokoll entspricht nicht den Standards",
    },
  ]

  if (!reviewView && !adminView) return

  // Admins get an additional review state option
  if (adminView) {
    return (
      <SuperAdminBox>
        <ReviewProjectRecordFormComponent
          reviewStateOptions={[
            ...reviewStateOptions,
            {
              value: ProjectRecordReviewState.NEEDSADMINREVIEW,
              label: "Benötigt Admin Review",
            },
          ]}
        />
      </SuperAdminBox>
    )
  }

  return <ReviewProjectRecordFormComponent reviewStateOptions={reviewStateOptions} />
}
