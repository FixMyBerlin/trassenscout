import { getRouteApi } from "@tanstack/react-router"
import {
  useSurveyResponseTagMutations,
  useSurveyResponseTagRouteLinks,
} from "@/src/components/survey-response-tags/useSurveyResponseTagActions"
import {
  TagsManagementTable,
  type TagManagementRow,
} from "@/src/components/tags/TagsManagementTable"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  tags: TagManagementRow[]
}

export const SurveyResponseTagsTable = ({ tags }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { editLink } = useSurveyResponseTagRouteLinks(projectSlug)
  const { archiveTag, unarchiveTag, deleteTag } = useSurveyResponseTagMutations(projectSlug)

  const handleArchive = async (tag: TagManagementRow) => {
    const action = tag.archivedAt ? "reaktivieren" : "archivieren"
    if (!window.confirm(`Tag „${tag.title}" wirklich ${action}?`)) return

    try {
      if (tag.archivedAt) {
        await unarchiveTag(tag.id)
      } else {
        await archiveTag(tag.id)
      }
    } catch {
      alert("Beim Aktualisieren ist ein Fehler aufgetreten.")
    }
  }

  const handleDelete = async (tag: TagManagementRow) => {
    if (tag.usageCount > 0) return
    if (!window.confirm(`Tag „${tag.title}" unwiderruflich löschen?`)) return

    try {
      await deleteTag(tag.id)
    } catch {
      alert("Beim Löschen ist ein Fehler aufgetreten. Eventuell wird das Tag noch verwendet.")
    }
  }

  return (
    <TagsManagementTable
      tags={tags}
      editLink={editLink}
      onArchive={handleArchive}
      onDelete={handleDelete}
    />
  )
}
