import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
  archiveSurveyResponseTagFn,
  createSurveyResponseTagFn,
  deleteSurveyResponseTagFn,
  unarchiveSurveyResponseTagFn,
  updateSurveyResponseTagFn,
} from "@/src/server/surveyResponseTags/surveyResponseTags.functions"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

function buildListLink(projectSlug: string) {
  return {
    to: "/$projectSlug/survey-response-tags" as const,
    params: { projectSlug },
  }
}

function buildNewLink(projectSlug: string) {
  return {
    to: "/$projectSlug/survey-response-tags/new" as const,
    params: { projectSlug },
  }
}

function buildEditLink(projectSlug: string, id: number) {
  return {
    to: "/$projectSlug/survey-response-tags/$tagId/edit" as const,
    params: { projectSlug, tagId: String(id) },
  }
}

function buildSurveyResponseTagListNavigateOptions(projectSlug: string) {
  return { ...buildListLink(projectSlug), replace: true as const }
}

export function useSurveyResponseTagRouteLinks(projectSlug: string) {
  const router = useRouter()
  const listLink = buildListLink(projectSlug)

  return {
    listLink,
    newLink: buildNewLink(projectSlug),
    editLink: (id: number) => buildEditLink(projectSlug, id),
    listHref: router.buildLocation(listLink).href,
  }
}

export function useSurveyResponseTagMutations(projectSlug: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const listNavigateOptions = buildSurveyResponseTagListNavigateOptions(projectSlug)

  const invalidateTags = () => {
    void queryClient.invalidateQueries({
      queryKey: ["surveyResponseTags"],
    })
  }

  const createTagMutation = useMutation({ mutationFn: createSurveyResponseTagFn })
  const updateTagMutation = useMutation({ mutationFn: updateSurveyResponseTagFn })
  const archiveTagMutation = useMutation({ mutationFn: archiveSurveyResponseTagFn })
  const unarchiveTagMutation = useMutation({ mutationFn: unarchiveSurveyResponseTagFn })
  const deleteTagMutation = useMutation({ mutationFn: deleteSurveyResponseTagFn })

  const createTag = async (title: string) => {
    await createTagMutation.mutateAsync({ data: { projectSlug, title } })
    invalidateTags()
    void router.navigate(listNavigateOptions)
  }

  const updateTag = async (id: number, title: string) => {
    await updateTagMutation.mutateAsync({ data: { projectSlug, id, title } })
    invalidateTags()
    void router.navigate(listNavigateOptions)
  }

  const archiveTag = async (id: number) => {
    await archiveTagMutation.mutateAsync({ data: { projectSlug, id } })
    invalidateTags()
  }

  const unarchiveTag = async (id: number) => {
    await unarchiveTagMutation.mutateAsync({ data: { projectSlug, id } })
    invalidateTags()
  }

  const deleteTag = async (id: number) => {
    await deleteTagMutation.mutateAsync({ data: { projectSlug, id } })
    invalidateTags()
    void router.navigate(listNavigateOptions)
  }

  return {
    createTag,
    updateTag,
    archiveTag,
    unarchiveTag,
    deleteTag,
    listNavigateOptions,
    invalidateTags,
    surveyResponseTagsWithUsageCountQuery: surveyResponseTagsWithUsageCountQueryOptions({
      projectSlug,
      includeArchived: true,
    }),
  }
}
