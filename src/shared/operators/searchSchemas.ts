import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { createPageSearchSchema } from "@/src/shared/pagination/pageSearchSchema"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const OPERATORS_DEFAULT_PAGE_SIZE = 25

const operatorsPageSearchSchema = createPageSearchSchema({
  defaultPageSize: OPERATORS_DEFAULT_PAGE_SIZE,
})

export const operatorsSearchSchema = fromBackLinkSearchSchema.merge(operatorsPageSearchSchema)

export const GetOperatorsPaginatedSchema =
  ProjectSlugRequiredSchema.merge(operatorsPageSearchSchema)
