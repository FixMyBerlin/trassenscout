import { styleText } from "node:util"

const prefix = "[predev]"

export function logOk(label: string) {
  console.log(styleText(["bold", "green"], `OK ${prefix} ${label}`))
}

export function logErr(label: string, message: string) {
  console.error(styleText(["bold", "red"], `ERROR ${prefix} ${label}:`), message)
}

export function logSkip(label: string, message: string) {
  console.log(styleText(["bold", "yellow"], `SKIP ${prefix} ${label}:`), message)
}

export function logWarn(label: string, message: string) {
  console.warn(styleText(["bold", "yellow"], `WARN ${prefix} ${label}:`), message)
}
