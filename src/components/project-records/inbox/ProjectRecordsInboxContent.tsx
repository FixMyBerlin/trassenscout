import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import {
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableDateTime } from "@/src/components/core/components/Table/TableDateTime"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { useProjectRecordsListHeader } from "@/src/components/project-records/useProjectRecordsListHeader"
import { formatEmailAddresses } from "@/src/components/project-records/utils/formatEmailAddresses"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import { projectRecordEmailInboxQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailInboxQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const ProjectRecordsInboxContent = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { breadcrumb, tabs } = useProjectRecordsListHeader()
  const { buildModalHref } = useProjectModalNavigation()
  const { data: emails } = useSuspenseQuery(projectRecordEmailInboxQueryOptions({ projectSlug }))

  return (
    <>
      <PageHeader
        breadcrumb={breadcrumb}
        info="Eingegangene E-Mails, die noch nicht verarbeitet sind. Wählen Sie eine E-Mail, eine Protokollvorlage und starten Sie die KI-Verarbeitung."
        tabs={tabs}
      />
      {emails.length === 0 ? (
        <div className={pageContentPaddingClassName}>
          <ZeroCase
            visible={emails.length}
            text="Im Posteingang liegen keine unverarbeiteten E-Mails."
          />
        </div>
      ) : (
        <TableWrapper>
          <table className={twJoin(tableClassName, "w-full")}>
            <thead>
              <tr className={tableHeadRowClassName}>
                <th scope="col" className={tableHeadCellClassName}>
                  Absender
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Datum
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Betreff
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Anhänge
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {emails.map((email) => (
                <tr key={email.id} className={tableRowClassName}>
                  <td className={tableCellClassName}>
                    {email.from ? formatEmailAddresses(email.from) : "Unbekannt"}
                  </td>
                  <td className={tableCellClassName}>
                    <TableDateTime value={email.date ?? email.createdAt} />
                  </td>
                  <td className={tableCellClassName}>
                    <Link
                      to={buildModalHref({ modalProjectRecordEmailId: email.id })}
                      resetScroll={false}
                    >
                      {email.subject || "(kein Betreff)"}
                    </Link>
                  </td>
                  <td className={tableCellClassName}>{email.uploads.length || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      )}
    </>
  )
}
