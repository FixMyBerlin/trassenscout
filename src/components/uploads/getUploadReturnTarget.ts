import { parseProjectModalSearch } from "@/src/shared/projectModals/searchSchemas"
import { splitResolvedTo } from "@/src/shared/routing/resolvedTo"

type ReturnTarget = {
  returnPath: string
  returnText: string
}

const isProjectRecordTarget = (pathname: string, search: Record<string, unknown> | undefined) => {
  const [, , section, recordId = ""] = pathname.split("/")
  return (
    // Same rules as the modal host: a record modal needs its view, and two open modals close both
    parseProjectModalSearch(search).modalProjectRecordId !== undefined ||
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

  if (!returnTo) {
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
