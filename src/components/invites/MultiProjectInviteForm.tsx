import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import {
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import type { MembershipAccess } from "@/src/components/admin/memberships/membershipAccessUtils"
import {
  membershipRegionDisplay,
  membershipRegionToggleOptions,
} from "@/src/components/admin/memberships/membershipRegionDisplay"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { Spinner } from "@/src/components/core/components/Spinner"
import { longTitle, shortTitle } from "@/src/components/core/components/text/titles"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import { createInvitesFn } from "@/src/server/invites/invites.functions"
import { inviteEmailStatusQueryOptions } from "@/src/server/invites/invitesQueryOptions"
import { projectsForInviteQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { InviteSchema } from "@/src/shared/invites/schemas"

type Props = {
  onSuccess?: () => void
  projectSlug: string
}

type ProjectRow = {
  id: number
  slug: string
  subTitle: string | null
}

function getProjectTitle(project: ProjectRow) {
  return project.subTitle ?? shortTitle(project.slug)
}

function sortProjectsForInvite(projects: ProjectRow[], projectSlug: string) {
  return [...projects].sort((a, b) => {
    if (a.slug === projectSlug) return -1
    if (b.slug === projectSlug) return 1
    return a.slug.localeCompare(b.slug)
  })
}

export function MultiProjectInviteForm({ onSuccess, projectSlug }: Props) {
  const queryClient = useQueryClient()
  const projectsForInviteQuery = useQuery(projectsForInviteQueryOptions())
  const createMutation = useMutation({ mutationFn: createInvitesFn })
  const projects = sortProjectsForInvite(projectsForInviteQuery.data ?? [], projectSlug)
  const [accessBySlug, setAccessBySlug] = useState<Record<string, MembershipAccess>>({
    [projectSlug]: MembershipRoleEnum.VIEWER,
  })
  const [email, setEmail] = useState("")
  const [debouncedEmail, setDebouncedEmail] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const liveEmail = email.trim()
  const liveEmailIsValid = InviteSchema.shape.email.safeParse(liveEmail).success

  useEffect(
    function debounceInviteEmailStatusLookup() {
      const timeout = window.setTimeout(() => setDebouncedEmail(email.trim()), 300)
      return function clearInviteEmailStatusLookupDebounce() {
        window.clearTimeout(timeout)
      }
    },
    [email],
  )

  const debouncedEmailIsValid = InviteSchema.shape.email.safeParse(debouncedEmail).success
  const statusQuery = useQuery({
    ...inviteEmailStatusQueryOptions({ email: debouncedEmail }),
    enabled: debouncedEmailIsValid,
  })
  const statusLookupPending =
    liveEmailIsValid &&
    (debouncedEmail !== liveEmail ||
      statusQuery.isPending ||
      statusQuery.isFetching ||
      Boolean(statusQuery.error))
  const statusBySlug = new Map(
    statusQuery.data?.projectStates.map((projectState) => [projectState.slug, projectState]) ?? [],
  )
  const filteredProjects = projects.filter((project) => {
    const query = projectFilter.trim().toLocaleLowerCase()
    if (!query) return true
    return (
      project.slug.toLocaleLowerCase().includes(query) ||
      getProjectTitle(project).toLocaleLowerCase().includes(query)
    )
  })
  const selectedProjects = statusLookupPending
    ? []
    : projects.flatMap((project) => {
        const current = statusBySlug.get(project.slug)?.current
        const role = accessBySlug[project.slug] ?? null
        if (current !== undefined && current !== "none") return []
        if (!role) return []
        return [{ projectSlug: project.slug, role }]
      })
  const membershipProjects =
    statusQuery.data?.projectStates.filter(
      (projectState) =>
        projectState.current !== "none" && projectState.current.type === "membership",
    ) ?? []
  const pendingInviteProjects =
    statusQuery.data?.projectStates.filter(
      (projectState) => projectState.current !== "none" && projectState.current.type === "invite",
    ) ?? []

  const handleSubmit = async () => {
    setFormError(null)
    try {
      await createMutation.mutateAsync({
        data: {
          email: liveEmail,
          projects: selectedProjects,
        },
      })
      await queryClient.invalidateQueries({ queryKey: ["invites"] })
      onSuccess?.()
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : String(error))
    }
  }

  if (projectsForInviteQuery.isPending) return <Spinner />

  if (projectsForInviteQuery.error) {
    return (
      <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
        Die Projektliste konnte nicht geladen werden.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
        <label className="block">
          <span className="block text-sm font-medium text-gray-900">E-Mail-Adresse</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-900">Projekte filtern</span>
          <input
            type="search"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.currentTarget.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      {liveEmailIsValid && statusQuery.data?.accountExists && membershipProjects.length === 0 && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Diese E-Mail-Adresse ist bereits im Trassenscout registriert.
        </div>
      )}
      {liveEmailIsValid && statusQuery.error && (
        <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Die E-Mail-Prüfung konnte nicht geladen werden.
        </div>
      )}
      {membershipProjects.length > 0 && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Diese Person ist bereits in einigen deiner Projekte aktiv.
        </div>
      )}
      {pendingInviteProjects.length > 0 && (
        <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Für einige Projekte besteht bereits eine ausstehende Einladung.
        </div>
      )}
      {formError && (
        <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {translateServerError(formError)}
        </div>
      )}

      <div className={adminTableWrapperClassName}>
        <table className={twJoin(adminTableClassName, "table-fixed")}>
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
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
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredProjects.map((project) => {
              const projectTitle = getProjectTitle(project)
              const current = statusBySlug.get(project.slug)?.current
              const locked = current !== undefined && current !== "none"
              const currentAccess = locked ? current.role : (accessBySlug[project.slug] ?? null)

              return (
                <tr key={project.id}>
                  <th
                    scope="row"
                    title={longTitle(project.slug)}
                    className={twJoin(
                      adminTableCellClassName,
                      "text-left font-medium text-gray-900",
                    )}
                  >
                    <span className="block">{projectTitle}</span>
                    {locked && (
                      <span
                        className={twJoin(
                          "mt-1 block text-xs font-normal",
                          current.type === "membership" ? "text-green-700" : "text-red-700",
                        )}
                      >
                        {current.type === "membership"
                          ? `Aktiv: ${roleTranslation[current.role]}`
                          : `Ausstehend: ${roleTranslation[current.role]}`}
                      </span>
                    )}
                  </th>
                  {membershipRegionToggleOptions.map((option) => {
                    const isActive = currentAccess === option.value
                    const optionDisplay = membershipRegionDisplay(option.value, false)
                    const { Icon, label } = option
                    return (
                      <td key={label} className={twJoin(adminTableCellClassName, "text-center")}>
                        <button
                          type="button"
                          disabled={locked || statusLookupPending || createMutation.isPending}
                          aria-label={`${label}: ${projectTitle}`}
                          aria-pressed={isActive}
                          onClick={() =>
                            setAccessBySlug((currentAccessBySlug) => ({
                              ...currentAccessBySlug,
                              [project.slug]: option.value,
                            }))
                          }
                          className={twMerge(
                            "inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-md px-2 py-1.5 ring-1 ring-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60",
                            isActive
                              ? twJoin(
                                  optionDisplay.backgroundClassName,
                                  "text-gray-900 ring-transparent",
                                )
                              : "bg-white text-gray-600 hover:bg-gray-50",
                          )}
                        >
                          <Icon
                            className={twMerge(
                              "size-4 shrink-0",
                              isActive ? optionDisplay.iconClassName : "text-gray-400",
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
      </div>

      <ActionBar
        left={
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={
              !liveEmailIsValid ||
              statusLookupPending ||
              selectedProjects.length === 0 ||
              createMutation.isPending
            }
            onClick={handleSubmit}
          >
            Einladen
          </button>
        }
      />
    </div>
  )
}
