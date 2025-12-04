import { Langfuse } from "langfuse"

export const langfuse = new Langfuse({
  environment: process.env.NODE_ENV,
})
