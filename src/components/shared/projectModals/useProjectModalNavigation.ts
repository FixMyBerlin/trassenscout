import { useLocation, useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { useProjectModalSlug } from "@/src/components/shared/projectModals/useProjectModalSlug"
import type { ProjectModalPreview } from "@/src/shared/projectModals/historyState"
import { clearAllProjectModalSearch } from "@/src/shared/projectModals/searchSchemas"
import type { LoggedInProjectModalSearch } from "@/src/shared/projectModals/searchSchemas"

type ModalSearchPatch = Partial<LoggedInProjectModalSearch>

type UpdateModalOptions = {
  replace?: boolean
  preview?: ProjectModalPreview
}

function stringifyModalSearchPatch(searchPatch: ModalSearchPatch) {
  return {
    ...searchPatch,
    modalContactId:
      searchPatch.modalContactId === undefined ? undefined : String(searchPatch.modalContactId),
    modalProjectRecordId:
      searchPatch.modalProjectRecordId === undefined
        ? undefined
        : String(searchPatch.modalProjectRecordId),
    modalUploadId:
      searchPatch.modalUploadId === undefined ? undefined : String(searchPatch.modalUploadId),
  }
}

export function useProjectModalNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const router = useRouter()
  const activeSearch = useSearch({
    strict: false,
    shouldThrow: false,
  })
  const routeProjectSlug = useTryRouteParam("projectSlug")
  const projectSlug = useProjectModalSlug()
  const currentSearch = activeSearch ?? {}
  const backgroundSearch = clearAllProjectModalSearch(currentSearch)
  const modalProjectSlug = routeProjectSlug ? undefined : projectSlug

  const withProjectScope = (searchPatch: ModalSearchPatch) =>
    stringifyModalSearchPatch({
      ...searchPatch,
      modalProjectSlug: searchPatch.modalProjectSlug ?? modalProjectSlug,
    })

  const buildModalHref = (searchPatch: ModalSearchPatch) =>
    router.buildLocation({
      to: location.pathname,
      search: {
        ...backgroundSearch,
        ...withProjectScope(searchPatch),
      },
    }).href

  const backgroundHref = router.buildLocation({
    to: location.pathname,
    search: backgroundSearch,
  }).href

  const updateModalSearch = (searchPatch?: ModalSearchPatch, options?: UpdateModalOptions) =>
    navigate({
      to: location.pathname,
      search: searchPatch
        ? {
            ...backgroundSearch,
            ...withProjectScope(searchPatch),
          }
        : backgroundSearch,
      state: (previousState) => ({
        ...previousState,
        projectModalPreview: options?.preview,
      }),
      replace: options?.replace,
      resetScroll: false,
    })

  return {
    backgroundHref,
    backgroundSearch,
    buildModalHref,
    updateModalSearch,
  }
}
