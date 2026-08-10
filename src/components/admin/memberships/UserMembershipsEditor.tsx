import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeadRowClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
import {
  buildAccessByProjectId,
  buildProjectRoles,
  isMembershipAccessDirty,
  type MembershipAccess,
} from "@/src/components/admin/memberships/membershipAccessUtils"
import { membershipRegionToggleOptions } from "@/src/components/admin/memberships/membershipRegionDisplay"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { longTitle, shortTitle } from "@/src/components/core/components/text/titles"
import { saveUserMembershipsFn } from "@/src/server/memberships/memberships.functions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { userWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"

type Props = {
  userId: number
}

type ProjectLike = {
  id: number
  slug: string
}

function UserMembershipsProjectAccessTable({
  projects,
  accessByProjectId,
  disabled,
  onAccessChange,
}: {
  projects: ProjectLike[]
  accessByProjectId: Record<number, MembershipAccess>
  disabled?: boolean
  onAccessChange: (projectId: number, access: MembershipAccess) => void
}) {
  return (
    <table className={twJoin(adminTableClassName, "table-fixed")}>
      <colgroup>
        <col className="w-[40%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead>
        <tr className={adminTableHeadRowClassName}>
          <th scope="col" className={adminTableHeaderClassName}>
            Projekt
          </th>
          {membershipRegionToggleOptions.map((option) => {
            const { Icon, label } = option

            return (
              <th
                key={label}
                scope="col"
                className={twJoin(adminTableHeaderClassName, "text-center")}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon className="size-4 shrink-0 text-gray-500" aria-hidden />
                  {label}
                </span>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody className={adminTableBodyClassName}>
        {projects.map((project) => {
          const currentAccess = accessByProjectId[project.id] ?? null
          const projectTitle = shortTitle(project.slug)

          return (
            <tr key={project.id} className={adminTableRowClassName}>
              <th
                scope="row"
                title={longTitle(project.slug)}
                className={twJoin(adminTableCellClassName, "text-left font-medium text-gray-900")}
              >
                {projectTitle}
              </th>
              {membershipRegionToggleOptions.map((option) => {
                const isActive = currentAccess === option.value
                const { Icon, label } = option

                return (
                  <td key={label} className={twJoin(adminTableCellClassName, "text-center")}>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={`${label}: ${projectTitle}`}
                      aria-pressed={isActive}
                      onClick={() => onAccessChange(project.id, option.value)}
                      className={twMerge(
                        "inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-md px-2 py-1.5 ring-1 ring-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60",
                        isActive
                          ? twJoin(option.backgroundClassName, "text-gray-900 ring-transparent")
                          : "bg-white text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      <Icon
                        className={twMerge(
                          "size-4 shrink-0",
                          isActive ? option.iconClassName : "text-gray-400",
                        )}
                        aria-hidden
                      />
                    </button>
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function UserMembershipsEditor({ userId }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useSuspenseQuery(userWithMembershipsQueryOptions(userId))
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())
  const saveMutation = useMutation({ mutationFn: saveUserMembershipsFn })
  const [formError, setFormError] = useState<string | null>(null)

  const projects = projectsResult.projects
  const isAdmin = user.role === "ADMIN"
  const initialAccessByProjectId = buildAccessByProjectId(projects, user.memberships)

  const [accessByProjectId, setAccessByProjectId] =
    useState<Record<number, MembershipAccess>>(initialAccessByProjectId)

  const isDirty = isMembershipAccessDirty(projects, accessByProjectId, initialAccessByProjectId)

  const handleSave = async () => {
    setFormError(null)

    try {
      await saveMutation.mutateAsync({
        data: {
          userId,
          projectRoles: buildProjectRoles(projects, accessByProjectId),
        },
      })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userWithMembershipsQueryOptions(userId).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: ["users", "withMemberships"] }),
      ])
      navigate({ to: "/admin/memberships" })
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <>
      <section aria-labelledby="membership-project-access-heading" className="space-y-3">
        <div className="space-y-4 px-4">
          <h2
            id="membership-project-access-heading"
            className="text-lg font-semibold text-gray-700"
          >
            Projektrechte
          </h2>

          {isAdmin && (
            <div className="[&>div]:mb-0">
              <Notice type="info" title="Admin-Nutzer haben automatisch Zugriff auf alle Projekte.">
                Explizite Mitgliedschaften sind optional und hier nicht erforderlich.
              </Notice>
            </div>
          )}
        </div>

        <TableWrapper withTopBorder>
          <UserMembershipsProjectAccessTable
            projects={projects}
            accessByProjectId={accessByProjectId}
            disabled={saveMutation.isPending}
            onAccessChange={(projectId, access) =>
              setAccessByProjectId((current) => ({ ...current, [projectId]: access }))
            }
          />
        </TableWrapper>

        <div className="space-y-4 px-4">
          <p className="text-sm text-gray-600">
            Hinweis: Beim Speichern werden keine E-Mails versendet. Der Nutzer wird aus allen
            aktiven Sitzungen abgemeldet, damit die geänderten Rechte beim nächsten Login greifen.
          </p>

          {formError && (
            <div role="alert" className="rounded-sm bg-red-50 px-2 py-1 text-red-800">
              <span className="font-mono text-sm leading-tight">
                {translateServerError(formError)}
              </span>
            </div>
          )}
        </div>
      </section>

      <ActionBar
        left={
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={!isDirty || saveMutation.isPending}
            onClick={handleSave}
          >
            Speichern
          </button>
        }
      />
    </>
  )
}
