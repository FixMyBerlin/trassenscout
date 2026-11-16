import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { setSubsubsectionBookmarkFn } from "@/src/server/subsubsectionBookmarks/subsubsectionBookmarks.functions"
import {
  subsubsectionBookmarkQueryOptions,
  subsubsectionBookmarksQueryKey,
} from "@/src/server/subsubsectionBookmarks/subsubsectionBookmarksQueryOptions"

type Props = {
  projectSlug: string
  subsubsectionId: number
}

export const SubsubsectionBookmarkButton = ({ projectSlug, subsubsectionId }: Props) => {
  const queryClient = useQueryClient()
  const queryOptions = subsubsectionBookmarkQueryOptions({ projectSlug, subsubsectionId })
  const { data } = useQuery(queryOptions)

  const mutation = useMutation({
    mutationFn: setSubsubsectionBookmarkFn,
    onMutate: async ({ data: { bookmarked } }) => {
      await queryClient.cancelQueries({ queryKey: queryOptions.queryKey })
      const previous = queryClient.getQueryData(queryOptions.queryKey)
      queryClient.setQueryData(queryOptions.queryKey, { bookmarked })
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryOptions.queryKey, context?.previous)
      window.alert("Das Lesezeichen konnte nicht gespeichert werden.")
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: subsubsectionBookmarksQueryKey })
    },
  })

  if (!data) return null

  const { bookmarked } = data
  const label = bookmarked ? "Lesezeichen entfernen" : "Lesezeichen setzen"
  const Icon = bookmarked ? BookmarkIconSolid : BookmarkIconOutline

  return (
    <Tooltip content={label} placement="bottom-end">
      <button
        type="button"
        className="flex cursor-pointer items-center rounded-md p-1 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-pressed={bookmarked}
        aria-label="Lesezeichen"
        onClick={() =>
          mutation.mutate({ data: { projectSlug, subsubsectionId, bookmarked: !bookmarked } })
        }
      >
        <Icon
          className={bookmarked ? "size-6 text-blue-500" : "size-6 text-gray-500"}
          aria-hidden="true"
        />
      </button>
    </Tooltip>
  )
}
