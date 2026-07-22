const appColumnClassName = "relative mx-auto w-full max-w-480 grow"
const appBorderClassName = "app-column:border-x border-gray-200"

/**
 * Top-nav column (logged-in, marketing, content, error pages).
 * Default `overflow-x-hidden`; LayoutContent overrides to `overflow-x-clip` (sticky TOC).
 */
export const appShellClassName = `${appColumnClassName} ${appBorderClassName} flex min-h-dvh flex-col overflow-x-hidden`

/** Side-nav column (admin): sidebar + main share one bordered max-width. */
export const appShellRowClassName = `${appColumnClassName} ${appBorderClassName} flex min-h-dvh`

/** Main inside a shell — fills height below nav. */
export const appMainClassName = "flex min-h-0 w-full flex-1 flex-col"
