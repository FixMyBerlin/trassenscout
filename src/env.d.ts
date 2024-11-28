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
    S3_UPLOAD_SECRET: string

    FELT_TOKEN: `felt_pat_${string}`

    ADMIN_EMAIL: string

    TS_API_KEY: string
    MAILJET_APIKEY_PUBLIC: string
    MAILJET_APIKEY_PRIVATE: string
    NEXT_PUBLIC_APP_ENV: "development" | "staging" | "production"

    NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE: "START" | "SURVEY" | "MORE" | "FEEDBACK" | "EMAIL"
  }
}
