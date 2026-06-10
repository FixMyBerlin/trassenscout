import { setCookie } from "@tanstack/react-start/server"
import { parseSetCookieHeader } from "better-auth/cookies"
import { auth } from "./auth.server"

export async function forwardAuthAndApplyCookies(request: Request) {
  const response = await auth.handler(request)
  const setCookieHeaders = response.headers.getSetCookie()
  if (setCookieHeaders.length === 0) return response

  for (const setCookieHeader of setCookieHeaders) {
    const parsed = parseSetCookieHeader(setCookieHeader)
    parsed.forEach((value, key) => {
      if (!key) return

      try {
        setCookie(key, decodeURIComponent(value.value), {
          domain: value.domain,
          httpOnly: value.httponly,
          maxAge: value["max-age"],
          path: value.path,
          sameSite: value.samesite,
          secure: value.secure,
        })
      } catch {
        // setCookie can be unavailable in some non-request server contexts.
      }
    })
  }

  return response
}
