import { SparklesIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"

export const ReviewProjectRecordForm = ({ admin }: { admin?: boolean }) => {
  const form = useCoreAppFormContext()

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
    <div className="w-full border-t border-gray-200 bg-yellow-50 text-gray-700">
      <div className={twJoin(pageContentPaddingClassName, "space-y-4")}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5" />
            <h3 className="font-semibold">Protokolleintrag-Bestätigung</h3>
          </div>
          <p className="text-sm text-gray-500">
            Hinweis: Abgelehnte Protokolleinträge werden nicht mehr in der Protokoll-Übersicht
            angezeigt.
          </p>
        </div>

        <form.AppField name="reviewState">
          {(field) => <field.RadiobuttonGroup items={reviewStateOptions} />}
        </form.AppField>

        <form.AppField name="reviewNotes">
          {(field) => (
            <field.TextareaField
              label="Bestätigungsnotiz"
              placeholder="Kommentare, Verbesserungsvorschläge oder Begründung für die Entscheidung..."
              rows={5}
              optional
            />
          )}
        </form.AppField>
      </div>
    </div>
  )
}
