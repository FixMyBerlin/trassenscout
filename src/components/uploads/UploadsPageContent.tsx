import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeaderSearchFilter } from "@/src/components/core/components/PageHeader/PageHeaderSearchFilter"
import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { TagFilterCombobox } from "@/src/components/tags/TagFilterCombobox"
import { useTagFilterOptions } from "@/src/components/tags/useTagFilterOptions"
import { UploadsPageUploadSection } from "@/src/components/uploads/uploads-page/UploadsPageUploadSection"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { useFilteredUploads } from "@/src/components/uploads/useFilteredUploads"
import { useUploadFilters } from "@/src/components/uploads/useUploadFilters"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import type { UploadWithRelations } from "./uploadTypes"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

function isSurveyOnlyUpload(upload: UploadWithRelations) {
  return (
    upload.surveyResponseId !== null &&
    upload.projectRecordEmailId === null &&
    upload.projectRecords.length === 0 &&
    upload.subsubsections.length === 0 &&
    upload.acquisitionAreas.length === 0
  )
}

export const UploadsPageContent = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: uploads } = useSuspenseQuery(uploadsQueryOptions({ projectSlug }))
  const { filter, setFilter } = useUploadFilters()
  const visibleUploads = uploads.filter((upload) => !isSurveyOnlyUpload(upload))
  const filteredUploads = useFilteredUploads(visibleUploads)
  const tagOptions = useTagFilterOptions(visibleUploads, projectSlug)
  const resetFilter = () => void setFilter(undefined)

  return (
    <>
      <div className="flex flex-col">
        <div className={pageContentPaddingClassName}>
          <IfUserCanEdit>
            <UploadsPageUploadSection projectSlug={projectSlug} />
          </IfUserCanEdit>
          <div className="mt-6">
            <PageHeaderSearchFilter
              value={filter?.searchterm ?? ""}
              onChange={(searchterm) => void setFilter({ searchterm })}
              onReset={resetFilter}
              hasFilter={Boolean(filter?.searchterm || filter?.tag)}
              placeholder="Dateinamen, Titel und Inhalte durchsuchen"
            >
              <TagFilterCombobox
                tags={tagOptions}
                value={filter?.tag}
                onChange={(tag) => void setFilter({ tag })}
              />
            </PageHeaderSearchFilter>
          </div>
          <ZeroCase visible={visibleUploads.length} name="Dokumente" verb="hochgeladen" />
        </div>

        {visibleUploads.length === 0 ? null : filteredUploads.length === 0 ? (
          <FilteredZeroCase name="Dokumente" onReset={resetFilter} />
        ) : (
          <UploadTable
            projectSlug={projectSlug}
            withAction
            withRelations
            uploads={filteredUploads}
            onTagClick={(tag) => void setFilter({ tag })}
          />
        )}
      </div>

      <SuperAdminBox>
        <strong>Hinweis:</strong> Uploads, die ausschließlich mit Eingaben verknüpft sind, werden in
        dieser Übersicht nicht angezeigt. Diese Uploads sind nur über den jeweiligen Eingabe
        zugänglich.
      </SuperAdminBox>
    </>
  )
}
