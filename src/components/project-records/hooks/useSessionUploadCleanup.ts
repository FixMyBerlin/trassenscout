import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { invalidateUploadLists } from "@/src/components/uploads/uploadQueryCache"
import { deleteOrphanUploadFn } from "@/src/server/uploads/uploads.functions"

type Props = {
  projectSlug: string
}

export function useSessionUploadCleanup({ projectSlug }: Props) {
  const queryClient = useQueryClient()
  const sessionUploadIdsRef = useRef(new Set<number>())
  const contextRef = useRef({ projectSlug, queryClient })
  contextRef.current = { projectSlug, queryClient }

  useEffect(function cleanupSessionUploadsOnUnmount() {
    const sessionUploadIds = sessionUploadIdsRef
    const context = contextRef

    return function deleteTrackedSessionUploads() {
      const ids = [...sessionUploadIds.current]
      if (ids.length === 0) return

      sessionUploadIds.current.clear()
      const { projectSlug, queryClient } = context.current

      void Promise.allSettled(
        ids.map((id) => deleteOrphanUploadFn({ data: { projectSlug, id } })),
      ).then(() => invalidateUploadLists(queryClient, projectSlug))
    }
  }, [])

  return {
    trackSessionUploads(ids: number[]) {
      for (const id of ids) {
        sessionUploadIdsRef.current.add(id)
      }
    },
  }
}
