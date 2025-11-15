/**
 * Upload source identifiers for tracking which function/component triggered the S3 upload.
 * These values are stored in S3 object metadata to help identify the origin of uploads.
 */
export const uploadSource = {
  // Upload triggered by email attachment processing
  emailAttachment: "uploadEmailAttachment",
  // Upload triggered by the better-upload dropzone component
  dropzone: "uploadDropzone",
} as const
