import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import {
  archiveTagFn,
  createTagFn,
  deleteTagFn,
  unarchiveTagFn,
  updateTagFn,
} from "@/src/server/tags/tags.functions"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type TagListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: TagListSearch = {}) {
  return {
    to: "/$projectSlug/tags" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: TagListSearch = {}) {
  return {
    to: "/$projectSlug/tags/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: TagListSearch = {}) {
  return {
    to: "/$projectSlug/tags/$tagId/edit" as const,
    params: { projectSlug, tagId: String(id) },
    search: preserveFromSearch(search),
  }
}

function buildTagListNavigateOptions(projectSlug: string, search: TagListSearch = {}) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useTagRouteLinks(projectSlug: string, searchOverride?: TagListSearch) {
  const router = useRouter()
  const routeSearch = useTryRouteSearch()
  const search = searchOverride ?? routeSearch ?? {}
  const listLink = buildListLink(projectSlug, search)

  return {
    search,
    listLink,
    newLink: buildNewLink(projectSlug, search),
    editLink: (id: number) => buildEditLink(projectSlug, id, search),
    listHref: router.buildLocation(listLink).href,
  }
}

export function useTagMutations(projectSlug: string, search: TagListSearch = {}) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const listNavigateOptions = buildTagListNavigateOptions(projectSlug, search)

  const invalidateTags = () => {
    void queryClient.invalidateQueries({
      queryKey: ["tags"],
    })
  }

  const createTagMutation = useMutation({ mutationFn: createTagFn })
  const updateTagMutation = useMutation({ mutationFn: updateTagFn })
  const archiveTagMutation = useMutation({ mutationFn: archiveTagFn })
  const unarchiveTagMutation = useMutation({ mutationFn: unarchiveTagFn })
  const deleteTagMutation = useMutation({ mutationFn: deleteTagFn })

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
    tagsWithUsageCountQuery: tagsWithUsageCountQueryOptions({ projectSlug, includeArchived: true }),
  }
}
