namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: `postgresql://${string}`

    DATABASE_URL_PRODUCTION: `postgresql://${string}`
    DATABASE_URL_STAGING: `postgresql://${string}`

    S3_UPLOAD_ROOTFOLDER:
      | "upload-production"
      | "upload-staging"
      | "upload-tinkering"
      | "upload-localdev"

    S3_UPLOAD_KEY: string
    S3_UPLOAD_REGION: "eu-central-1"
    S3_UPLOAD_SECRET: string

    FELT_TOKEN: `felt_pat_${string}`

    ADMIN_EMAIL: string

    TS_API_KEY: string
    MAILJET_APIKEY_PUBLIC: string
    MAILJET_APIKEY_PRIVATE: string
  }
}
