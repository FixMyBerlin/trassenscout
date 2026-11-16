import {
  SubsubsectionTable,
  type SubsubsectionTableRow,
} from "@/src/components/abschnitte/SubsubsectionTable"
import { Link } from "@/src/components/core/components/links/Link"
import { stepContentClassName } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { PageHeaderInfo } from "@/src/components/core/components/PageHeader/PageHeaderInfo"
import { PageHeaderLayout } from "@/src/components/core/components/PageHeader/PageHeaderLayout"
import { PageHeaderRowActions } from "@/src/components/core/components/PageHeader/PageHeaderRowActions"
import { BookmarksInfo } from "@/src/components/dashboard/BookmarksInfo"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import { DASHBOARD_ALL_PROJECTS } from "@/src/shared/dashboard/searchSchemas"

type Props = {
  rows: SubsubsectionTableRow[]
  showProject: boolean
}

export const DashboardBookmarksAside = ({ rows, showProject }: Props) => {
  return (
    <>
      <PageHeaderLayout
        row1={{
          left: <h2 className={stepContentClassName}>Meine Maßnahmen</h2>,
          right: (
            <PageHeaderRowActions>
              <PageHeaderInfo>
                <BookmarksInfo />
              </PageHeaderInfo>
            </PageHeaderRowActions>
          ),
        }}
      />
      {/* From lg the map beside the aside has a right border; the aside clips the table's left border behind it. */}
      <div className="lg:-ml-px">
        <SubsubsectionTable rows={rows} showProject={showProject} />
      </div>
      <div className="p-4">
        <Link
          to="/dashboard/bookmarks"
          search={(prev: Record<string, string | undefined>) =>
            mergeDashboardSearch(prev, { projectSlug: DASHBOARD_ALL_PROJECTS })
          }
          button
        >
          Alle Maßnahmen mit Lesezeichen anzeigen
        </Link>
      </div>
    </>
  )
}
