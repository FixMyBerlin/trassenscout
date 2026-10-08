import type { getExternalShare } from "./externalShare.server"

export type ExternalShareUpload = Awaited<ReturnType<typeof getExternalShare>>["uploads"][number]
