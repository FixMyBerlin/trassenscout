export const externalSharePagePath = (token: string) => `/share/${token}`

export const externalShareUploadUrl = (token: string, uploadId: number) =>
  `/api/share/${token}/uploads/${uploadId}`

export const externalShareUploadDownloadUrl = (token: string, uploadId: number) =>
  `${externalShareUploadUrl(token, uploadId)}?download`

export const externalShareGeojsonUrl = (token: string) => `/api/share/${token}/subsubsections`

/** The token is the password to the share, so it must never reach analytics or logs. */
export const maskExternalShareToken = (href: string) =>
  href.replace(/^\/share\/[^/?#]+/, "/share/[token]")
