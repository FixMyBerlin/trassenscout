import { Route } from "next"

type QueryValue = string | number | undefined
export const RETURN_TO_PARAM = "returnTo"
export const RETURN_PROJECT_RECORD_ID_PARAM = "returnProjectRecordId"

export type ReturnToOptions = {
  returnTo?: string
}

export type ReturnToSearchParams = {
  returnTo?: string
}

export const buildRouteWithQuery = (
  pathname: string,
  queryParams: Record<string, QueryValue>,
): Route => {
  const searchParams = new URLSearchParams()

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  })

  const search = searchParams.toString()
  return (search ? `${pathname}?${search}` : pathname) as Route
}

const parseRouteAsUrl = (route: Route) => {
  const baseUrl = "http://localhost"
  return new URL(String(route), baseUrl)
}

export const appendQueryParamIfMissing = (
  route: Route,
  key: string,
  value?: string,
): Route => {
  if (!value) return route

  const url = parseRouteAsUrl(route)
  if (!url.searchParams.has(key)) {
    url.searchParams.set(key, value)
  }

  return `${url.pathname}${url.search}` as Route
}

export const parseProjectScopedReturnTo = (value: string | undefined, projectSlug: string) => {
  if (!value) return undefined

  let decodedValue = value
  try {
    decodedValue = decodeURIComponent(value)
  } catch {
    return undefined
  }

  if (!decodedValue.startsWith("/")) return undefined

  const projectRoot = `/${projectSlug}`
  const isWithinProjectScope =
    decodedValue === projectRoot || decodedValue.startsWith(`${projectRoot}/`)
  if (!isWithinProjectScope) return undefined

  return decodedValue as Route
}
