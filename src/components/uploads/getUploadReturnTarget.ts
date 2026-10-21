import { splitResolvedTo } from "@/src/shared/routing/resolvedTo"
import { isProjectScopedReturnPath } from "@/src/shared/routing/sanitizeReturnTo"

type ReturnTarget = {
  returnPath: string
  returnText: string
}

const isProjectRecordTarget = (pathname: string, search: Record<string, unknown> | undefined) => {
  const [, , section, recordId = ""] = pathname.split("/")
  return (
    search?.modalProjectRecordId !== undefined ||
    (section === "project-records" && /^\d+$/.test(recordId))
  )
}

export const getUploadReturnTarget = ({
  projectSlug,
  returnTo,
}: {
  projectSlug: string
  returnTo?: string
}) => {
  const uploadsPath = `/${projectSlug}/uploads`
  const { to: pathname, search } = splitResolvedTo(returnTo ?? "")

  if (!returnTo || !isProjectScopedReturnPath(pathname, projectSlug)) {
    return {
      returnPath: uploadsPath,
      returnText: "Zurück zu den Dokumenten",
    } satisfies ReturnTarget
  }

  return {
    returnPath: returnTo,
    returnText: isProjectRecordTarget(pathname, search)
      ? "Zurück zum Protokolleintrag"
      : pathname === uploadsPath
        ? "Zurück zu den Dokumenten"
        : "Zurück",
  } satisfies ReturnTarget
}
