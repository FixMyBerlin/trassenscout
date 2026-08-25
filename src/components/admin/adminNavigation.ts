import {
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { linkOptions, type useMatchRoute } from "@tanstack/react-router"
import type { ComponentType, SVGProps } from "react"
import { shortTitle } from "@/src/components/core/components/text/titles"
import type { FileRouteTypes } from "@/src/routeTree.gen"
import type { AdminNavCounts } from "@/src/server/admin/types"

export type AdminNavCountKey = keyof AdminNavCounts

export type AdminNavTo = FileRouteTypes["to"]

export type AdminNavLink = {
  to: AdminNavTo
  params?: Record<string, string>
  search?: Record<string, string | undefined>
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

function adminProjectNavName(entity: string, feature: string) {
  return `${entity}: ${feature}`
}

/** Typed TanStack Router link options for admin sidebar items. */
export function adminNavLinkOptions(link: AdminNavLink) {
  return linkOptions({
    to: link.to,
    params: link.params,
    search: link.search,
  })
}

type MatchRoute = ReturnType<typeof useMatchRoute>

function isAdminNavLinkActive(matchRoute: MatchRoute, link: AdminNavLink) {
  return !!matchRoute({
    to: link.to,
    params: link.params,
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

/** Routes matched when switching the admin project selector. */
const adminProjectSwitchRoutes = [
  "/admin/projects/$projectSlug/subsubsection-extra-fields",
  "/admin/projects/$projectSlug/evaluations",
  "/admin/projects/$projectSlug/surveys/new",
  "/admin/projects/$projectSlug/surveys/$surveyId/responses/created",
  "/admin/projects/$projectSlug/surveys/$surveyId/responses/test",
  "/admin/projects/$projectSlug/surveys/$surveyId/responses",
  "/admin/projects/$projectSlug/surveys/$surveyId/edit",
  "/admin/projects/$projectSlug/surveys",
  "/admin/projects/$projectSlug/subsections/edit",
  "/admin/projects/$projectSlug/subsections/multiple-new",
  "/admin/projects/$projectSlug/subsections",
  "/$projectSlug/edit",
  "/$projectSlug/project-records",
  "/$projectSlug/tags",
  "/$projectSlug/quality-levels",
  "/$projectSlug/operators",
  "/$projectSlug/network-hierarchy",
  "/$projectSlug/subsection-status",
  "/$projectSlug/subsubsection-status",
  "/$projectSlug/acquisition-area-status",
  "/$projectSlug/subsubsection-infra",
  "/$projectSlug/subsubsection-special",
  "/$projectSlug/subsubsection-task",
  "/$projectSlug/subsubsection-infrastructure-type",
] as const satisfies readonly AdminNavTo[]

export function getAdminProjectSwitchTarget(
  matchRoute: MatchRoute,
  newProjectSlug: string,
): AdminNavLink {
  for (const to of adminProjectSwitchRoutes) {
    if (matchRoute({ to, fuzzy: false })) {
      return { to, params: { projectSlug: newProjectSlug } }
    }
  }

  return {
    to: "/admin/projects/$projectSlug/subsubsection-extra-fields",
    params: { projectSlug: newProjectSlug },
  }
}

export function buildAdminProjectSectionNavigation(projectSlug: string) {
  return [
    {
      name: "Zusätzliche Felder (Maßnahmen)",
      link: projectNavLink("/admin/projects/$projectSlug/subsubsection-extra-fields", projectSlug),
    },
    {
      name: "Auswertung",
      link: projectNavLink("/admin/projects/$projectSlug/evaluations", projectSlug),
    },
    ...buildAdminProjectNavigation(projectSlug),
  ] satisfies AdminNavChild[]
}

function buildAdminProjectNavigation(projectSlug: string) {
  return [
    {
      name: "Planungsabschnitte",
      link: projectNavLink("/admin/projects/$projectSlug/subsections", projectSlug),
    },
    {
      name: "Beteiligungen",
      link: projectNavLink("/admin/projects/$projectSlug/surveys", projectSlug),
    },
    {
      name: adminProjectNavName("Projekt", "Bearbeiten"),
      link: projectNavLink("/$projectSlug/edit", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Projekt", "Planungsabschnitte"),
      link: projectNavLink("/admin/projects/$projectSlug/subsections", projectSlug),
    },
    {
      name: adminProjectNavName("Projekt", "Protokolleinträge"),
      link: projectNavLink("/$projectSlug/project-records", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Projekt", "Beteiligungen"),
      link: projectNavLink("/$projectSlug/surveys", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Projekt", "Tags"),
      link: projectNavLink("/$projectSlug/tags", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Projekt", "Ausbaustandard"),
      link: projectNavLink("/$projectSlug/quality-levels", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Projekt", "Baulastträger"),
      link: projectNavLink("/$projectSlug/operators", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Projekt", "Netzstufe"),
      link: projectNavLink("/$projectSlug/network-hierarchy", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Planungsabschnitt", "Status"),
      link: projectNavLink("/$projectSlug/subsection-status", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Maßnahme", "Phase"),
      link: projectNavLink("/$projectSlug/subsubsection-status", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Maßnahme", "Infrastruktur"),
      link: projectNavLink("/$projectSlug/subsubsection-infra", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Maßnahme", "Besonderheit"),
      link: projectNavLink("/$projectSlug/subsubsection-special", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Maßnahme", "Maßnahmentyp"),
      link: projectNavLink("/$projectSlug/subsubsection-task", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Maßnahme", "Infrastrukturtyp"),
      link: projectNavLink("/$projectSlug/subsubsection-infrastructure-type", projectSlug),
      external: true,
    },
    {
      name: adminProjectNavName("Flächenerwerb", "Status"),
      link: projectNavLink("/$projectSlug/acquisition-area-status", projectSlug),
      external: true,
    },
  ] satisfies AdminNavChild[]
}

export type AdminQuickNavLink = {
  name: string
  link: AdminNavLink
  external?: true
}

export type AdminQuickNavMenu = {
  global: AdminQuickNavLink[]
  project?: {
    title: string
    links: AdminQuickNavLink[]
  }
}

export function adminQuickNavLinkKey(item: AdminQuickNavLink) {
  const { to, params, search } = item.link
  return [to, JSON.stringify(params), JSON.stringify(search), item.name].join("|")
}

function isAdminShellLink(link: AdminNavLink) {
  return link.to === "/admin" || link.to.startsWith("/admin/")
}

function collectAdminShellNavLinks(items: AdminNavChild[]): AdminQuickNavLink[] {
  const links: AdminQuickNavLink[] = []

  for (const item of items) {
    if (item.link && isAdminShellLink(item.link)) {
      links.push({ name: item.name, link: item.link })
    }

    if (item.children?.length) {
      links.push(...collectAdminShellNavLinks(item.children))
    }
  }

  return links
}

function buildGlobalAdminQuickNavLinks(): AdminQuickNavLink[] {
  const links: AdminQuickNavLink[] = [{ name: "Admin-Dashboard", link: { to: "/admin" } }]

  for (const item of buildAdminNavigation()) {
    if (item.link && item.external) {
      continue
    }

    if (item.link && isAdminShellLink(item.link)) {
      links.push({ name: item.name, link: item.link })
      continue
    }

    if (item.children?.length) {
      links.push(...collectAdminShellNavLinks(item.children))
    }
  }

  return links
}

function buildAdminProjectQuickNavLinks(projectSlug: string): AdminQuickNavLink[] {
  const links: AdminQuickNavLink[] = [
    {
      name: adminProjectNavName("Projekt", "Dashboard"),
      link: projectNavLink("/$projectSlug", projectSlug),
    },
    {
      name: adminProjectNavName("Projekt", "Admin-Liste"),
      link: { to: "/admin/projects", search: { project: projectSlug } },
    },
    {
      name: adminProjectNavName("Projekt", "Nutzer & Rechte"),
      link: { to: "/admin/memberships", search: { project: projectSlug } },
    },
    {
      name: adminProjectNavName("Projekt", "Auswertung"),
      link: projectNavLink("/admin/projects/$projectSlug/evaluations", projectSlug),
    },
  ]

  for (const item of buildAdminProjectNavigation(projectSlug)) {
    if (!item.link) continue

    links.push({
      name: item.name,
      link: item.link,
      external: item.external,
    })
  }

  return links
}

/** Quick-nav menu for the main-app admin overflow button (mirrors the admin sidebar). */
export function buildAdminQuickNavMenu(projectSlug?: string): AdminQuickNavMenu {
  const menu: AdminQuickNavMenu = { global: buildGlobalAdminQuickNavLinks() }

  if (projectSlug) {
    menu.project = {
      title: shortTitle(projectSlug),
      links: buildAdminProjectQuickNavLinks(projectSlug),
    }
  }

  return menu
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
        { name: "Log-Einträge", link: { to: "/admin/log-entries" } },
        {
          name: "System-Logs",
          link: { to: "/admin/system-log-entries" },
          countKey: "logEntries",
        },
        {
          name: "E-Mail-Templates",
          link: { to: "/admin/email-templates" },
          countKey: "emailTemplates",
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
        { name: "API-Tokens (MCP)", link: { to: "/admin/api-tokens" } },
        {
          name: "Vorlagen Formulare",
          link: { to: "/admin/form-templates" },
          countKey: "formTemplates",
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
