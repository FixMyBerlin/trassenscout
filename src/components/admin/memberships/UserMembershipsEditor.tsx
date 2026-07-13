import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { adminTableWrapperClassName } from "@/src/components/admin/adminListClasses"
import {
  buildAccessByProjectId,
  buildProjectRoles,
  isMembershipAccessDirty,
  type MembershipAccess,
} from "@/src/components/admin/memberships/membershipAccessUtils"
import { MembershipsEditorRow } from "@/src/components/admin/memberships/MembershipsTable"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { saveUserMembershipsFn } from "@/src/server/memberships/memberships.functions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { userWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"

type Props = {
  userId: number
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
  const initialAccessByProjectId = buildAccessByProjectId(projects, user.memberships, isAdmin)

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
    <div className="space-y-6">
      {isAdmin && (
        <p className="text-sm text-gray-600">
          Admin-Nutzer haben automatisch Zugriff auf alle Projekte. Mitgliedschaften können hier
          nicht bearbeitet werden.
        </p>
      )}

      <div className={adminTableWrapperClassName}>
        <MembershipsEditorRow
          user={user}
          projects={projects}
          accessByProjectId={accessByProjectId}
          disabled={isAdmin || saveMutation.isPending}
          onAccessChange={(projectId, access) =>
            setAccessByProjectId((current) => ({ ...current, [projectId]: access }))
          }
        />
      </div>

      {!isAdmin && (
        <p className="text-sm text-gray-600">
          Hinweis: Beim Speichern werden keine E-Mails versendet. Der Nutzer wird aus allen aktiven
          Sitzungen abgemeldet, damit die geänderten Rechte beim nächsten Login greifen.
        </p>
      )}

      {formError && (
        <div role="alert" className="rounded-sm bg-red-50 px-2 py-1 text-red-800">
          <span className="font-mono text-sm leading-tight">{translateServerError(formError)}</span>
        </div>
      )}

      <ActionBar
        left={
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={isAdmin || !isDirty || saveMutation.isPending}
            onClick={handleSave}
          >
            Speichern
          </button>
        }
      />
    </div>
  )
}
