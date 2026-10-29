import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { SpinnerIcon } from "@/src/components/core/components/Spinner"
import { projectRecordTemplatesByProjectQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
import type { ProjectRecordTemplateOption } from "@/src/server/projectRecordTemplates/types"

const pickerOptionButtonClassName =
  "flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-blue-700 hover:bg-blue-50 disabled:cursor-default disabled:hover:bg-transparent"

type Props = {
  projectSlug: string
  open: boolean
  onClose: () => void
  onSelect: (template: ProjectRecordTemplateOption | null) => void
  intro?: string
  pendingTemplateId?: number | null
  children?: ReactNode
}

export function ProjectRecordTemplatePickerModal({
  projectSlug,
  open,
  onClose,
  onSelect,
  intro = "Möchten Sie eine Vorlage nutzen oder ohne Vorlage starten?",
  pendingTemplateId,
  children,
}: Props) {
  const { data: templates = [] } = useQuery(
    projectRecordTemplatesByProjectQueryOptions({ projectSlug }),
  )

  const optionButton = (template: ProjectRecordTemplateOption | null) => (
    <button
      key={template?.id ?? "none"}
      type="button"
      onClick={() => onSelect(template)}
      disabled={pendingTemplateId !== undefined}
      className={pickerOptionButtonClassName}
    >
      <span>{template ? template.templateTitle : "Ohne Vorlage"}</span>
      {pendingTemplateId === (template?.id ?? null) ? <SpinnerIcon size="5" /> : <span>→</span>}
    </button>
  )

  return (
    <Modal open={open} handleClose={onClose} align="center" className="sm:max-w-2xl">
      <PageHeader title="Neuer Protokolleintrag" action={<ModalCloseButton onClose={onClose} />} />

      <div className={`space-y-4 ${pageContentPaddingClassName}`}>
        <p className="text-gray-600">{intro}</p>
        {children}
        {optionButton(null)}

        {!!templates.length && (
          <>
            <h4 className="text-lg font-semibold text-gray-700">Vorlagen</h4>
            <div className="space-y-2">{templates.map((template) => optionButton(template))}</div>
          </>
        )}
      </div>
    </Modal>
  )
}
