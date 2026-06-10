import { useMutation } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import {
  createLookupRowFn,
  deleteLookupRowFn,
  updateLookupRowFn,
} from "@/src/server/adminLookupTables/adminLookupTables.functions"
import type { LookupTable } from "@/src/server/adminLookupTables/lookupTableConfig"

export type LookupRowListLink = {
  to: string
  params: Record<string, string>
  search?: Record<string, string | undefined>
}

export function useLookupRowMutations({
  table,
  projectSlug,
  listNavigateOptions,
  invalidate,
}: {
  table: LookupTable
  projectSlug: string
  listNavigateOptions: LookupRowListLink & { replace?: true }
  invalidate: () => void
}) {
  const navigate = useNavigate()
  const router = useRouter()
  const listLink: LookupRowListLink = {
    to: listNavigateOptions.to,
    params: listNavigateOptions.params,
    search: listNavigateOptions.search,
  }
  const listHref = router.buildLocation(listLink as never).href

  const createMutation = useMutation({ mutationFn: createLookupRowFn })
  const updateMutation = useMutation({ mutationFn: updateLookupRowFn })
  const deleteMutation = useMutation({ mutationFn: deleteLookupRowFn })

  const navigateToList = async () => {
    await navigate(listNavigateOptions as never)
    if (window.location.pathname !== router.buildLocation(listLink as never).pathname) {
      window.location.assign(listHref)
    }
  }

  const createRow = async (data: unknown) => {
    await createLookupRowFn({ data: { projectSlug, table, data } })
    invalidate()
    await navigateToList()
  }

  const updateRow = async (id: number, data: unknown) => {
    await updateLookupRowFn({ data: { projectSlug, table, id, data } })
    invalidate()
    await navigate(listNavigateOptions as never)
  }

  const deleteRow = async (id: number) => {
    await deleteLookupRowFn({ data: { projectSlug, table, id } })
    invalidate()
    await navigate(listNavigateOptions as never)
  }

  return {
    createRow,
    updateRow,
    deleteRow,
    listLink,
    listHref,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
