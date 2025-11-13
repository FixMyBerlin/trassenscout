import { Langfuse } from "langfuse"

export const langfuse = new Langfuse({
  environment: process.env.NEXT_PUBLIC_APP_ENV,
})
