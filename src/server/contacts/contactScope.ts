export function contactInProjectWhere(projectSlug: string, id: number) {
  return {
    id,
    project: { slug: projectSlug },
  } as const
}
