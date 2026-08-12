import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  getSubsubsectionExtraFieldValueCountsFn,
  updateProjectSubsubsectionExtraFieldDefinitionsFn,
} from "@/src/server/projects/subsubsectionExtraFields.functions"
import { subsubsectionExtraFieldsProjectsQueryOptions } from "@/src/server/projects/subsubsectionExtraFieldsQueryOptions"
import {
  getRemovedDefinitionNames,
  parseDefinitions,
  type SubsubsectionExtraFieldDefinition,
} from "@/src/shared/subsubsections/extraFieldSchemas"
import { AdminSubsubsectionExtraFieldsForm } from "./AdminSubsubsectionExtraFieldsForm"

type Props = {
  projectSlug: string
}

function buildDeleteConfirmMessage(
  removedNames: string[],
  counts: Record<string, number>,
  savedDefinitions: SubsubsectionExtraFieldDefinition[],
) {
  const lines = removedNames
    .filter((name) => (counts[name] ?? 0) > 0)
    .map((name) => {
      const label = savedDefinitions.find((definition) => definition.name === name)?.label ?? name
      const count = counts[name] ?? 0
      return `• „${label}" (${count} Maßnahme${count === 1 ? "" : "n"})`
    })

  return [
    "Beim Speichern werden folgende Felder entfernt. Alle gespeicherten Werte dafür werden unwiderruflich gelöscht:",
    "",
    ...lines,
    "",
    "Fortfahren?",
  ].join("\n")
}

export function AdminSubsubsectionExtraFieldsEditForm({ projectSlug }: Props) {
  const queryClient = useQueryClient()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const savedDefinitions = parseDefinitions(project.subsubsectionExtraFieldDefinitions)
  const updateMutation = useMutation({
    mutationFn: updateProjectSubsubsectionExtraFieldDefinitionsFn,
  })

  const handleSubmit = async (definitions: SubsubsectionExtraFieldDefinition[]) => {
    const removedNames = getRemovedDefinitionNames(savedDefinitions, definitions)

    if (removedNames.length > 0) {
      const counts = await getSubsubsectionExtraFieldValueCountsFn({
        data: { projectSlug, fieldNames: removedNames },
      })
      const hasStoredValues = removedNames.some((name) => (counts[name] ?? 0) > 0)

      if (
        hasStoredValues &&
        !window.confirm(buildDeleteConfirmMessage(removedNames, counts, savedDefinitions))
      ) {
        return { cancelled: true as const }
      }
    }

    try {
      await updateMutation.mutateAsync({
        data: { projectSlug, definitions },
      })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectBySlugQueryOptions(projectSlug).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: subsubsectionExtraFieldsProjectsQueryOptions().queryKey,
        }),
      ])
    } catch (error: unknown) {
      return {
        [FORM_ERROR]:
          error instanceof Error ? error.message : "Beim Speichern ist ein Fehler aufgetreten.",
      }
    }
  }

  return (
    <AdminSubsubsectionExtraFieldsForm
      key={JSON.stringify(savedDefinitions)}
      currentProjectSlug={projectSlug}
      initialDefinitions={savedDefinitions}
      onSubmit={handleSubmit}
      submitText="Speichern"
      submitDisabled={updateMutation.isPending}
    />
  )
}
