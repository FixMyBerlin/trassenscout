import { PromiseReturnType } from "blitz"
import getCurrentUser from "./queries/getCurrentUser"

export type CurrentUser = NonNullable<PromiseReturnType<typeof getCurrentUser>>
