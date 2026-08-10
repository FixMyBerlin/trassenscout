import type { AdminBadgeVariant } from "@/src/components/admin/AdminBadge"

export const logLevelBadgeVariant: Record<"INFO" | "WARN" | "ERROR", AdminBadgeVariant> = {
  INFO: "yellow",
  WARN: "pink",
  ERROR: "red",
}
