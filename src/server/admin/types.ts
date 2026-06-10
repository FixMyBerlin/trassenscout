import type { getAdminNavCounts } from "./adminNavCounts.server"

export type AdminNavCounts = Awaited<ReturnType<typeof getAdminNavCounts>>
