import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { uploadsListRoute } from "@/src/core/routes/uploadRoutes"
import { Route } from "next"

type ReturnTarget = {
  returnPath: Route
  returnText: string
}

export const parseReturnProjectRecordId = (value?: string) => {
  const parsedValue = Number(value)
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : undefined
}

export const getUploadReturnTarget = ({
  projectSlug,
  returnProjectRecordId,
}: {
  projectSlug: string
  returnProjectRecordId?: number
}): ReturnTarget => {
  if (returnProjectRecordId !== undefined) {
    return {
      returnPath: projectRecordDetailRoute(projectSlug, returnProjectRecordId),
      returnText: "Zurück zum Protokoll",
    }
  }

  return {
    returnPath: uploadsListRoute(projectSlug),
    returnText: "Zurück zu den Dokumenten",
  }
}
