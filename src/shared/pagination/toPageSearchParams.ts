type ToPageSearchParamsInput = {
  page: number
  pageSize: number
}

type ToPageSearchParamsOptions = {
  defaultPageSize?: number
}

export function toPageSearchParams(
  { page, pageSize }: ToPageSearchParamsInput,
  { defaultPageSize = 25 }: ToPageSearchParamsOptions = {},
) {
  return {
    ...(page > 1 ? { page } : {}),
    ...(pageSize !== defaultPageSize ? { pageSize } : {}),
  }
}
