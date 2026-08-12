import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { GeneralLogEntries } from "@/src/components/admin/log-entries/GeneralLogEntries"
import { ProjectLogEntries } from "@/src/components/admin/log-entries/ProjectLogEntries"
import { SpinnerIcon } from "@/src/components/core/components/Spinner"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"

function LoadingHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 px-4 text-sm text-gray-500">
      <SpinnerIcon size="5" />
      {children}
    </p>
  )
}

export function PageAdminLogEntries() {
  return (
    <>
      <AdminPageHeader title="Log-Einträge" />
      <div className="space-y-8">
        <Suspense fallback={<LoadingHint>Allgemeine Änderungen werden geladen…</LoadingHint>}>
          <GeneralLogEntries hideWhenEmpty={false} />
        </Suspense>
        <Suspense fallback={<LoadingHint>Projekt-Änderungen werden geladen…</LoadingHint>}>
          <AdminProjectLogEntries />
        </Suspense>
      </div>
    </>
  )
}

function AdminProjectLogEntries() {
  const {
    data: { projects },
  } = useSuspenseQuery(adminProjectsWithCountsQueryOptions())

  if (!projects.length) {
    return <p className="px-4 text-sm text-gray-500">Noch keine Projekte vorhanden.</p>
  }

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <Suspense
          key={project.id}
          fallback={<LoadingHint>Änderungen für {project.slug} werden geladen…</LoadingHint>}
        >
          <ProjectLogEntries
            projectId={project.id}
            projectSlug={project.slug}
            hideWhenEmpty={false}
          />
        </Suspense>
      ))}
    </div>
  )
}
