export type S3Config = {
  accessKeyId?: string
  secretAccessKey?: string
  bucket?: string
  region?: string
  rootFolder?: string
  endpoint?: string
  forcePathStyle?: boolean
}

export function getConfig(s3Config?: S3Config) {
  return {
    accessKeyId: s3Config?.accessKeyId ?? `${process.env.S3_UPLOAD_KEY}`,
    secretAccessKey: s3Config?.secretAccessKey ?? `${process.env.S3_UPLOAD_SECRET}`,
    bucket: s3Config?.bucket ?? `${process.env.S3_UPLOAD_BUCKET}`,
    region: s3Config?.region ?? "eu-central-1",
    rootFolder: s3Config?.rootFolder ?? `${process.env.S3_UPLOAD_ROOTFOLDER}`,
    endpoint: s3Config?.endpoint,
    forcePathStyle: s3Config?.forcePathStyle,
  }
}
