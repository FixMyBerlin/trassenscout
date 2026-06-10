import { createPageSearchSchema } from "@/src/shared/pagination/pageSearchSchema"

export const SYSTEM_LOG_ENTRIES_DEFAULT_PAGE_SIZE = 25

export const systemLogEntriesSearchSchema = createPageSearchSchema({
  defaultPageSize: SYSTEM_LOG_ENTRIES_DEFAULT_PAGE_SIZE,
})

export const GetSystemLogEntriesSchema = systemLogEntriesSearchSchema
