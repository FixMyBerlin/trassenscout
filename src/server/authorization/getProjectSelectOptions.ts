import type { Project } from "@/src/prisma/generated/browser"

export const getProjectSelectOptions = (projects: Pick<Project, "id" | "slug" | "subTitle">[]) => {
  const result: [number | string, string][] = [["", "(Keine Auswahl)"]]
  projects.forEach((project) => {
    result.push([
      project.id,
      project.subTitle ? `${project.slug} — ${project.subTitle}` : project.slug,
    ])
  })
  return result
}
