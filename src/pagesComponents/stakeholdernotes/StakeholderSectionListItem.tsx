import { Disclosure } from "@/src/core/components/Disclosure"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Link } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { Routes, useRouterQuery } from "@blitzjs/next"
import { Stakeholdernote } from "@prisma/client"
import { useRouter } from "next/router"
import { StakeholderSectionListItemStatus } from "./StakeholderSectionListItemStatus"

type Props = {
  stakeholderNote: Stakeholdernote
}

export const StakeholderSectionListItem = ({ stakeholderNote }: Props) => {
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()

  const router = useRouter()
  const handleOpen = () => {
    void router.push(
      { query: { ...router.query, stakeholderDetails: String(stakeholderNote.id) } },
      undefined,
      { scroll: false },
    )
  }
  const handleClose = () => {
    const { stakeholderDetails: _, ...restQuery } = router.query
    void router.push({ query: restQuery }, undefined, { scroll: false })
  }

  // Open Disclored for object ID `stakeholderDetails`
  const params = useRouterQuery()
  const paramsStakeholderDetails = parseInt(String(params.stakeholderDetails))
  const open = stakeholderNote.id === paramsStakeholderDetails

  return (
    <Disclosure
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      classNameButton="py-4 text-left text-sm text-gray-900 hover:bg-gray-50"
      classNamePanel="pb-3"
      button={
        <div className="flex">
          <div className="w-52 flex-none pb-2 pl-4 pr-3 pt-3 sm:w-64 sm:pl-6">
            <StakeholderSectionListItemStatus status={stakeholderNote.status} />
          </div>
          <div className="flex grow items-center px-3 pb-2 pt-3 font-medium text-blue-500">
            <strong>{stakeholderNote.title}</strong>
          </div>
        </div>
      }
    >
      <div className="ml-3 px-3 pb-2 pt-6 sm:ml-64">
        {stakeholderNote.statusText ? (
          <Markdown className="prose-sm mt-3" markdown={stakeholderNote.statusText} />
        ) : (
          <p className="text-gray-300">Für diesen Termin liegen keine Details vor.</p>
        )}
        <p className="mt-6 italic">
          Letzte Aktualisierung: {stakeholderNote.updatedAt.toLocaleDateString()}
        </p>
        <IfUserCanEdit>
          <p className="mt-6">
            <Link
              icon="edit"
              href={Routes.EditStakeholdernotePage({
                projectSlug,
                subsectionSlug: subsectionSlug!,
                stakeholdernoteId: stakeholderNote.id,
              })}
            >
              Bearbeiten
            </Link>
          </p>
        </IfUserCanEdit>
      </div>
    </Disclosure>
  )
}
