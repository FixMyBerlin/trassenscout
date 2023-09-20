export const getProjectSelectOptions = (projects: any) => {
  const result: [number | string, string][] = [["", "(Keine Auswahl)"]]
  projects.forEach((p: any) => {
    result.push([p.id, [p.slug, p.subTitle].join(": ")])
  })
  return result
}
