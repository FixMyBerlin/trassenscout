import { createContext } from "react"

export const ProgressContext = createContext({ current: 0, total: 0 })
export const PinContext = createContext(null)
