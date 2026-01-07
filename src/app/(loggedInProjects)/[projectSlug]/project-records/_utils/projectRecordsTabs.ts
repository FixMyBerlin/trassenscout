import { Route } from "next"

/**
 * Creates the tabs configuration for project records pages.
 * @param projectSlug - The project slug
 * @param showNeedsReviewTab - Whether to show the "Bestätigung erforderlich" tab (default: false)
 * @returns Array of tab configurations
 */
export const getProjectRecordsTabs = (projectSlug: string, showNeedsReviewTab: boolean = false) => {
  return [
    {
      name: "Alle Einträge",
      href: `/${projectSlug}/project-records` as Route,
    },
    ...(showNeedsReviewTab
      ? [
          {
            name: "Bestätigung erforderlich",
            href: `/${projectSlug}/project-records/needsreview` as Route,
          },
        ]
      : []),
  ]
}
