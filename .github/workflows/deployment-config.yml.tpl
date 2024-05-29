serviceName: ${SERVICE_NAME}
containers:
  nginx:
    command: []
    environment:
      ASSETS_BUCKET_HOST: ${ASSETS_BUCKET_HOST}
      ASSETS_BUCKET_PATH: ${ASSETS_BUCKET_PATH}
    image: public.ecr.aws/n0p8j4k5/trassenscout/nginx:${GITHUB_SHA}
    ports:
      "80": HTTP
  app:
    command: []
    environment:
      APP_ORIGIN: ${APP_ORIGIN}
      NEXT_PUBLIC_APP_ORIGIN: ${NEXT_PUBLIC_APP_ORIGIN}
      DATABASE_URL: ${DATABASE_URL}
      SESSION_SECRET_KEY: ${SESSION_SECRET_KEY}
      MAILJET_APIKEY_PUBLIC: ${MAILJET_APIKEY_PUBLIC}
      MAILJET_APIKEY_PRIVATE: ${MAILJET_APIKEY_PRIVATE}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      S3_UPLOAD_KEY: ${S3_UPLOAD_KEY}
      S3_UPLOAD_SECRET: ${S3_UPLOAD_SECRET}
      S3_UPLOAD_BUCKET: ${S3_UPLOAD_BUCKET}
      S3_UPLOAD_REGION: ${S3_UPLOAD_REGION}
      S3_UPLOAD_ROOTFOLDER: ${S3_UPLOAD_ROOTFOLDER}
      FELT_TOKEN: ${FELT_TOKEN}
      TS_API_KEY: ${TS_API_KEY}
    image: public.ecr.aws/n0p8j4k5/trassenscout/app:${GITHUB_SHA}
    ports:
      "3000": HTTP
publicEndpoint:
  containerName: nginx
  containerPort: 80
  healthCheck:
    healthyThreshold: 2
    intervalSeconds: 20
    path: /health
    successCodes: 200-499
    timeoutSeconds: 4
    unhealthyThreshold: 2
