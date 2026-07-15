export type ContactModalPreview = {
  type: "contact"
  contact: {
    id: number
    firstName: string | null
    lastName: string | null
  }
}

export type ProjectRecordModalPreview = {
  type: "projectRecord"
  projectRecord: {
    id: number
    title: string
  }
}

export type UploadModalPreview = {
  type: "upload"
  upload: {
    id: number
    title: string
    mimeType: string | null
    externalUrl: string
    collaborationUrl: string | null
  }
}

export type ProjectModalPreview =
  | ContactModalPreview
  | ProjectRecordModalPreview
  | UploadModalPreview

type ProjectModalHistoryState = {
  projectModalPreview?: ProjectModalPreview
}

export function getProjectModalPreview(state: unknown) {
  return (state as ProjectModalHistoryState | undefined)?.projectModalPreview
}
