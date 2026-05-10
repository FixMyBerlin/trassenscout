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
  returnTo,
  returnProjectRecordId,
}: {
  projectSlug: string
  returnTo?: Route
  returnProjectRecordId?: number
}): ReturnTarget => {
  if (returnTo) {
    return {
      returnPath: returnTo,
      returnText: "Zurück",
    }
  }

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
