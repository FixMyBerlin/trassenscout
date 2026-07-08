type TranslatedMessages = { [key: string]: string }

export function translateServerError(raw: string) {
  const key = raw.replaceAll("\n", "")
  return errorMessageTranslations[key] ?? raw
}

export type UniqueConstraintErrorInfo = {
  model: string
  operation: string
  fields: string[]
}

export function parseUniqueConstraintError(raw: string): UniqueConstraintErrorInfo | null {
  const invocation = raw.match(/Invalid `\w+\.(\w+)\.(\w+)\(\)` invocation/)
  const fields = raw.match(/Unique constraint failed on the fields: \(([^)]*)\)/)
  if (!invocation || !fields) return null
  return {
    model: invocation[1]!,
    operation: invocation[2]!,
    fields: fields[1]!.split(",").map((field) => field.trim().replace(/[`"]/g, "")),
  }
}

const emailTakenContact =
  "Diese E-Mail-Adresse ist bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden."
const orderTakenSubsection =
  "Der Wert für 'Reihenfolge' wird bereits von einer anderen Teilstrecke verwendet. Bitte wählen Sie einen anderen Wert; er kann auch viel höher sein wie beispielweise 50."
const slugTakenProject =
  "Dieses URL-Segment ist bereits vergeben. Ein URL-Segment darf nur einmalig pro Trasse zugewiesen werden."
// "Kürzel" matches the slug field label in the Maßnahmen form (subsubsectionFieldTranslations.slug)
const slugTakenSubsection =
  "Dieses Kürzel ist bereits vergeben. Ein Kürzel darf nur einmalig pro Planungsabschnitt zugewiesen werden."
const slugTakenOperator =
  "Dieses URL-Segment ist bereits für eine anderen Baulastträger vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden."
const slugTakenQualityLevel =
  "Dieses URL-Segment ist bereits für einen anderen Ausbaustandard vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden."
const slugTakenStatus =
  "Dieses URL-Segment ist bereits für einen anderen Status vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden."

/** Keyed by `model.operation:constraintFields` as parsed by `parseUniqueConstraintError`. */
const uniqueConstraintTranslations: TranslatedMessages = {
  "invite.create:email,projectId": "Diese E-Mail-Adresse ist bereits eingeladen.",
  "user.create:email,projectId": "Diese E-Mail-Adresse ist bereits registriert.",
  "contact.create:projectId,email": emailTakenContact,
  "contact.update:projectId,email": emailTakenContact,
  "project.create:slug":
    "Dieses URL-Segment ist bereits für eine andere Trasse vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
  "subsection.create:projectId,order": orderTakenSubsection,
  "subsection.update:projectId,order": orderTakenSubsection,
  "subsection.create:projectId,slug": slugTakenProject,
  "subsection.update:projectId,slug": slugTakenProject,
  "subsubsection.create:subsectionId,slug": slugTakenSubsection,
  "subsubsection.update:subsectionId,slug": slugTakenSubsection,
  "operator.create:projectId,slug": slugTakenOperator,
  "operator.update:projectId,slug": slugTakenOperator,
  "qualityLevel.create:projectId,slug": slugTakenQualityLevel,
  "qualityLevel.update:projectId,slug": slugTakenQualityLevel,
  "subsubsectionStatus.create:projectId,slug": slugTakenStatus,
  "subsubsectionStatus.update:projectId,slug": slugTakenStatus,
}

export function translateUniqueConstraintError(info: UniqueConstraintErrorInfo) {
  return (
    uniqueConstraintTranslations[`${info.model}.${info.operation}:${info.fields.join(",")}`] ??
    "Dieser Wert ist bereits vergeben und darf nur einmal verwendet werden."
  )
}

const errorMessageTranslations: TranslatedMessages = {
  // NETWORK / SERVER ERRORS (e.g. 502 Bad Gateway from staging)
  Error: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
  "Bad Gateway":
    "Der Server ist vorübergehend nicht erreichbar. Bitte speichern Sie Ihre Änderungen und versuchen Sie es in Kürze erneut.",
  // UPLOAD ERRORS
  // Keys match @better-upload/client `error.message` (onError) and per-file
  // `progress.error.message` verbatim — no "Error: " prefix. Keep the size copy in
  // sync with S3_MAX_FILE_SIZE_BYTES in shared/uploads/config.ts. The file-count limit
  // differs per route (S3_MAX_FILES_PROJECT / S3_MAX_FILES_SURVEY), so the copy stays generic.
  "Too many files.":
    "Zu viele Dateien. Bitte reduzieren Sie die Anzahl der Dateien und versuchen Sie es erneut.",
  "One or more files are too large.":
    "Eine oder mehrere Dateien sind zu groß. Die maximale Dateigröße beträgt 50 MB.",
  "One or more files exceed the S3 limit of 5GB. Use multipart upload for larger files.":
    "Eine oder mehrere Dateien überschreiten das Limit von 5 GB.",
  "One or more files have an invalid file type.":
    "Eine oder mehrere Dateien haben einen ungültigen Dateityp.",
  "Failed to upload file to S3.":
    "Die Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
  "Upload aborted.": "Der Upload wurde abgebrochen.",
  // Survey (Beteiligung) session rejections — now surfaced to public users via RejectUpload
  "Survey response not found or does not belong to the provided session":
    "Die Sitzung ist ungültig oder abgelaufen. Bitte laden Sie die Seite neu und versuchen Sie es erneut.",
  "Missing or invalid surveyResponseId or surveySessionId":
    "Die Sitzung ist ungültig oder abgelaufen. Bitte laden Sie die Seite neu und versuchen Sie es erneut.",
}
