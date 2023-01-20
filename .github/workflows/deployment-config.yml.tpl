serviceName: trassenscout-staging
containers:
  nginx:
    command: []
    image: public.ecr.aws/n0p8j4k5/trassenscout/nginx:${GITHUB_SHA}
    ports:
      "80": HTTP
  app:
    command: []
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SESSION_SECRET_KEY: ${SESSION_SECRET_KEY}
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
