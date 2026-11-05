import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getAssigneeItems } from "@/src/components/project-records/utils/sortAssignees"
import type { UserSelectOptions } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { assigneeRankingQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

type Props = {
  projectSlug: string
  users: UserSelectOptions
  subsubsectionIds: (number | null)[]
  acquisitionAreaIds: (number | null)[]
}

export const useAssignedToItems = ({
  projectSlug,
  users,
  subsubsectionIds,
  acquisitionAreaIds,
}: Props) => {
  const { data: ranking } = useQuery({
    ...assigneeRankingQueryOptions({
      projectSlug,
      subsubsectionIds: subsubsectionIds.filter((id) => id != null),
      acquisitionAreaIds: acquisitionAreaIds.filter((id) => id != null),
    }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return getAssigneeItems(users, ranking)
}
