import { createContext } from "react"

type TProgressContext = {
  progress: number
  setProgress: (current: number) => void
}

type TPinContext = {
  pinPosition: {
    lng: number
    lat: number
  } | null
  setPinPosition: ({ lat, lng }: { lat: number; lng: number }) => void
}

export const ProgressContext = createContext<TProgressContext>({
  progress: 0,
  setProgress: () => {},
})

export const PinContext = createContext<TPinContext>({
  pinPosition: null,
  setPinPosition: () => {},
})
