class PaginationArgumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PaginationArgumentError"
  }
}

const isInteger = (value: number) => typeof value === "number" && value % 1 === 0

type PaginateArgs<T> = {
  skip?: number
  take?: number
  maxTake?: number
  count: () => Promise<number>
  query: (args: { skip: number; take: number }) => Promise<T[]>
}

export async function paginate<T>({
  skip = 0,
  take = 0,
  maxTake = 250,
  count: countQuery,
  query,
}: PaginateArgs<T>) {
  if (!isInteger(skip)) {
    throw new PaginationArgumentError("`skip` argument must be a integer")
  }
  if (!isInteger(take)) {
    throw new PaginationArgumentError("`take` argument must be a integer")
  }
  if (!isInteger(maxTake)) {
    throw new PaginationArgumentError("`maxTake` argument must be a integer")
  }
  if (skip < 0) {
    throw new PaginationArgumentError("`skip` argument must be a positive number")
  }
  if (take < 0) {
    throw new PaginationArgumentError("`take` argument must be a positive number")
  }
  if (take > maxTake) {
    throw new PaginationArgumentError(
      "`take` argument must less than `maxTake` which is currently " + maxTake,
    )
  }

  const [count, items] = await Promise.all([countQuery(), query({ skip, take })])
  const hasMore = skip + take < count
  const nextPage = hasMore ? { take, skip: skip + take } : null
  const pageCount = take > 0 ? Math.floor((count + take - 1) / take) : 0

  return {
    items,
    nextPage,
    hasMore,
    pageCount,
    pageSize: take,
    from: count > 0 ? skip + 1 : 0,
    to: skip + items.length,
    count,
  }
}
