export const DASHBOARD_BOOKMARKS_LIMIT = 10

export const BOOKMARKS_DESCRIPTION =
  "Hier finden Sie Maßnahmen, die Sie selbst mit einem Lesezeichen versehen haben oder die jemand anderes für Sie markiert hat."

/** A project retained from elsewhere may have bookmarks off; it must not hide the others. */
export const bookmarksProjectSlug = (
  projects: { slug: string; bookmarksEnabled: boolean }[],
  projectSlug: string | undefined,
) => projects.find((project) => project.bookmarksEnabled && project.slug === projectSlug)?.slug
