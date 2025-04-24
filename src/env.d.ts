namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: `postgresql://${string}`

    readonly DATABASE_URL_PRODUCTION: `postgresql://${string}`
    readonly DATABASE_URL_STAGING: `postgresql://${string}`

    readonly S3_UPLOAD_ROOTFOLDER: "upload-production" | "upload-staging" | "upload-localdev"

    readonly S3_UPLOAD_KEY: string
    readonly S3_UPLOAD_SECRET: string

    readonly ADMIN_EMAIL: string

    readonly TS_API_KEY: string
    readonly MAILJET_APIKEY_PUBLIC: string
    readonly MAILJET_APIKEY_PRIVATE: string
    readonly NEXT_PUBLIC_APP_ENV: "development" | "staging" | "production"
    readonly SESSION_SECRET_KEY: string

    readonly NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE:
      | "START"
      | "SURVEY"
      | "MORE"
      | "FEEDBACK"
      | "EMAIL"
    readonly NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE_NEW: "PART1" | "PART2" | "PART3" | "END"
    readonly NEXT_PUBLIC_APP_ORIGIN?:
      | "http://127.0.0.1:5000" // for `npm run start`
      | "https://staging.trassenscout.de"
      | "https://trassenscout.de"
  }
}
