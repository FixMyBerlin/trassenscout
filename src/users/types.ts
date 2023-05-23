import getCurrentUser from "./queries/getCurrentUser"

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
