export const externalShareUploadWhere = { collaborationUrl: null } as const

export const canExternallyShareUpload = (upload: { collaborationUrl: string | null }) =>
  upload.collaborationUrl === externalShareUploadWhere.collaborationUrl
