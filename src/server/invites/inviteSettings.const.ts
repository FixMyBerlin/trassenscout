import { isProduction } from "@/src/core/utils/isEnv"

export const INVITE_DAYS_TO_EXPIRED = isProduction ? 7 : 1
export const INVITE_DAYS_TO_DELETION = isProduction ? 30 : 2
