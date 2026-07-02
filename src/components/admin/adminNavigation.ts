import {
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { linkOptions, type useMatchRoute } from "@tanstack/react-router"
import type { ComponentType, SVGProps } from "react"
import type { FileRouteTypes } from "@/src/routeTree.gen"
import type { AdminNavCounts } from "@/src/server/admin/types"

export type AdminNavCountKey = keyof AdminNavCounts

export type AdminNavTo = FileRouteTypes["to"]

export type AdminNavLink = {
  to: AdminNavTo
  params?: Record<string, string>
  /** Only needed when fuzzy matching would be wrong — e.g. `/admin` vs `/admin/projects`. */
  activeOptions?: { exact: true }
}

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

export type AdminNavChild = {
  name: string
  link?: AdminNavLink
  /** Opens outside the admin shell in a new tab. */
  external?: true
  countKey?: AdminNavCountKey
  children?: AdminNavChild[]
}

export type AdminNavItem = {
  name: string
  link?: AdminNavLink
  /** Opens outside the admin shell in a new tab. */
  external?: true
  icon?: HeroIcon
  countKey?: AdminNavCountKey
  children?: AdminNavChild[]
}

function projectNavLink(to: AdminNavTo, projectSlug: string) {
  return { to, params: { projectSlug } } satisfies AdminNavLink
}

/** Typed TanStack Router link options for admin sidebar items. */
export function adminNavLinkOptions(link: AdminNavLink) {
  return linkOptions({
    to: link.to,
    params: link.params,
    activeOptions: link.activeOptions,
  })
}

type MatchRoute = ReturnType<typeof useMatchRoute>

function isAdminNavLinkActive(matchRoute: MatchRoute, link: AdminNavLink) {
  return !!matchRoute({
    to: link.to,
    params: link.params,
    fuzzy: !link.activeOptions?.exact,
  })
}

/** Whether a nav group should render open — any descendant route is active. */
export function isAdminNavItemActive(
  matchRoute: MatchRoute,
  item: AdminNavItem | AdminNavChild,
): boolean {
  if (item.link && isAdminNavLinkActive(matchRoute, item.link)) {
    return true
  }

  return item.children?.some((child) => isAdminNavItemActive(matchRoute, child)) ?? false
}

export function buildAdminProjectNavigation(projectSlug: string) {
  return [
    {
      name: "Projekt bearbeiten",
      link: projectNavLink("/$projectSlug/edit", projectSlug),
      external: true,
    },
    {
      name: "Planungsabschnitte",
      link: projectNavLink("/admin/projects/$projectSlug/subsections", projectSlug),
    },
    {
      name: "Protokolleinträge",
      link: projectNavLink("/$projectSlug/project-records", projectSlug),
      external: true,
    },
    {
      name: "Beteiligungen",
      link: projectNavLink("/$projectSlug/surveys", projectSlug),
      external: true,
    },
    {
      name: "Ausbaustandard",
      link: projectNavLink("/$projectSlug/quality-levels", projectSlug),
      external: true,
    },
    {
      name: "Baulastträger",
      link: projectNavLink("/$projectSlug/operators", projectSlug),
      external: true,
    },
    {
      name: "Netzstufe",
      link: projectNavLink("/$projectSlug/network-hierarchy", projectSlug),
      external: true,
    },
    {
      name: "Status",
      link: projectNavLink("/$projectSlug/subsection-status", projectSlug),
      external: true,
    },
    {
      name: "Status",
      link: projectNavLink("/$projectSlug/subsubsection-status", projectSlug),
      external: true,
    },
    {
      name: "Status",
      link: projectNavLink("/$projectSlug/acquisition-area-status", projectSlug),
      external: true,
    },
    {
      name: "Infrastruktur",
      link: projectNavLink("/$projectSlug/subsubsection-infra", projectSlug),
      external: true,
    },
    {
      name: "Besonderheit",
      link: projectNavLink("/$projectSlug/subsubsection-special", projectSlug),
      external: true,
    },
    {
      name: "Aufgabe",
      link: projectNavLink("/$projectSlug/subsubsection-task", projectSlug),
      external: true,
    },
    {
      name: "Infrastrukturtyp",
      link: projectNavLink("/$projectSlug/subsubsection-infrastructure-type", projectSlug),
      external: true,
    },
  ] satisfies AdminNavChild[]
}

export function buildAdminNavigation() {
  return [
    { name: "Dashboard", link: { to: "/dashboard" }, icon: HomeIcon, external: true },
    {
      name: "Inbox",
      icon: InboxIcon,
      children: [
        {
          name: "Protokoll-Emails",
          link: { to: "/admin/project-record-emails" },
          countKey: "unprocessedEmails",
        },
        {
          name: "Protokolleinträge (Review)",
          link: { to: "/admin/project-records" },
          countKey: "projectRecordsReview",
        },
      ],
    },
    {
      name: "Alle Projekte",
      link: { to: "/admin/projects" },
      icon: FolderIcon,
      countKey: "projects",
    },
    {
      name: "Nutzer & Rechte",
      link: { to: "/admin/memberships" },
      icon: UsersIcon,
      countKey: "users",
    },
    {
      name: "System",
      icon: Cog6ToothIcon,
      children: [
        { name: "LogEntries", link: { to: "/admin/logEntries" }, countKey: "logEntries" },
        {
          name: "E-Mail-Templates",
          link: { to: "/admin/email-templates" },
          countKey: "emailTemplates",
        },
        {
          name: "Auswertungen-Seite",
          link: { to: "/admin/evaluations/edit" },
        },
        {
          name: "Support-Dokumente",
          link: { to: "/admin/support-documents" },
          countKey: "supportDocuments",
        },
        {
          name: "Vorlagen Protokoll",
          link: { to: "/admin/project-record-templates" },
          countKey: "projectRecordTemplates",
        },
      ],
    },
  ] satisfies AdminNavItem[]
}

export function formatAdminNavCount(count: number) {
  if (count > 99) return "99+"
  return String(count)
}

export function getAdminNavCount(counts: AdminNavCounts, countKey: AdminNavCountKey | undefined) {
  if (!countKey) return undefined
  const value = counts[countKey]
  if (value === 0) return undefined
  return value
}
