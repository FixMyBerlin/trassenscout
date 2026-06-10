import {
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import {
  AdminTableEditLink,
  AdminTableExternalLink,
} from "@/src/components/admin/AdminTableActions"
import { AdminEnableProjectExportApi } from "@/src/components/admin/projects/[projectSlug]/subsections/AdminEnableProjectExportApi"
import { AdminEnableProjectAi } from "@/src/components/admin/projects/AdminEnableProjectAi"
import { AdminEnableProjectLandAcquisition } from "@/src/components/admin/projects/AdminEnableProjectLandAcquisition"
import { AdminEnableProjectShowLogEntries } from "@/src/components/admin/projects/AdminEnableProjectShowLogEntries"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { longTitle } from "@/src/components/core/components/text/titles"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import type { AdminProjectWithCounts } from "@/src/server/projects/types"

type Props = {
  projects: AdminProjectWithCounts[]
}

const formatPaCount = (count: number) => `${count} ${count === 1 ? "PA" : "PAs"}`

export const AdminProjectsTable = ({ projects }: Props) => {
  if (!projects.length) {
    return <p className="text-sm text-gray-600">Noch keine Projekte vorhanden.</p>
  }

  return (
    <div className={adminTableWrapperClassName}>
      <table className={adminTableClassName}>
        <thead className="bg-gray-50">
          <tr>
            <th className={adminTableHeaderClassName}>Projekt</th>
            <th className={adminTableHeaderClassName}>Planungsabschnitte</th>
            <th className={adminTableHeaderClassName}>Export-API</th>
            <th className={adminTableHeaderClassName}>KI</th>
            <th className={adminTableHeaderClassName}>Grunderwerb</th>
            <th className={adminTableHeaderClassName}>Log-Einträge</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id}>
              <td className={adminTableCellClassName}>
                <Tooltip content={longTitle(project.slug)}>
                  <span className="inline-flex">
                    <AdminTableExternalLink href={`/${project.slug}`}>
                      {shortTitle(project.slug)}
                    </AdminTableExternalLink>
                  </span>
                </Tooltip>
              </td>
              <td className={adminTableCellClassName}>
                <Tooltip content="Planungsabschnitte verwalten">
                  <span className="inline-flex">
                    <AdminTableEditLink to={`/admin/projects/${project.slug}/subsections`}>
                      {formatPaCount(project.subsectionCount)}
                    </AdminTableEditLink>
                  </span>
                </Tooltip>
              </td>
              <td className={adminTableCellClassName}>
                <AdminEnableProjectExportApi
                  slug={project.slug}
                  exportEnabled={project.exportEnabled}
                />
              </td>
              <td className={adminTableCellClassName}>
                <AdminEnableProjectAi slug={project.slug} aiEnabled={project.aiEnabled} />
              </td>
              <td className={adminTableCellClassName}>
                <AdminEnableProjectLandAcquisition
                  slug={project.slug}
                  landAcquisitionModuleEnabled={project.landAcquisitionModuleEnabled}
                />
              </td>
              <td className={adminTableCellClassName}>
                <AdminEnableProjectShowLogEntries
                  slug={project.slug}
                  showLogEntries={project.showLogEntries}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
