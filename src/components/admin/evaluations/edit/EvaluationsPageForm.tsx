import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid"
import { DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/outline"
import { ReactNode, useState } from "react"
import { z } from "zod"
import {
  iconButtonClassName,
  primaryButtonClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { moveItem } from "@/src/components/core/utils/moveItem"
import { evaluationsPageFormDefaultValues } from "@/src/server/evaluationsPage/evaluationsPage.inputSchemas"
import {
  evaluationChartDescriptions,
  evaluationChartLabels,
  evaluationChartOptions,
  type EvaluationsPageSection,
  textOnlyChartLabel,
} from "@/src/shared/evaluations/evaluationsPageConfig"

export type EvaluationsPageFormProps<S extends z.ZodType> = {
  schema: S
  initialValues?: Partial<z.infer<S>>
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  submitDisabled?: boolean
  submitClassName?: string
}

function createSectionId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `section-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

function createSection(): EvaluationsPageSection {
  return { id: createSectionId(), chart: "", markdown: "" }
}

export function EvaluationsPageForm<S extends z.ZodType>({
  schema,
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  submitDisabled,
  submitClassName,
}: EvaluationsPageFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...evaluationsPageFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value as z.infer<S>)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  const setSections = (sections: EvaluationsPageSection[]) => {
    form.setFieldValue("config", { version: 1, sections })
  }

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={className}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      backLink={null}
    >
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel" />}
      </form.AppField>

      <form.Subscribe selector={(state) => state.values.config.sections}>
        {(sections) => (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <section
                key={section.id}
                className="rounded-md border border-gray-200 bg-white p-4 shadow-xs"
              >
                <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Auswertungs-Element {index + 1}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {section.chart ? evaluationChartLabels[section.chart] : textOnlyChartLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={iconButtonClassName}
                      disabled={index === 0}
                      onClick={() => setSections(moveItem(sections, index, "up"))}
                      title="Nach oben"
                      aria-label={`Auswertungs-Element ${index + 1} nach oben verschieben`}
                    >
                      <ChevronUpIcon className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={iconButtonClassName}
                      disabled={index === sections.length - 1}
                      onClick={() => setSections(moveItem(sections, index, "down"))}
                      title="Nach unten"
                      aria-label={`Auswertungs-Element ${index + 1} nach unten verschieben`}
                    >
                      <ChevronDownIcon className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={iconButtonClassName}
                      onClick={() => {
                        setSections([
                          ...sections.slice(0, index + 1),
                          { ...section, id: createSectionId() },
                          ...sections.slice(index + 1),
                        ])
                      }}
                      title="Duplizieren"
                      aria-label={`Auswertungs-Element ${index + 1} duplizieren`}
                    >
                      <DocumentDuplicateIcon className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={iconButtonClassName}
                      onClick={() =>
                        setSections(sections.filter((_, sectionIndex) => sectionIndex !== index))
                      }
                      title="Löschen"
                      aria-label={`Auswertungs-Element ${index + 1} löschen`}
                    >
                      <TrashIcon className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <form.AppField name={`config.sections[${index}].chart`}>
                    {(field) => (
                      <field.SelectField
                        label="Diagrammtyp"
                        options={evaluationChartOptions}
                        help={
                          section.chart
                            ? evaluationChartDescriptions[section.chart]
                            : "Zeigt nur den Text an, ohne Diagramm."
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`config.sections[${index}].markdown`}>
                    {(field) => <field.TextareaField label="Text (Markdown)" optional rows={10} />}
                  </form.AppField>

                  {section.markdown.trim() ? (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="mb-2 text-sm font-medium text-gray-700">Vorschau</p>
                      <Markdown markdown={section.markdown} className="prose-sm" />
                    </div>
                  ) : null}
                </div>
              </section>
            ))}

            <ZeroCase small visible={sections.length} name="Auswertungs-Elemente" verb="angelegt" />

            <button
              type="button"
              className={primaryButtonClassName}
              onClick={() => setSections([...sections, createSection()])}
            >
              {linkIcons.plus}
              Element hinzufügen
            </button>
          </div>
        )}
      </form.Subscribe>
    </FormShell>
  )
}
