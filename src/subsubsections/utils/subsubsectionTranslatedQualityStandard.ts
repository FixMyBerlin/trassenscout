import { QualityStandardEnum } from "@prisma/client"

export const subsubsectionTranslatedQualityStandard = {
  NO: "kein Standard",
  RSV: "Radschnellverbindung",
  RVR: "Radvorrangroute",
  RNBW: "RadNETZ BW Standard",
}

export const getSubsubsectionQualityStandardShortText = (sq: QualityStandardEnum | null) => {
  if (!sq) {
    return "k.A."
  } else if (sq === "NO") {
    return subsubsectionTranslatedQualityStandard[sq]
  } else {
    return sq
  }
}
