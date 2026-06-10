type ReturnTarget = {
  returnPath: string
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
  returnTo?: string
  returnProjectRecordId?: number
}) => {
  if (returnTo) {
    return {
      returnPath: returnTo,
      returnText: "Zurück",
    } satisfies ReturnTarget
  }

  if (returnProjectRecordId !== undefined) {
    return {
      returnPath: `/${projectSlug}/project-records/${returnProjectRecordId}`,
      returnText: "Zurück zum Protokoll",
    } satisfies ReturnTarget
  }

  return {
    returnPath: `/${projectSlug}/uploads`,
    returnText: "Zurück zu den Dokumenten",
  } satisfies ReturnTarget
}
