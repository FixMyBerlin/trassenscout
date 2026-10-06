import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ExternalShareSectionRow } from "@/src/components/externalShare/ExternalShareSectionRow"
import { ExternalShareUploadsTable } from "@/src/components/externalShare/ExternalShareUploadsTable"
import {
  externalShareGeojsonUrl,
  externalShareUploadDownloadUrl,
  externalShareUploadUrl,
} from "@/src/shared/externalShare/externalShareUrls"

const routeApi = getRouteApi("/share/$token")

export function PagePublicExternalShare() {
  const { token } = routeApi.useParams()
  const share = routeApi.useLoaderData()
  const projectName = [shortTitle(share.projectSlug), share.projectSubTitle]
    .filter(Boolean)
    .join(" – ")

  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h1 className="text-base font-semibold text-gray-900">Freigegebene Projektunterlagen</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Über diese geteilte Ansicht stellt Ihnen die Projektleitung aktuelle Dokumente und
          Maßnahmen zum Projekt {projectName} im Trassenscout bereit. Solange die Freigabe aktiv
          ist, greifen Sie so stets auf den aktuellsten Stand der Daten zu.
        </p>
      </div>
      <ExternalShareSectionRow
        title="Maßnahmen"
        count={share.subsubsectionCount}
        action={
          <PageHeaderToolbarLink
            href={externalShareGeojsonUrl(token)}
            label="Alle Maßnahmen als GeoJSON herunterladen"
          >
            GeoJSON
          </PageHeaderToolbarLink>
        }
      />
      <ExternalShareSectionRow title="Dokumente" count={share.uploads.length} />
      <ExternalShareUploadsTable
        uploads={share.uploads}
        fileUrl={(id) => externalShareUploadUrl(token, id)}
        downloadUrl={(id) => externalShareUploadDownloadUrl(token, id)}
        renderAction={(upload) => (
          <Link icon="download" href={externalShareUploadDownloadUrl(token, upload.id)}>
            Download
          </Link>
        )}
      />
    </>
  )
}
