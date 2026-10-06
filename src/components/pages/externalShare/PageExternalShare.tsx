import { XMarkIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { ExternalShareLinkActions } from "@/src/components/externalShare/ExternalShareLinkActions"
import { ExternalShareSectionRow } from "@/src/components/externalShare/ExternalShareSectionRow"
import { ExternalShareUploadsTable } from "@/src/components/externalShare/ExternalShareUploadsTable"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { uploadDownloadUrl, uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { removeUploadFromExternalShareFn } from "@/src/server/externalShare/externalShare.functions"
import { externalShareQueryOptions } from "@/src/server/externalShare/externalShareQueryOptions"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import { externalShareGeojsonUrl } from "@/src/shared/externalShare/externalShareUrls"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/external-share/")

const info =
  "Über den Geheimlink sehen externe Personen ohne Konto alle Maßnahmen dieses Projekts (GeoJSON mit allen Feldern) und die hier gelisteten Dokumente. Dokumente geben Sie unter „Dokument bearbeiten“ frei. Jede Person mit dem Link hat Zugriff; gerät er in falsche Hände, kann ein Admin ihn erneuern."

export function PageExternalShare() {
  const { projectSlug } = routeApi.useParams()
  const queryClient = useQueryClient()
  const { data: share } = useSuspenseQuery(externalShareQueryOptions({ projectSlug }))
  const removeMutation = useMutation({ mutationFn: removeUploadFromExternalShareFn })

  const removeUpload = async (id: number) => {
    await removeMutation.mutateAsync({ data: { projectSlug, id } })
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: externalShareQueryOptions({ projectSlug }).queryKey,
      }),
      queryClient.invalidateQueries({ queryKey: uploadsQueryOptions({ projectSlug }).queryKey }),
    ])
  }

  return (
    <>
      <PageHeader
        title="Externe Freigabe"
        titleVisuallyHidden
        breadcrumb={<ProjectPageBreadcrumb section="Externe Freigabe" />}
        info={info}
        action={<ExternalShareLinkActions projectSlug={projectSlug} token={share.token} />}
      />
      <ExternalShareSectionRow
        title="Maßnahmen"
        count={share.subsubsectionCount}
        action={
          share.token && (
            <PageHeaderToolbarLink
              href={externalShareGeojsonUrl(share.token)}
              label="Alle Maßnahmen als GeoJSON herunterladen"
            >
              GeoJSON
            </PageHeaderToolbarLink>
          )
        }
      />
      <ExternalShareSectionRow title="Freigegebene Dokumente" count={share.uploads.length} />
      <ExternalShareUploadsTable
        uploads={share.uploads}
        fileUrl={(id) => uploadUrl({ id }, projectSlug)}
        downloadUrl={(id) => uploadDownloadUrl({ id }, projectSlug)}
        renderAction={(upload) => (
          <button
            type="button"
            onClick={() => void removeUpload(upload.id)}
            disabled={removeMutation.isPending}
            className={twJoin(linkStyles, "inline-flex items-center gap-1")}
          >
            <XMarkIcon className="size-4" aria-hidden />
            Aus Freigabe entfernen
          </button>
        )}
      />
    </>
  )
}
