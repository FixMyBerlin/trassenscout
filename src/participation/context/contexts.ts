import { createContext } from "react"

type TProgressContext = {
  progress: { current: number; total: number }
  setProgress: ({ current, total }: { current: number; total: number }) => void
}

type TPinContext = {
  pinPosition: {
    lng: number
    lat: number
  } | null
  setPinPosition: ({ lng, lat }: { lng: number; lat: number }) => void
}

export const ProgressContext = createContext<TProgressContext>({
  progress: { current: 0, total: 0 },
  setProgress: () => {},
})

export const PinContext = createContext<TPinContext>({
  pinPosition: null,
  setPinPosition: () => {},
})
