import { maskExternalShareToken } from "@/src/shared/externalShare/externalShareUrls"

const SENSITIVE_PARAM = /([?&](?:token|inviteToken|email)=)[^&#]*/g

export const sanitizeTrackedHref = (href: string) =>
  maskExternalShareToken(href).replace(SENSITIVE_PARAM, "$1[redacted]")
