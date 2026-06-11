import { useNavigate } from "@tanstack/react-router"
import { clsx } from "clsx"
import { adminTableClassName } from "@/src/components/admin/adminListClasses"
import {
  getMembershipAccess,
  type MembershipAccess,
} from "@/src/components/admin/memberships/membershipAccessUtils"
import { MembershipRegionCell } from "@/src/components/admin/memberships/MembershipRegionCell"
import {
  membershipRegionColumnClassName,
  membershipTableCellYClassName,
  membershipTableHeadClassName,
  membershipUserColumnWidthClassName,
  membershipUserHeaderClassName,
} from "@/src/components/admin/memberships/membershipRegionClasses"
import { membershipRegionDisplay } from "@/src/components/admin/memberships/membershipRegionDisplay"
import { MembershipRegionHeader } from "@/src/components/admin/memberships/MembershipRegionHeader"
import { MembershipRegionToggle } from "@/src/components/admin/memberships/MembershipRegionToggle"
import { MembershipUserCell } from "@/src/components/admin/memberships/MembershipUserCell"

type ProjectLike = {
  id: number
  slug: string
}

type UserLike = {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  memberships: {
    role: "VIEWER" | "EDITOR"
    project: { id: number; slug: string }
  }[]
}

type Props = {
  users: UserLike[]
  projects: ProjectLike[]
}

function MembershipsTableColGroup({ projects }: { projects: ProjectLike[] }) {
  return (
    <colgroup>
      <col className={membershipUserColumnWidthClassName} />
      {projects.map((project) => (
        <col key={project.id} className={membershipRegionColumnClassName} />
      ))}
    </colgroup>
  )
}

export function MembershipsTable({ users, projects }: Props) {
  const navigate = useNavigate()

  return (
    <table className={clsx(adminTableClassName, "table-fixed")}>
      <MembershipsTableColGroup projects={projects} />
      <thead className={membershipTableHeadClassName}>
        <tr>
          <th
            scope="col"
            className={clsx(membershipUserHeaderClassName, membershipTableCellYClassName)}
          >
            User
          </th>
          {projects.map((project) => (
            <MembershipRegionHeader key={project.id} slug={project.slug} />
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {users.map((user) => {
          const isAdmin = user.role === "ADMIN"

          return (
            <tr
              key={user.id}
              className="group cursor-pointer"
              onClick={() =>
                void navigate({
                  to: "/admin/memberships/$userId",
                  params: { userId: String(user.id) },
                })
              }
            >
              <MembershipUserCell user={user} membershipDetailUserId={user.id} />
              {projects.map((project) => (
                <MembershipRegionCell
                  key={project.id}
                  isAdmin={isAdmin}
                  access={getMembershipAccess(user.memberships, project.id, isAdmin)}
                />
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function MembershipsEditorRow({
  user,
  projects,
  accessByProjectId,
  onAccessChange,
  disabled,
}: {
  user: UserLike
  projects: ProjectLike[]
  accessByProjectId: Record<number, MembershipAccess>
  onAccessChange: (projectId: number, access: MembershipAccess) => void
  disabled?: boolean
}) {
  const isAdmin = user.role === "ADMIN"

  return (
    <table className={clsx(adminTableClassName, "table-fixed")}>
      <MembershipsTableColGroup projects={projects} />
      <thead className={membershipTableHeadClassName}>
        <tr>
          <th
            scope="col"
            className={clsx(membershipUserHeaderClassName, membershipTableCellYClassName)}
          >
            User
          </th>
          {projects.map((project) => (
            <MembershipRegionHeader key={project.id} slug={project.slug} />
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        <tr className="group">
          <MembershipUserCell user={user} />
          {projects.map((project) => {
            const access = accessByProjectId[project.id] ?? null

            return (
              <td
                key={project.id}
                className={clsx(
                  "border-l border-gray-100 px-2 text-center align-middle transition-colors",
                  membershipTableCellYClassName,
                  membershipRegionDisplay(access, isAdmin).backgroundClassName,
                )}
              >
                <MembershipRegionToggle
                  value={access}
                  onChange={(nextAccess) => onAccessChange(project.id, nextAccess)}
                  disabled={disabled}
                />
              </td>
            )
          })}
        </tr>
      </tbody>
    </table>
  )
}
