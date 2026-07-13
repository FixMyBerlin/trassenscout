import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import { GetOperatorsPaginatedSchema } from "@/src/shared/operators/searchSchemas"
import { getOperatorsPaginated } from "./operators.server"
import { getOperatorMaxOrder } from "./queries/getOperatorMaxOrder.server"

const GetOperatorMaxOrderSchema = z.object({
  projectSlug: z.string(),
})

export const getOperatorsPaginatedFn = createServerFn({ method: "GET" })
  .validator(GetOperatorsPaginatedSchema)
  .handler(({ data }) => getOperatorsPaginated(getRequestHeaders(), data))

export const getOperatorMaxOrderFn = createServerFn({ method: "GET" })
  .validator(GetOperatorMaxOrderSchema)
  .handler(({ data }) => getOperatorMaxOrder(getRequestHeaders(), data.projectSlug))
